import {WhitePlayer} from "../classes/players/player_white";
import {BlackPlayer} from "../classes/players/player_black";

export class TutorialPlayerBlack extends BlackPlayer {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.dead = true;
        this._health = 0;
    }
}