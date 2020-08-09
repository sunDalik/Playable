import {WhitePlayer} from "../classes/players/player_white";
import {Game} from "../game";

export class TutorialPlayerWhite extends WhitePlayer {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this._health = this._maxHealth = 1;
    }

    onMove(animationTime, tileStepX, tileStepY) {
        super.onMove(animationTime, tileStepX, tileStepY);
        if (Game.map[this.tilePosition.y][this.tilePosition.x].triggerTile){
            Game.map[this.tilePosition.y][this.tilePosition.x].triggerTile.onTrigger();
        }
    }
}