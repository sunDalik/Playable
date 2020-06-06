import {WallTile} from "./wall";
import {WALL_TRAP_BASE_FILTER} from "../../filters";

export class WallTrapBase extends WallTile {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.filters = [WALL_TRAP_BASE_FILTER];
    }
}