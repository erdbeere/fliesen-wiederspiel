import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {DBConfig} from "./DBConfig";
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import FliesenCanvas from "./FliesenCanvas";
import Slider from "./Slider.tsx";
import useFliesentischAt from "./FliesenLoader.tsx";
import {EVENTS_PER_FILE, fliesentischSizeMapping, MAX_EVENT_ID, MIN_EVENT_ID} from "./constants.ts";

initDB(DBConfig);

type TileEvent = {
    id: number,
    x: number,
    y: number,
    color: string,
    created: string,
}

function getTileEventFileUrl(id: number): string {
    if (id < MIN_EVENT_ID || id > MAX_EVENT_ID) {
        // more than 2132410 events do not exist
        console.error(`Invalid event ID ${id} requested.`)
        return "";
    }
    const file_id = Math.floor(id / EVENTS_PER_FILE);
    return `/src/assets/tile_events/${file_id}.csv`;
}

async function fetchAndSaveAllTileEvents(start_id: number) {
    // const {add} = useIndexedDB('tile_events');
    const file_urls = [];
    const start_file_id = Math.floor(start_id / EVENTS_PER_FILE);
    const last_file_id = Math.floor(MAX_EVENT_ID / EVENTS_PER_FILE);
    for (let file_id = start_file_id; file_id <= last_file_id; file_id++) {
        file_urls.push(`/src/assets/tile_events/${file_id}.csv`);
    }
    // for (const file_url of file_urls) {
    //     const tile_events = await fetchTileEvents(file_url);
    //     for (const tile_event of tile_events) {
    //         add(tile_event).then(
    //             event => {
    //                 console.log(event);
    //             },
    //             error => {
    //                 console.log(error);
    //             }
    //         );
    //     }
    // }
}

async function fetchTileEvents(file_url: string): Promise<TileEvent[]> {
    // if (id < MIN_EVENT_ID || id > MAX_EVENT_ID) {
    //     // more than 2132410 events do not exist
    //     console.error(`Invalid event ID ${id} requested.`)
    //     return [];
    // }
    // const file_id = Math.floor(id / EVENTS_PER_FILE);
    // const file_url = `/src/assets/tile_events/${file_id}.csv`;
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
            tile_events.push(tile_event);
        }
    });
    return tile_events;
}


function getLatestEventID(callback: (maxRevisionObject: number) => void) {
    const openReq = indexedDB.open("TileEvents");
    openReq.onsuccess = function () {
        const db = openReq.result;
        const transaction = db.transaction("tile_events", 'readonly');
        const objectStore = transaction.objectStore("tile_events");
        const index = objectStore.index('id');
        const openCursorRequest = index.openCursor(null, 'prev');
        let lastTileEvent: TileEvent | null = null;

        openCursorRequest.onsuccess = function (event) {
            if (!event.target) {
                return;
            }
            if (event.target.result) {
                lastTileEvent = event.target.result.value; //the object with max revision
            }
        };
        transaction.oncomplete = function (event) {
            db.close();
            if (callback) {
                callback(lastTileEvent?.id || 0);
            }
        };
    }
}

function App() {
    const [currentEventID, setCurrentEventID] = useState(1);
    const {add} = useIndexedDB('tile_events');
    const [alreadyDownloadedURLs, setAlreadyDownloadedURLs] = useState<string[]>([]);
    const [downloadedUntilEventID, setDownloadedUntilEventID] = useState(-1);
    const [playing, setPlaying] = useState(false);

    const displayedEventID = currentEventID;
    // if (displayedEventID > downloadedUntilEventID) {
    //     displayedEventID = downloadedUntilEventID;
    // }
    const fliesentisch = useFliesentischAt(displayedEventID);

    useEffect(() => {
        getLatestEventID((latestEventID) => {
            setDownloadedUntilEventID(latestEventID);
        });
    }, []);

    useEffect(() => {
        return;
        if (downloadedUntilEventID >= 0 && downloadedUntilEventID < MAX_EVENT_ID) {
            const fileURL = getTileEventFileUrl(downloadedUntilEventID + 1);
            if (alreadyDownloadedURLs.includes(fileURL)) {
                return
            }
            setAlreadyDownloadedURLs([...alreadyDownloadedURLs, fileURL]);
            fetchTileEvents(fileURL).then(tile_events => {
                for (const tile_event of tile_events) {
                    add(tile_event).then(
                        event => {
                            if (tile_event.id > downloadedUntilEventID) {
                                setDownloadedUntilEventID(tile_event.id);
                            }
                        },
                        // error => {
                        // }
                    );
                }
            });
        }
    }, [downloadedUntilEventID]);


    // openCursor(event => {
    //     if (!event.target) {
    //         return;
    //     }
    //     const cursor = event.target.result;
    //     if (!cursor) {
    //         return;
    //     }
    //     const tile_event = cursor.value;
    //     if (!tile_event) {
    //         return;
    //     }
    //     setDownloadedUntilEventID(tile_event.id);
    // })

    useEffect(() => {
        fetchAndSaveAllTileEvents(MIN_EVENT_ID);
        const interval = setInterval(() => {
            // setCurrentEventID(currentEventID + 1);
        }, 10);
        return () => clearInterval(interval);
    }, [currentEventID]);

    let message = <span></span>;
    if (currentEventID !== displayedEventID) {
        message = <strong>Fliesentisch wird runtergeladen…</strong>
    }

    return (
        <>
            <div className="card">
                <button onClick={() => setCurrentEventID(currentEventID - 1000)}>
                    Prev
                </button>
                <input type="number" value={currentEventID}
                       onChange={event => setCurrentEventID(parseInt(event.target.value))}/>
                <button onClick={() => setCurrentEventID(currentEventID + 1000)}>
                    Next
                </button>
                <p>
                    Current event: {currentEventID}<br/>
                    Downloaded until event ID: {downloadedUntilEventID}
                </p>
                <FliesenCanvas fliesentisch={fliesentisch}/>
                <Slider min={MIN_EVENT_ID} max={MAX_EVENT_ID} value={currentEventID} buffer={downloadedUntilEventID}
                        markers={fliesentischSizeMapping.map(fliesentischSize => fliesentischSize.minEventId)}
                        playing={playing}
                        setPlaying={setPlaying}
                        setValue={setCurrentEventID}/>
                {message}
            </div>
        </>
    )
}

export default App
