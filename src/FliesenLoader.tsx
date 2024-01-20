import {useEffect, useState} from "react";
import {EVENTS_PER_FILE, fliesentischSizeMapping, MAX_EVENT_ID, MIN_EVENT_ID} from "./constants.ts";


type TileEvent = {
    id: number,
    x: number,
    y: number,
    color: string,
    created: string,
}

function copyAndResizeCanvas(canvas: string[][], width: number, height: number): string[][] {
    // new canvas will have white blank space to the right and bottom
    const resizedCanvas = new Array(width).fill("ffffff").map(() => new Array(height).fill("ffffff"));
    const w = Math.min(canvas.length, width);
    const h = Math.min(canvas[0].length, height);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            resizedCanvas[x][y] = canvas[x][y];
        }
    }
    return resizedCanvas;
}

let tileEventCache: { [key: string] : TileEvent} = {}

async function fetchTileEvents(file_url: string): Promise<TileEvent[]> {
    // if (id < MIN_EVENT_ID || id > MAX_EVENT_ID) {
    //     // more than 2132410 events do not exist
    //     console.error(`Invalid event ID ${id} requested.`)
    //     return [];
    // }
    // const file_id = Math.floor(id / EVENTS_PER_FILE);
    // const file_url = `/src/assets/tile_events/${file_id}.csv`;
    // if (file_url in tileEventCache) {
    //     return tileEventCache[file_url];
    // }
    const tile_events: TileEvent[] = []
    await fetch(file_url).then(response => response.text()).then(text => {
        const lines = text.split('\n');
        for (const line of lines) {
            const parts = line.split(';');
            const tile_event = {
                "id": parseInt(parts[0]),
                "x": parseInt(parts[1]),
                "y": parseInt(parts[2]),
                "color": parts[3],
                "created": parts[4],
            };
            if (!isNaN(tile_event.id)) {
                tile_events.push(tile_event);
            }
        }
    });
    return tile_events;
}

function useFliesentischAt(eventID: number): { fliesentisch: string[][], date: Date } {
    if (isNaN(eventID) || eventID < MIN_EVENT_ID) {
        eventID = MIN_EVENT_ID;
    } else if (eventID > MAX_EVENT_ID) {
        eventID = MAX_EVENT_ID;
    }
    const [fliesentisch, setFliesentisch] = useState<string[][]>([[]]);
    const [snapshot, setSnapshot] = useState<string[][]>([[]]);
    const [tileEvents, setTileEvents] = useState<TileEvent[]>([]);
    const [date, setDate] = useState<Date>(new Date(0));
    const [fileID, setFileID] = useState(0);
    const [desiredDimension, setDesiredDimension] = useState([0, 0]);
    const [lastEventID, setLastEventID] = useState<number>(-1);

    // const [lastDrawnEventID, setLastDrawnEventID] = useState<number>(-1);
    // const [lastSnapshotID, setLastSnapshotID] = useState<number>(-1);
    // const [redrawRequired, setRedrawRequired] = useState<boolean>(true);

    useEffect(() => {
        // get the fliesentisch size for the given eventID
        for (const fliesentischSize of fliesentischSizeMapping) {
            if (eventID >= fliesentischSize.minEventId && eventID <= fliesentischSize.maxEventId) {
                const newDimension = [fliesentischSize.width, fliesentischSize.height];
                if (newDimension[0] !== desiredDimension[0] || newDimension[1] !== desiredDimension[1]) {
                    setDesiredDimension(newDimension);
                }
            }
        }
    }, [eventID]);

    // useEffect(() => {
    //     // resize the fliesentisch if necessary
    //     if (fliesentisch.length === 0 || fliesentisch[0].length === 0 || desiredDimension[0] === 0 || desiredDimension[1] === 0) {
    //         return;
    //     }
    //     if (fliesentisch.length < desiredDimension[0] || fliesentisch[0].length < desiredDimension[1]) {
    //         setFliesentisch(resizeCanvas(fliesentisch, desiredDimension[0], desiredDimension[1]));
    //     }
    // }, [desiredDimension, fliesentisch]);

    const newFileID = Math.floor(eventID / EVENTS_PER_FILE);
    if (newFileID !== fileID) {
        setFileID(newFileID);
    }

    useEffect(() => {
        let isCancelled = false;
        fetch(`/src/assets/canvas_snapshots/${fileID}.gzip`).then(response => {
            const ds = new DecompressionStream('gzip');
            if (response.body === null) {
                throw new Error("Response body is null");
            }
            const stream = response.body.pipeThrough(ds);
            return new Response(stream);
        }).then(response => response.blob())
            .then(blob => blob.text())
            .then(text => {
                if (isCancelled) {
                    return;
                }
                setSnapshot(JSON.parse(text));
            });
        fetchTileEvents(`/src/assets/tile_events/${fileID}.csv`).then(tile_events => {
            if (isCancelled) {
                return;
            }
            setTileEvents(tile_events);
        });
        return () => {
            isCancelled = true
        }
    }, [fileID]);

    useEffect(() => {
        let lastDate = new Date(0);
        const newFliesentisch = copyAndResizeCanvas(snapshot, desiredDimension[0], desiredDimension[1]);
        if (newFliesentisch.length === 0 || newFliesentisch[0].length === 0) {
            return;
        }
        for (const tile_event of tileEvents) {
            if (tile_event.id > eventID || tile_event.x >= newFliesentisch.length || tile_event.y >= newFliesentisch[0].length) {
                break;
            }
            newFliesentisch[tile_event.x][tile_event.y] = tile_event.color;
            lastDate = new Date(tile_event.created);
        }
        setDate(lastDate);
        setFliesentisch(newFliesentisch);
        setLastEventID(eventID);
    }, [eventID, tileEvents, snapshot, desiredDimension]);

    // useEffect(() => {
    //     let isCancelled = false;
    //     fetchTileEvents(`/src/assets/tile_events/${fileID}.csv`).then(tile_events => {
    //         let lastDate = new Date(0);
    //         // const newFliesentisch = [...fliesentisch];
    //         // for (const tile_event of tile_events) {
    //         //     if (tile_event.id > eventID || isCancelled) {
    //         //         break;
    //         //     }
    //         //     // newFliesentisch[tile_event.x][tile_event.y] = tile_event.color;
    //         //     // events.push(tile_event);
    //         //     lastDate = new Date(tile_event.created);
    //         // }
    //         if (isCancelled) {
    //             return;
    //         }
    //         setDate(lastDate);
    //         // setFliesentisch(fliesentisch => {
    //         //     const newTisch = [...fliesentisch];
    //         //     for (const tile_event of events) {
    //         //         newTisch[tile_event.x][tile_event.y] = tile_event.color;
    //         //     }
    //         //     return newTisch;
    //         // });
    //     });
    //     return () => {
    //         isCancelled = true
    //     }
    // }, [eventID]);

    // let newFliesentisch = [...fliesentisch]
    //
    // useEffect(() => {
    //     let isCancelled = false;
    //     const file_id = Math.floor(eventID / EVENTS_PER_FILE);
    //     if (lastSnapshotID !== file_id) {
    //         setRedrawRequired(true);
    //         setLastSnapshotID(file_id);
    //     }
    //     if (lastDrawnEventID > eventID) {
    //         setRedrawRequired(true);
    //     }
    // }, [eventID]);
    //
    // useEffect(() => {
    //     function fetchAndDrawSnapshot() {
    //         return fetch(`/src/assets/canvas_snapshots/${file_id}.gzip`).then(response => {
    //             const ds = new DecompressionStream('gzip');
    //             if (response.body === null) {
    //                 throw new Error("Response body is null");
    //             }
    //             const stream = response.body.pipeThrough(ds);
    //             return new Response(stream);
    //         }).then(response => response.blob())
    //             .then(blob => blob.text())
    //             .then(text => {
    //                 newFliesentisch = JSON.parse(text);
    //                 if (newFliesentisch.length !== desiredDimension[0] || newFliesentisch[0].length !== desiredDimension[1]) {
    //                     newFliesentisch = resizeCanvas(newFliesentisch, desiredDimension[0], desiredDimension[1]);
    //                 }
    //                 // if (isCancelled) {
    //                 //     return;
    //                 // }
    //                 setRedrawRequired(false);
    //             });
    //     }
    //
    //     function fetchAndDrawEvents() {
    //         return fetchTileEvents(`/src/assets/tile_events/${file_id}.csv`).then(tile_events => {
    //             let lastDate = new Date(0);
    //             for (const tile_event of tile_events) {
    //                 if (tile_event.id > eventID || isCancelled || tile_event.x >= newFliesentisch.length || tile_event.y >= newFliesentisch[0].length) {
    //                     break;
    //                 }
    //                 newFliesentisch[tile_event.x][tile_event.y] = tile_event.color;
    //                 lastDate = new Date(tile_event.created);
    //             }
    //             if (isCancelled) {
    //                 return;
    //             }
    //             setDate(lastDate);
    //             setRedrawRequired(false);
    //         });
    //     }
    //
    //     // fetchAndDrawSnapshot().then(() => setFliesentisch(newFliesentisch));
    //
    //     if (redrawRequired) {
    //         fetchAndDrawSnapshot().then(fetchAndDrawEvents).then(() => {
    //             setLastDrawnEventID(eventID);
    //             setFliesentisch(newFliesentisch)
    //         });
    //     } else {
    //         fetchAndDrawEvents().then(() => {
    //             setLastDrawnEventID(eventID);
    //             setFliesentisch(newFliesentisch)
    //         });
    //     }
    //     return () => {
    //         // isCancelled = true
    //     };
    // }, [redrawRequired]);
    return {fliesentisch, date};
}

export default useFliesentischAt;