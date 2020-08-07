import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums/enums";
import {KingFrog} from "../fc/frog_king";
import {FireHazard} from "../../hazards/fire";
import {getPlayerOnTile} from "../../../map_checks";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";

export class KingFireFrog extends KingFrog {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["frog_king_fire.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 3;
        this.name = "King Fire Frog";
        this.type = ENEMY_TYPE.FROG_KING_FIRE;
        this.atk = 1;
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
            this.intentIcon.texture = IntentsSpriteSheet["fire.png"];
        }
    }
}