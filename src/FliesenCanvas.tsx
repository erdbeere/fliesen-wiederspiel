import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import "./FliesenCanvas.css";
import {fliesentischSizeMapping} from "./constants.ts";

const largestFliesentisch = fliesentischSizeMapping[fliesentischSizeMapping.length - 1]
const width = largestFliesentisch.width;
const height = largestFliesentisch.height;

function FliesenCanvas({fliesentisch, zoom, setZoom, offset, setOffset}: {
    fliesentisch: string[][],
    zoom: number,
    setZoom: Dispatch<SetStateAction<number>>
    offset: [number, number],
    setOffset: Dispatch<SetStateAction<[number, number]>>,
}) {
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);
    const [moveInProgress, setMoveInProgress] = useState<boolean>(false);
    const [tempOffset, setTempOffset] = useState<[number, number]>(offset);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!moveInProgress) {
            setTempOffset(offset);
        }
    }, [offset, tempOffset, moveInProgress]);

    useEffect(() => {
        function draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, largestFliesentisch.width, largestFliesentisch.height)
            ctx.fillStyle = '#ffffff'
            ctx.scale(zoom, zoom)
            ctx.translate(tempOffset[0], tempOffset[1])

            ctx.fillRect(0, 0, fliesentisch.length, fliesentisch[0].length)
            for (let x = 0; x < fliesentisch.length; x++) {
                for (let y = 0; y < fliesentisch[x].length; y++) {
                    ctx.fillStyle = `#${fliesentisch[x][y]}`
                    ctx.fillRect(x, y, 1, 1)
                }
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0)
        }

        if (zoom < 1) {
            setZoom(1)
            return;
        }
        if (zoom > 100) {
            setZoom(100)
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }
        draw(context);

        // mouse wheel inside canvas should zoom instead of scroll
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const newZoom = Math.round(zoom - event.deltaY / 100);
            setZoom(newZoom);
            // move the offset to the cursor stays at the same position
            // const mousePosDelta = [event.clientX, event.clientY];
            console.log(event)
            // mousePosDelta[0] = Math.round(mousePosDelta[0] / zoom)
            // mousePosDelta[1] = Math.round(mousePosDelta[1] / zoom)
            // setTempOffset([tempOffset[0] + mousePosDelta[0], tempOffset[1] + mousePosDelta[1]]);
            // setOffset(tempOffset);
        };

        // mouse drag inside canvas should change the offset
        const onMouseDown = (event: MouseEvent) => {
            setMousePos([event.clientX, event.clientY]);
            setMoveInProgress(true);
        };

        const onTouchStart = (event: TouchEvent) => {
            setMousePos([event.touches[0].clientX, event.touches[0].clientY]);
            setMoveInProgress(true);
        }

        const onMouseMove = (event: MouseEvent) => {
            if (!moveInProgress) {
                return;
            }
            const mousePosDelta = [event.clientX - mousePos[0], event.clientY - mousePos[1]];
            mousePosDelta[0] = Math.round(mousePosDelta[0] / zoom)
            mousePosDelta[1] = Math.round(mousePosDelta[1] / zoom)
            setTempOffset([tempOffset[0] + mousePosDelta[0], tempOffset[1] + mousePosDelta[1]]);
            setMousePos([event.clientX, event.clientY]);
        }

        const onTouchMove = (event: TouchEvent) => {
            if (!moveInProgress) {
                return;
            }
            const mousePosDelta = [event.touches[0].clientX - mousePos[0], event.touches[0].clientY - mousePos[1]];
            mousePosDelta[0] = Math.round(mousePosDelta[0] / zoom)
            mousePosDelta[1] = Math.round(mousePosDelta[1] / zoom)
            setTempOffset([tempOffset[0] + mousePosDelta[0], tempOffset[1] + mousePosDelta[1]]);
            setMousePos([event.touches[0].clientX, event.touches[0].clientY]);
        }

        const onMouseUp = () => {
            setOffset(tempOffset);
            setMoveInProgress(false);
        };

        const onTouchEnd = () => {
            setOffset(tempOffset);
            setMoveInProgress(false);
        }

        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("touchstart", onTouchStart);
        canvas.addEventListener("touchmove", onTouchMove);
        canvas.addEventListener("touchend", onTouchEnd);

        canvas.addEventListener("wheel", onWheel);
        return () => {
            canvas.removeEventListener("wheel", onWheel);
            canvas.removeEventListener("mousedown", onMouseDown);
            canvas.removeEventListener("mouseup", onMouseUp);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchmove", onTouchMove);
            canvas.removeEventListener("touchend", onTouchEnd);
        };
    }, [fliesentisch, zoom, setZoom, offset, setOffset, mousePos, moveInProgress, tempOffset]);


    return <canvas width={width} height={height} id="fliesen-canvas" ref={canvasRef}></canvas>
}

export default FliesenCanvas;