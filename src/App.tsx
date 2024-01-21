import {useEffect, useState} from 'react'
import './App.css'
import FliesenCanvas from "./FliesenCanvas";
import Slider from "./Slider.tsx";
import useFliesentischAt from "./FliesenLoader.tsx";
import {fliesentischSizeMapping, MAX_EVENT_ID, MIN_EVENT_ID} from "./constants.ts";

function ResetZoomButton({onClick}: { onClick?: () => void }) {
    return <svg className="control-buttons" version="1.1" id="Layer_1"
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 300.003 300.003" xmlSpace="preserve" onClick={onClick}>
        <g>
            <g>
                <path d="M150.005,0C67.164,0,0.001,67.159,0.001,150c0,82.838,67.162,150.003,150.003,150.003S300.002,232.838,300.002,150
			C300.002,67.159,232.844,0,150.005,0z M230.091,172.444c-9.921,37.083-43.801,64.477-83.969,64.477
			c-47.93,0-86.923-38.99-86.923-86.923s38.99-86.92,86.923-86.92c21.906,0,41.931,8.157,57.228,21.579l-13.637,23.623
			c-11-11.487-26.468-18.664-43.594-18.664c-33.294,0-60.38,27.088-60.38,60.38c0,33.294,27.085,60.38,60.38,60.38
			c25.363,0,47.113-15.728,56.038-37.937h-20.765l36.168-62.636l36.166,62.641H230.091z"/>
            </g>
        </g>
    </svg>
}

function ZoomInButton({onClick}: { onClick?: () => void }) {
    return <svg className="control-buttons" version="1.1" id="Layer_1"
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 300.003 300.003" xmlSpace="preserve" onClick={onClick}>
        <g>
            <g>
                <path d="M150,0C67.159,0,0.001,67.159,0.001,150c0,82.838,67.157,150.003,149.997,150.003S300.002,232.838,300.002,150
			C300.002,67.159,232.839,0,150,0z M213.281,166.501h-48.27v50.469c-0.003,8.463-6.863,15.323-15.328,15.323
			c-8.468,0-15.328-6.86-15.328-15.328v-50.464H87.37c-8.466-0.003-15.323-6.863-15.328-15.328c0-8.463,6.863-15.326,15.328-15.328
			l46.984,0.003V91.057c0-8.466,6.863-15.328,15.326-15.328c8.468,0,15.331,6.863,15.328,15.328l0.003,44.787l48.265,0.005
			c8.466-0.005,15.331,6.86,15.328,15.328C228.607,159.643,221.742,166.501,213.281,166.501z"/>
            </g>
        </g>
    </svg>
}

function ZoomOutButton({onClick}: { onClick?: () => void }) {
    return <svg className="control-buttons" version="1.1" id="Layer_1"
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 300.003 300.003" xmlSpace="preserve" onClick={onClick}>
        <g>
            <g>
                <path d="M150.001,0c-82.843,0-150,67.159-150,150c0,82.838,67.157,150.003,150,150.003c82.838,0,150-67.165,150-150.003
			C300.001,67.159,232.838,0,150.001,0z M197.218,166.283H92.41c-8.416,0-15.238-6.821-15.238-15.238s6.821-15.238,15.238-15.238
			H197.22c8.416,0,15.238,6.821,15.238,15.238S205.634,166.283,197.218,166.283z"/>
            </g>
        </g>
    </svg>
}

function App() {
    const queryParameters = new URLSearchParams(window.location.search)
    const initialTime = queryParameters.get("t") ? parseInt(queryParameters.get("t")!) : MIN_EVENT_ID;
    const initialZoom = queryParameters.get("z") ? parseInt(queryParameters.get("z")!) : 1;
    const initialXOffset = queryParameters.get("x") ? parseInt(queryParameters.get("x")!) : 0;
    const initialYOffset = queryParameters.get("y") ? parseInt(queryParameters.get("y")!) : 0;

    const [currentEventID, setCurrentEventID] = useState(initialTime);
    const [playing, setPlaying] = useState(currentEventID == MIN_EVENT_ID);
    const [zoom, setZoom] = useState(initialZoom);
    const [offset, setOffset] = useState<[number, number]>([initialXOffset, initialYOffset]);

    const {fliesentisch, date} = useFliesentischAt(currentEventID);

    // register arrow keys to change currentEventID +/- 1
    // If pressed together with Ctrl, change +/- 100
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                if (event.ctrlKey) {
                    setCurrentEventID(currentEventID - 100);
                } else {
                    setCurrentEventID(currentEventID - 1);
                }
            } else if (event.key === "ArrowRight") {
                if (event.ctrlKey) {
                    setCurrentEventID(currentEventID + 100);
                } else {
                    setCurrentEventID(currentEventID + 1);
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [currentEventID]);

    useEffect(() => {
        if (!playing) {
            return;
        }
        const interval = setInterval(() => {
            setCurrentEventID(currentEventID + 50);
        }, 50);
        return () => clearInterval(interval);
    }, [currentEventID, playing]);

    useEffect(() => {
        const queryParameters = new URLSearchParams(window.location.search)
        queryParameters.set("t", currentEventID.toString());
        queryParameters.set("z", zoom.toString());
        queryParameters.set("x", offset[0].toString());
        queryParameters.set("y", offset[1].toString());
        window.history.replaceState({}, "", `${window.location.pathname}?${queryParameters.toString()}`);
    }, [currentEventID, zoom, offset]);

    const label = <span>
        Fliese #<span className="value">{currentEventID}</span><br/>
        {date.toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})}
    </span>;
    return (
        <>
            <div className="card">
                <FliesenCanvas fliesentisch={fliesentisch} zoom={zoom} setZoom={setZoom} offset={offset}
                               setOffset={setOffset}/><br/>
                <div className="controls">
                    <ZoomOutButton onClick={() => setZoom(zoom / 1.1)}/>
                    <ResetZoomButton onClick={() => {
                        setZoom(1);
                        setOffset([0, 0]);
                    }}/>
                    <ZoomInButton onClick={() => setZoom(zoom * 1.1)}/>
                </div>
                <Slider min={MIN_EVENT_ID} max={MAX_EVENT_ID} value={currentEventID}
                        markers={fliesentischSizeMapping.map(fliesentischSize => fliesentischSize.minEventId)}
                        playing={playing}
                        label={label}
                        setPlaying={setPlaying}
                        setValue={setCurrentEventID}/>
                <p className="desktop instructions">
                    Mit den Pfeiltasten eine Fliese legen / entfernen.<br/>
                    Mit Strg + Pfeiltasten 100 Fliesen legen / entfernen.<br/>
                </p>
                {/*<input type="number" value={currentEventID}*/}
                {/*       onChange={event => setCurrentEventID(parseInt(event.target.value))}/>*/}

            </div>
        </>
    )
}

export default App
