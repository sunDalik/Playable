export const ROOM_TYPE = Object.freeze({MAIN: 1, SECONDARY: 2, BOSS: 3, START: 4, SECRET: 5});

export class Room {
    constructor(offsetX, offsetY, width, height, type = undefined) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    get area() {
        return this.width * this.height;
    }
}