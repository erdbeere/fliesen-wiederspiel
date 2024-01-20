import {useEffect, useRef, useState} from "react";
import Canvas from "./Canvas.tsx";

function FliesenCanvas({fliesentisch, zoom, setZoom, offset, setOffset}: {
    fliesentisch: string[][],
    zoom: number,
    setZoom: (zoom: number) => number,
    offset: [number, number],
    setOffset: (offset: (offset: [number, number]) => [number, number]) => void
}) {
    function draw(context: CanvasRenderingContext2D) {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, fliesentisch.length, fliesentisch[0].length)
        for (let x = 0; x < fliesentisch.length; x++) {
            for (let y = 0; y < fliesentisch[x].length; y++) {
                context.fillStyle = `#${fliesentisch[x][y]}`
                context.fillRect(x, y, 1, 1)
            }
        }
    }
    return <Canvas canvasWidth={500} canvasHeight={500} draw={draw} zoom={zoom} setZoom={setZoom}></Canvas>

    // return <canvas ref={canvasRef}></canvas>
}

export default FliesenCanvas;