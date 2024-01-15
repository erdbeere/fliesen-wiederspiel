import {useEffect, useRef} from "react";

function FliesenCanvas({fliesentisch}: { fliesentisch: string[][] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) {
            return;
        }
        const context = canvas.getContext('2d')
        if (context === null) {
            return;
        }
        canvas.width = fliesentisch.length
        canvas.height = fliesentisch[0].length

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, fliesentisch.length, fliesentisch[0].length)
        for (let x = 0; x < fliesentisch.length; x++) {
            for (let y = 0; y < fliesentisch[x].length; y++) {
                context.fillStyle = `#${fliesentisch[x][y]}`
                context.fillRect(x, y, 1, 1)
            }
        }
    }, [fliesentisch])

    return <>
        <canvas ref={canvasRef}></canvas><br />
        Dimensions: {fliesentisch.length}x{fliesentisch[0].length}
    </>
}

export default FliesenCanvas;