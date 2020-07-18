import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {randomInt} from "../../../utils/random_utils";

export class MudBlock extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["mud_block.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.25;
        this.type = ENEMY_TYPE.MUD_BLOCK;
        this.atk = 0;
        this.movable = false;
        this.lifeTime = randomInt(12, 16);
        this.fadingDestructionParticles = true;
        this.removeShadow();
        this.setScaleModifier(1.02);
    }

    move() {
        if (this.lifeTime <= 0) {
            this.die(null);
        } else {
            this.lifeTime--;
        }
    }

    setStunIcon() {
        super.setStunIcon();
        this.intentIcon.visible = false;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.visible = false;
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        if (this.healthContainer) {
            this.onMoveFrame();
        }
    }
}