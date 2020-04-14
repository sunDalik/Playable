// format is (x, y, width, height) where x, y is a position inside a room and width, height are the dimensions of the room
export const shapers = [
    //0. no shape
    (x, y, width, height) => false,

    //1. 1-tile corners
    (x, y, width, height) => (Math.min(x, width - 1 - x) + Math.min(y, height - 1 - y) <= 2),

    //2. L-shape
    (x, y, width, height) => (x < Math.floor(width / 2)) && (y < Math.floor((height) / 2)),

    //3. cut corner
    (x, y, width, height) => x + y <= Math.ceil(Math.min(width, height) / 2),

    //4. two cut corners on opposite sides
    (x, y, width, height) => x + y <= Math.ceil(Math.min(width, height) / 2)
        || ((width + height - 2) - (x + y)) <= Math.ceil(Math.min(width, height) / 2),

    //5. 4 corner dots
    (x, y, width, height) => Math.min(x, width - 1 - x) === 2 && Math.min(y, height - 1 - y) === 2,

    //6. 1-tile corners + random 2-tile corners
    (x, y, width, height) => (Math.min(x, width - 1 - x) + Math.min(y, height - 1 - y) <= 2)
        || (Math.min(x, width - 1 - x) + Math.min(y, height - 1 - y) <= 3) && Math.random() > 0.5,

    //7. 2-tile corners
    (x, y, width, height) => (Math.min(x, width - 1 - x) + Math.min(y, height - 1 - y) <= 3),

    //8. rectangular ring
    (x, y, width, height) => {
        const size = Math.ceil((Math.min(width, height) - 2) / 3);
        const freeWidth = Math.floor((width - 2 - size) / 2);
        const freeHeight = Math.floor((height - 2 - size) / 2);
        return x > freeWidth && x < (width - freeWidth - 1) && y > freeHeight && y < (height - freeHeight - 1);
    },

    //9. rectangular ring with cut corners and 1-tile corners
    (x, y, width, height) => {
        const size = Math.ceil((Math.min(width, height) - 2) / 3);
        const freeWidth = Math.floor((width - 2 - size) / 2);
        const freeHeight = Math.floor((height - 2 - size) / 2);
        return (x > freeWidth && x < (width - freeWidth - 1) && y > freeHeight && y < (height - freeHeight - 1)
            && !(Math.min(x, width - 1 - x) === freeWidth + 1 && Math.min(y, height - 1 - y) === freeHeight + 1)) || shapers[1](x, y, width, height)
    },

    //10. T-shape
    (x, y, width, height) => (Math.min(x, width - 1 - x) < Math.round(width / 3)) && (y < Math.round(height / 2)),

    //11. ⊢-shape
    (x, y, width, height) => (x < Math.round(width / 2)) && (Math.min(y, height - 1 - y) < Math.round(height / 3)),

    //12. bottom convex
    (x, y, width, height) => Math.min(x, width - 1 - x) >= width / 3 && y >= height / 2,

    //13. horizontal border with a gap
    (x, y, width, height) => Math.min(x, width - 1 - x) < width / 2 - 1 && (y === Math.round((height - 1) / 2)),

    //14. small rectangular ring
    (x, y, width, height) => {
        const size = Math.floor((Math.min(width, height) - 2) / 3);
        const freeWidth = Math.floor((width - 2 - size) / 2);
        const freeHeight = Math.floor((height - 2 - size) / 2);
        return x > freeWidth && x < (width - freeWidth - 1) && y > freeHeight && y < (height - freeHeight - 1);
    },
];

//this array contains approved shaper combos
//hmmm you can also choose different combos depending on the area... (width * height)
export const comboShapers = [
    //0. rect ring + 1-tile corners
    (x, y, width, height) => shapers[8](x, y, width, height) || shapers[1](x, y, width, height),

    //1. cut corner + random 2-tile corners
    (x, y, width, height) => shapers[3](x, y, width, height) || shapers[6](x, y, width, height),

    //2. bottom convex + 1-tile corners
    (x, y, width, height) => shapers[12](x, y, width, height) || shapers[1](x, y, width, height),

    //3. bottom convex + two cut corners on opposite sides
    (x, y, width, height) => shapers[12](x, y, width, height) || shapers[4](x, y, width, height),

    //4. horizontal border with gap + 1-tile corners
    (x, y, width, height) => shapers[13](x, y, width, height) || shapers[1](x, y, width, height),

    //5. horizontal border with gap + random 2-tile corners
    (x, y, width, height) => shapers[13](x, y, width, height) || shapers[6](x, y, width, height),

    //6. two cut corners on opposite sides + 1-tile corners
    (x, y, width, height) => shapers[4](x, y, width, height) || shapers[1](x, y, width, height),

    //7. T-shape + 1-tile corners
    (x, y, width, height) => shapers[10](x, y, width, height) || shapers[1](x, y, width, height),

    //8. small rect ring + random 2-tile corners
    (x, y, width, height) => shapers[14](x, y, width, height) || shapers[6](x, y, width, height),

    //9. T-shape + random 2-tile corners
    (x, y, width, height) => shapers[10](x, y, width, height) || shapers[6](x, y, width, height),

    //10. T-shape + 2-tile corners
    (x, y, width, height) => shapers[10](x, y, width, height) || shapers[7](x, y, width, height),

    //11. L-shape + 1-tile corners
    (x, y, width, height) => shapers[2](x, y, width, height) || shapers[1](x, y, width, height),

    //12. L-shape + 2-tile corners
    (x, y, width, height) => shapers[2](x, y, width, height) || shapers[7](x, y, width, height),

    //13. L-shape + random 2-tile corners
    (x, y, width, height) => shapers[2](x, y, width, height) || shapers[6](x, y, width, height),

    //14. L-shape + 4 corner dots
    (x, y, width, height) => shapers[2](x, y, width, height) || shapers[5](x, y, width, height),

    //15. 4 corner dots + bottom convex
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[12](x, y, width, height),

    //16. 4 corner dots + horizontal border
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[13](x, y, width, height),

    //17. 4 corner dots + two cut opposite corners
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[4](x, y, width, height),

    //18. 4 corner dots + T-shape
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[10](x, y, width, height),

    //19. 4 corner dots + ⊢-shape
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[11](x, y, width, height),

    //20. 4 corner dots + small rect ring
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[14](x, y, width, height),

    //21. 4 corner dots + 1-tile corners
    (x, y, width, height) => shapers[5](x, y, width, height) || shapers[1](x, y, width, height),

    //22. small rect ring + 2-tile corners
    (x, y, width, height) => shapers[14](x, y, width, height) || shapers[7](x, y, width, height),
];

export const startingRoomShaper = (x, y, width, height) => Math.min(x, width - 1 - x) < (width - 7) / 2
    || Math.min(y, height - 1 - y) < (height - 7) / 2;