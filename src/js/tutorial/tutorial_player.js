import {Game} from "../game";
import {Player} from "../classes/players/player";
import {otherPlayer} from "../utils/game_utils";
import {camera} from "../classes/game/camera";
import {PLAY_MODE} from "../enums/enums";
import {retry} from "../setup";

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

    goExit(tileStepX, tileStepY) {
        let toCloseBlackBars = true;
        this.step(tileStepX, tileStepY, () => {
            if (toCloseBlackBars && this.animationCounter >= this.STEP_ANIMATION_TIME / 2) {
                Game.playMode = PLAY_MODE.NORMAL;
                retry();
                toCloseBlackBars = false;
            }
        });
    }

    die() {
        this.dead = false;
        this.health = this.maxHealth;
        otherPlayer(this).health = otherPlayer(this).maxHealth;
        Game.world.addChild(this);
        this.visible = true;
        if (this.respawnPoint) {
            this.setTilePosition(this.respawnPoint.x, this.respawnPoint.y);
            otherPlayer(this).setTilePosition(otherPlayer(this).respawnPoint.x, otherPlayer(this).respawnPoint.y);
        }
        camera.moveToCenter(10);

        for (const enemy of Game.enemies) {
            if (enemy.onTutorialPlayerRevive) {
                enemy.onTutorialPlayerRevive();
            }
        }
    }
}