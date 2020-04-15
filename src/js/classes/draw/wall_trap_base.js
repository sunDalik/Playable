import {WallTile} from "./wall";
import {Game} from "../../game";
import {WALL_TRAP_BASE_FILTER} from "../../filters";

export class WallTrapBase extends WallTile {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY, Game.resources["src/images/wall.png"].texture);
        this.filters = [WALL_TRAP_BASE_FILTER];
    }
}