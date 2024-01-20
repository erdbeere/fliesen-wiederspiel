import './Slider.css'
import {ReactNode} from "react";

function NextButton({onClick}: { onClick?: () => void }) {
    return <svg className="player-button" version="1.1"
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 300 300" xmlSpace="preserve" onClick={onClick}>
        <g>
            <g>
                <path d="M150,0C67.162,0,0,67.159,0,150s67.162,150,150,150c82.843,0,150-67.162,150-150C300,67.157,232.843,0,150,0z
			 M216.312,199.725h-0.003c0,9.498-7.7,17.198-17.198,17.198c-9.498,0-17.198-7.7-17.198-17.198V163.77
			c-0.739,0.84-1.6,1.58-2.594,2.153l-81.098,46.82c-1.605,0.926-3.395,1.393-5.187,1.393c-1.787,0-3.582-0.467-5.187-1.393
			c-3.208-1.849-5.187-5.278-5.187-8.982v-93.643c0-3.706,1.979-7.132,5.187-8.984c3.211-1.854,7.164-1.854,10.375,0l81.1,46.823
			c0.993,0.576,1.854,1.315,2.594,2.155v-39.465c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V199.725z"/>
            </g>
        </g>
    </svg>
}

function PrevButton({onClick}: { onClick?: () => void }) {
    return <svg className="player-button" version="1.1"
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 300 300" xmlSpace="preserve" onClick={onClick}>
        <g>
            <g>
                <path d="M150,0C67.157,0,0,67.157,0,150c0,82.841,67.157,150,150,150c82.838,0,150-67.162,150-150C300,67.159,232.838,0,150,0z
			 M217.343,203.764c0,3.704-1.979,7.132-5.187,8.982c-1.605,0.926-3.4,1.393-5.187,1.393c-1.792,0-3.582-0.467-5.187-1.393
			l-81.103-46.823c-0.993-0.573-1.854-1.312-2.594-2.153v35.955c0,9.498-7.7,17.198-17.198,17.198s-17.198-7.7-17.198-17.198
			v-89.078h0.002c0-9.498,7.7-17.198,17.198-17.198c9.498,0,17.198,7.7,17.198,17.198v39.465c0.739-0.84,1.6-1.58,2.594-2.155
			l81.1-46.823c3.211-1.854,7.164-1.854,10.375,0c3.208,1.852,5.187,5.278,5.187,8.984V203.764z"/>
            </g>
        </g>
    </svg>
}

function PlayPauseButton({playing, onClick}: { playing: boolean, onClick?: () => void }) {
    const playIcon = <path d="M150,0C67.157,0,0,67.162,0,150c0,82.841,67.157,150,150,150s150-67.159,150-150C300,67.162,232.843,0,150,0z
			 M205.846,158.266l-86.557,49.971c-1.32,0.765-2.799,1.144-4.272,1.144c-1.473,0-2.949-0.379-4.274-1.144
			c-2.64-1.525-4.269-4.347-4.269-7.402V100.89c0-3.053,1.631-5.88,4.269-7.402c2.648-1.528,5.906-1.528,8.551,0l86.557,49.974
			c2.645,1.53,4.274,4.352,4.269,7.402C210.12,153.916,208.494,156.741,205.846,158.266z"/>
    const pauseIcon = <path d="M150.001,0c-82.838,0-150,67.159-150,150c0,82.838,67.162,150.003,150,150.003c82.843,0,150-67.165,150-150.003
			C300.001,67.159,232.846,0,150.001,0z M134.41,194.538c0,9.498-7.7,17.198-17.198,17.198s-17.198-7.7-17.198-17.198V105.46
			c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V194.538z M198.955,194.538c0,9.498-7.701,17.198-17.198,17.198
			c-9.498,0-17.198-7.7-17.198-17.198V105.46c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V194.538z"/>
    return <svg className="player-button" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 300 300" xmlSpace="preserve" onClick={onClick}>
        <g>
            <g>
                {playing ? pauseIcon : playIcon}
            </g>
        </g>
    </svg>
}

function ControlBar({playing, value, markers, setPlaying, setValue}: {
    playing: boolean,
    value: number,
    markers: number[],
    setPlaying: (playing: boolean) => void,
    setValue: (value: number) => void
}) {
    return <div id="controls">
        <PrevButton onClick={() => {
            const prevMarker = markers.reverse().find(marker => marker < value);
            if (prevMarker) {
                setValue(prevMarker);
            }
        }}/>
        <PlayPauseButton playing={playing} onClick={() => setPlaying(!playing)}/>
        <NextButton onClick={() => {
            const nextMarker = markers.find(marker => marker > value);
            if (nextMarker) {
                setValue(nextMarker);
            }
        }}/>
    </div>
}


function Slider({min, max, value, markers, label, playing, setPlaying, setValue}: {
    min: number,
    max: number,
    value: number,
    markers: number[],
    label: ReactNode,
    playing: boolean,
    setPlaying: (playing: boolean) => void,
    setValue: (value: number) => void
}) {
    return <div id="slider">
        <ControlBar playing={playing} value={value} setPlaying={setPlaying} setValue={setValue} markers={markers}/>
        <input id="seekbar" type="range" min={min} max={max} value={value} list="markers" autoFocus={true}
               onChange={event => {
                   setValue(parseInt(event.target.value));
                   setPlaying(false);
               }}/>
        <div className="label">{label}</div>
        <datalist id="markers">
            {markers.map(marker => <option value={marker} key={marker}></option>)}
        </datalist>
    </div>
}

export default Slider
