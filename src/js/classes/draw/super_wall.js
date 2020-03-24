import {WallTile} from "./wall";

export class SuperWallTile extends WallTile {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.tint = 0x888888;
    }
}