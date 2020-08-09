import {BlackPlayer} from "../classes/players/player_black";
import {Game} from "../game";

export class TutorialPlayerBlack extends BlackPlayer {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.dead = true;
        this._health = 0;
    }

    onMove(animationTime, tileStepX, tileStepY) {
        super.onMove(animationTime, tileStepX, tileStepY);
        if (Game.map[this.tilePosition.y][this.tilePosition.x].triggerTile){
            Game.map[this.tilePosition.y][this.tilePosition.x].triggerTile.onTrigger();
        }
    }
}