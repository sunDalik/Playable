import {WallTile} from "./wall";
import {CommonEnemiesSpriteSheet} from "../../loader";

export class WallTrapBase extends WallTile {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY, CommonEnemiesSpriteSheet["wall_trap_base.png"]);
    }
}