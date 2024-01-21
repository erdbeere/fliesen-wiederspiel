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

async function fetchTileEvents(file_url: string): Promise<TileEvent[]> {
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
    }, [eventID, tileEvents, snapshot, desiredDimension]);

    return {fliesentisch, date};
}

export default useFliesentischAt;