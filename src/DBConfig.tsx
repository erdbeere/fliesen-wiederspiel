export const DBConfig = {
    name: "TileEvents",
    version: 1,
    objectStoresMeta: [
        {
            store: "tile_events",
            storeConfig: {keyPath: "id", autoIncrement: false},
            storeSchema: [
                {name: "id", keypath: "id", options: {unique: true}},
                {name: "x", keypath: "x", options: {unique: false}},
                {name: "y", keypath: "y", options: {unique: false}},
                {name: "color", keypath: "color", options: {unique: false}},
                {name: "created", keypath: "created", options: {unique: false}},
                {name: "missing", keypath: "missing", options: {unique: false}},
            ],
        },
    ],
};