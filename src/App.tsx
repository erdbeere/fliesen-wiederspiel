import {useEffect, useState} from 'react'
import './App.css'
import FliesenCanvas from "./FliesenCanvas";
import Slider from "./Slider.tsx";
import useFliesentischAt from "./FliesenLoader.tsx";
import {fliesentischSizeMapping, MAX_EVENT_ID, MIN_EVENT_ID} from "./constants.ts";

function App() {
    const queryParameters = new URLSearchParams(window.location.search)
    const [currentEventID, setCurrentEventID] = useState(queryParameters.get("t") ? parseInt(queryParameters.get("t")!) : MIN_EVENT_ID);
    const [playing, setPlaying] = useState(currentEventID == MIN_EVENT_ID);

    const {fliesentisch, date} = useFliesentischAt(currentEventID);

    useEffect(() => {
        if (!playing) {
            history.replaceState(null, "", `?t=${currentEventID}`);
            return;
        }
        const interval = setInterval(() => {
            setCurrentEventID(currentEventID + 50);
        }, 50);
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
                {/*<input type="number" value={currentEventID}*/}
                {/*       onChange={event => setCurrentEventID(parseInt(event.target.value))}/>*/}

            </div>
        </>
    )
}

export default App
