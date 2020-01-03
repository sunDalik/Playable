import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {KingFrog} from "./frog_king";
import {FireHazard} from "../hazards/fire";
import {getPlayerOnTile} from "../../map_checks";

export class KingFireFrog extends KingFrog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_king_fire.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_KING_FIRE;
        this.atk = 1.25;
    }

    attackPlayer(tileX, tileY) {
        const player = getPlayerOnTile(tileX, tileY);
        if (player) player.damage(this.atk, this, false);
    }

    spitHazard(tileX, tileY) {
        Game.world.addHazard(new FireHazard(tileX, tileY));
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.triggered) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/fire.png"].texture;
        }
    }
}