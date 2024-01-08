import * as fs from "fs";
import * as path from "path";
import * as lzma from "lzma-native";
import {fileURLToPath} from "node:url";
import {parse} from "csv-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_PER_FILE = 10000;

function cleanOutputDirectory() {
    // create directory if it doesn't exist
    fs.mkdirSync(path.join(__dirname, "../src/assets/tile_events"), {recursive: true});
    const directory = path.join(__dirname, "../src/assets/tile_events");
    const files = fs.readdirSync(directory);
    for (const file of files) {
        fs.unlinkSync(path.join(directory, file));
    }
}

function unpackTileHistory() {
    const compressor = lzma.createDecompressor();
    const input = fs.createReadStream(path.join(__dirname, "../data/tile_history.csv.xz"));

    input.pipe(compressor).pipe(parse({"delimiter": ";"})).on("data", (data: string[]) => {
        const id = parseInt(data[0]);
        if (isNaN(id)) {
            console.log("Couldn't parse this line: ", data);
            return;
        }
        const group = Math.floor(id / EVENTS_PER_FILE);
        fs.appendFileSync(path.join(__dirname, `../src/assets/tile_events/${group}.csv`), `${data.join(";")}\n`);
        // console.log("id: ", id);
        // console.log("path: ", path.join(__dirname, `../src/assets/tile_events/${group}.csv`));
    });
}

cleanOutputDirectory();
unpackTileHistory();