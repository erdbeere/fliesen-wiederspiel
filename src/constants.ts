
// Needs to be same value as in scripts/build-tile-assets.ts
export const EVENTS_PER_FILE = 10000;

export const MIN_EVENT_ID = 1;
export const MAX_EVENT_ID = 2132410;


// each eventID corresponds to a certain fliesentisch size
export const fliesentischSizeMapping = [
    {"minEventId": MIN_EVENT_ID, "maxEventId": 355761, "width": 200, "height": 200},
    {"minEventId": 355762, "maxEventId": 810960, "width": 400, "height": 200},
    {"minEventId": 810961, "maxEventId": 1407463, "width": 400, "height": 300},
    {"minEventId": 1407464, "maxEventId": 1852041, "width": 500, "height": 400},
    {"minEventId": 1852042, "maxEventId": MAX_EVENT_ID, "width": 500, "height": 500},
]
