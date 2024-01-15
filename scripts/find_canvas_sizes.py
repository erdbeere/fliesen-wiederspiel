DIMENSIONS = [
    (200, 200),
    (400, 200),
    (400, 300),
    (500, 400),
    (500, 500),
]

import csv

csv_file_paths = [
    f"../src/assets/tile_events/{n}.csv" for n in range(1, 214)
]

def main():
    current_dimension = 0
    for path in csv_file_paths:
        with open(path, "r") as f:
            reader = csv.reader(f, delimiter=";")
            data = list(reader)
            for row in data:
                id_str, x_str, y_str, *_ = row
                id_ = int(id_str)
                x = int(x_str)
                y = int(y_str)
                if x >= DIMENSIONS[current_dimension][0] or y >= DIMENSIONS[current_dimension][1]:
                    current_dimension += 1
                    print(f"Dimension {current_dimension} ({DIMENSIONS[current_dimension]}) reached at {id_} ({x}, {y}) in {path}")

if __name__ == "__main__":
    main()