import * as fs from "fs";
import * as path from "path";
import * as lzma from "lzma-native";
import {fileURLToPath} from "node:url";
import {parse} from "csv-parse";
import * as cliProgress from "cli-progress";
import * as zlib from "zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// redefining stuff from src/constants.ts because I'm too dumb to import it. PR welcome.
const EVENTS_PER_FILE = 10000;
const MIN_EVENT_ID = 1;
const MAX_EVENT_ID = 2132410;
export const fliesentischSizeMapping = [
    {"minEventId": MIN_EVENT_ID, "maxEventId": 355761, "width": 200, "height": 200},
    {"minEventId": 355762, "maxEventId": 810960, "width": 400, "height": 200},
    {"minEventId": 810961, "maxEventId": 1407463, "width": 400, "height": 300},
    {"minEventId": 1407464, "maxEventId": 1852041, "width": 500, "height": 400},
    {"minEventId": 1852042, "maxEventId": MAX_EVENT_ID, "width": 500, "height": 500},
]

function cleanOutputDirectory() {
    const directories = [
        path.join(__dirname, "../src/assets/tile_events"),
        path.join(__dirname, "../src/assets/canvas_snapshots"),
    ]
    for (const directory of directories) {
        // create directory if it doesn't exist
        fs.mkdirSync(directory, {recursive: true});
        const files = fs.readdirSync(directory);
        for (const file of files) {
            fs.unlinkSync(path.join(directory, file));
        }
    }
}

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

function unpackTileHistory() {
    const compressor = lzma.createDecompressor();
    const progressbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let currentMapping = 0;
    const width = fliesentischSizeMapping[currentMapping]["width"];
    const height = fliesentischSizeMapping[currentMapping]["height"];
    let canvas = new Array(width).fill("ffffff").map(() => new Array(height).fill("ffffff"));

    progressbar.stop();

    const input = fs.createReadStream(path.join(__dirname, "../data/tile_history.csv.xz"));
    let lastGroupId = -1;

    progressbar.start(MAX_EVENT_ID, 0);
    input.pipe(compressor).pipe(parse({"delimiter": ";"})).on("data", (data: string[]) => {
        const id = parseInt(data[0]);
        progressbar.update(id);
        if (isNaN(id)) {
            console.log("Couldn't parse this line: ", data);
            return;
        }
        const x = parseInt(data[1]);
        const y = parseInt(data[2]);
        const color = data[3];

        const group = Math.floor(id / EVENTS_PER_FILE);

        if (group != lastGroupId) {
            const json = JSON.stringify(canvas);
            const output = zlib.gzipSync(json);
            fs.writeFileSync(path.join(__dirname, `../src/assets/canvas_snapshots/${group}.gzip`), output);
            lastGroupId = group;
        }

        fs.appendFileSync(path.join(__dirname, `../src/assets/tile_events/${group}.csv`), `${data.join(";")}\n`);
        const mapping = fliesentischSizeMapping[currentMapping];
        if (id > mapping["maxEventId"]) {
            currentMapping++;
            canvas = resizeCanvas(canvas, fliesentischSizeMapping[currentMapping]["width"], fliesentischSizeMapping[currentMapping]["height"]);
        }
        canvas[x][y] = color;
        // console.log("id: ", id);
        // console.log("path: ", path.join(__dirname, `../src/assets/tile_events/${group}.csv`));
    }).on("end", () => {
        progressbar.stop();
        console.log("Done!");
    });
}

cleanOutputDirectory();
unpackTileHistory();