import {useIndexedDB} from "react-indexed-db-hook";
import {useEffect, useState} from "react";
import {EVENTS_PER_FILE, fliesentischSizeMapping, MAX_EVENT_ID, MIN_EVENT_ID} from "./constants.ts";


function resizeCanvas(canvas: string[][], width: number, height: number): string[][] {
    // new canvas will have white blank space to the right and bottom
    const resizedCanvas = new Array(width).fill("ffffff").map(() => new Array(height).fill("ffffff"));
    const w = canvas.length;
    const h = canvas[0].length;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            resizedCanvas[x][y] = canvas[x][y];
        }
    }
    return resizedCanvas;
}


function useFliesentischAt(eventID: number): string[][] {
    if (isNaN(eventID) || eventID < MIN_EVENT_ID) {
        eventID = MIN_EVENT_ID;
    } else if (eventID > MAX_EVENT_ID) {
        eventID = MAX_EVENT_ID;
    }
    const {openCursor, add} = useIndexedDB('tile_events');
    const [fliesentisch, setFliesentisch] = useState<string[][]>([[]]);
    const [lastDrawnEventID, setLastDrawnEventID] = useState<number>(-1);
    const [lastSnapshotID, setLastSnapshotID] = useState<number>(-1);
    const [redrawRequired, setRedrawRequired] = useState<boolean>(true);

    let desiredDimension = [0, 0];
    // get the fliesentisch size for the given eventID
    for (const fliesentischSize of fliesentischSizeMapping) {
        if (eventID >= fliesentischSize.minEventId && eventID <= fliesentischSize.maxEventId) {
            desiredDimension = [fliesentischSize.width, fliesentischSize.height];
        }
    }

    const newFliesentisch = [...fliesentisch]

    useEffect(() => {
        const file_id = Math.floor(eventID / EVENTS_PER_FILE);
        if (lastSnapshotID !== file_id) {
            setRedrawRequired(true);
            setLastSnapshotID(file_id);
        }
        if (lastDrawnEventID > eventID) {
            setRedrawRequired(true);
        }

        function fetchAndDrawSnapshot() {
            return fetch(`/src/assets/canvas_snapshots/${file_id}.gzip`).then(response => {
                const ds = new DecompressionStream('gzip');
                if (response.body === null) {
                    throw new Error("Response body is null");
                }
                const stream = response.body.pipeThrough(ds);
                return new Response(stream);
            }).then(response => response.blob())
                .then(blob => blob.text())
                .then(text => {
                    let newFliesentisch = JSON.parse(text);
                    if (newFliesentisch.length !== desiredDimension[0] || newFliesentisch[0].length !== desiredDimension[1]) {
                        newFliesentisch = resizeCanvas(newFliesentisch, desiredDimension[0], desiredDimension[1]);
                    }
                    setFliesentisch(newFliesentisch);
                    setRedrawRequired(false);
                });
        }

        function fetchAndDrawEvents() {

        }

        if (redrawRequired) {
            fetchAndDrawSnapshot();
        }
        // setFliesentisch(newFliesentisch);
        // openCursor(event => {
        //     const cursor = event.target.result;
        //     if (!cursor) {
        //         setFliesentisch(newFliesentisch);
        //         return;
        //     }
        //     const tile_event = cursor.value;
        //     if (!tile_event) {
        //         return;
        //     }
        //     // console.log(tile_event);
        //     newFliesentisch[tile_event.x][tile_event.y] = tile_event.color;
        //     cursor.continue();
        //     // setFliesentisch(JSON.stringify(tile_event));
        // }, IDBKeyRange.bound(0, eventID));
    }, [eventID]);
    return fliesentisch;
}

export default useFliesentischAt;