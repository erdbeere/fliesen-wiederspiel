import {useEffect, useState} from 'react'
import './App.css'
import FliesenCanvas from "./FliesenCanvas";
import Slider from "./Slider.tsx";
import useFliesentischAt from "./FliesenLoader.tsx";
import {fliesentischSizeMapping, MAX_EVENT_ID, MIN_EVENT_ID} from "./constants.ts";

function App() {
    const [currentEventID, setCurrentEventID] = useState(1);
    const [playing, setPlaying] = useState(true);

    const {fliesentisch, date} = useFliesentischAt(currentEventID);

    useEffect(() => {
        if (!playing) {
            return;
        }
        const interval = setInterval(() => {
            setCurrentEventID(currentEventID + 500);
        }, 500);
        return () => clearInterval(interval);
    }, [currentEventID, playing]);

    const label = <span>
        Fliese #<span className="value">{currentEventID}</span><br />
        {date.toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})}
    </span>;
    return (
        <>
            <div className="card">
                <FliesenCanvas fliesentisch={fliesentisch}/>
                <Slider min={MIN_EVENT_ID} max={MAX_EVENT_ID} value={currentEventID}
                        markers={fliesentischSizeMapping.map(fliesentischSize => fliesentischSize.minEventId)}
                        playing={playing}
                        label={label}
                        setPlaying={setPlaying}
                        setValue={setCurrentEventID}/>
                <div style={{margin: "5em 0"}}></div>
                <input type="number" value={currentEventID}
                       onChange={event => setCurrentEventID(parseInt(event.target.value))}/>
                <p>
                    Current event: {currentEventID}<br/>
                    Downloaded until event ID: -
                </p>

            </div>
        </>
    )
}

export default App
