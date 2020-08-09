import {Game} from "../game";
import {Player} from "../classes/players/player";
import {otherPlayer} from "../utils/game_utils";
import {camera} from "../classes/game/camera";

export class TutorialPlayer extends Player {
    constructor(tilePositionX, tilePositionY, texture) {
        super(texture, tilePositionX, tilePositionY);
        this.respawnPoint = null;
        this._health = this._maxHealth = 1;
        this.fadingDestructionParticles = true;
    }

    onMove(animationTime, tileStepX, tileStepY) {
        super.onMove(animationTime, tileStepX, tileStepY);
        if (Game.map[this.tilePosition.y][this.tilePosition.x].triggerTile) {
            Game.map[this.tilePosition.y][this.tilePosition.x].triggerTile.onTrigger();
        }
    }

    die() {
        this.dead = false;
        this.health = this.maxHealth;
        Game.world.addChild(this);
        this.visible = true;
        if (this.respawnPoint) {
            this.setTilePosition(this.respawnPoint.x, this.respawnPoint.y);
            otherPlayer(this).setTilePosition(otherPlayer(this).respawnPoint.x, otherPlayer(this).respawnPoint.y);
        }
        camera.moveToCenter(10);

        for (const enemy of Game.enemies) {
            if (enemy.onTutorialPlayerRevive && !enemy.dead) {
                enemy.onTutorialPlayerRevive();
            }
        }
    }
}