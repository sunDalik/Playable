import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {closestPlayer} from "../../utils/game_utils";

export class LizardWarrior extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/lizard_warrior.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.LIZARD_WARRIOR;
        this.atk = 1.5;
        this.zIndex = Game.primaryPlayer.zIndex + 1;

        this.triggeredWideSlash = false;
        this.triggeredForwardPierce = false;
        this.lockedPlayer = null;
        this.scaleModifier = 1.1;
        this.fitToTile();
        this.place();
    }

    move() {
        if (this.lockedPlayer === null || this.lockedPlayer.dead) {
            this.lockedPlayer = closestPlayer(this);
        }

    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.height = this.intentIcon.width;
        if (this.triggeredWideSlash) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/three_tiles_front.png"].texture;
            this.intentIcon.height = this.intentIcon.texture.height / this.intentIcon.texture.width * this.intentIcon.width;
        } else if (this.triggeredForwardPierce) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/two_tiles_forward.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/anger.png"].texture;
        }
    }

    place() {
        this.position.x = this.getTilePositionX();
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE * 1.1 + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        if (this.healthContainer) this.moveHealthContainer();
    }
}