import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {DBConfig} from "./DBConfig";
import {initDB, useIndexedDB} from "react-indexed-db-hook";

initDB(DBConfig);

type TileEvent = {
    id: number,
    x: number,
    y: number,
    color: string,
    created: string,
    missing: boolean,
}

// Needs to be same value as in scripts/build-tile-assets.ts
const EVENTS_PER_FILE = 10000;

async function fetchTileEvent(id: number): Promise<TileEvent[]> {
    if (id < 1 || id > 2132410) {
        // more than 2132410 events do not exist
        console.error(`Invalid event ID ${id} requested.`)
        return [];
    }
    const file_id = Math.floor(id / EVENTS_PER_FILE);
    const file_url = `/src/assets/tile_events/${file_id}.csv`;
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
                "missing": false,
            };
            tile_events.push(tile_event);
        }
    });
    return tile_events;
}

function useFliesentischAt(eventID: number): string[] {
    const {getByID, add} = useIndexedDB('tile_events');
    const [fliesentisch, setFliesentisch] = useState("foo");

    useEffect(() => {
        getByID(eventID).then(tile_event => {
            if (tile_event === undefined) {
                fetchTileEvent(eventID).then(tile_events => {
                    for (const tile_event of tile_events) {
                        add(tile_event).then(
                            event => {
                                // console.log(event);
                            },
                            error => {
                                console.log(error);
                            }
                        );
                    }
                })
            } else if (tile_event.missing) {
                return;
            }
            setFliesentisch(JSON.stringify(tile_event));
        });
    }, [eventID]);
    return fliesentisch;
}

function App() {
    const [currentEventID, setCurrentEventID] = useState(0);
    const fliesentisch = useFliesentischAt(currentEventID);


    // const [tile_events, setTileEvents] = useState("")

    // fetch('/src/assets/tile_events/1.csv').then(response => response.text()).then(text => {
    //     setTileEvents(text);
    //     // setTileEvents(text.split('\n').map(line => line.split(',')))
    // });

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCurrentEventID(currentEventID+1)}>
                    Next
                </button>
                <p>
                    Current event: {currentEventID}
                </p>
                <p>
                    {fliesentisch}
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
