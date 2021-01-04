import {WallTile} from "./wall";
import {STAGE} from "../../enums/enums";
import {Game} from "../../game";

export class SuperWallTile extends WallTile {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.tint = 0x999999;

        // hack for now
        if (Game.stage === STAGE.IMP_BATTLE) {
            this.renderable = false;
        }
    }
}