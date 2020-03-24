import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY} from "../../../enums";
import {redrawHeadwear} from "../../../drawing/draw_hud";
import {HeadWearSpriteSheet} from "../../../loader";

export class VampireCrown {
    constructor() {
        this.texture = HeadWearSpriteSheet["vampire_crown.png"];
        this.type = HEAD_TYPE.VAMPIRE_CROWN;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.killsNeeded = 10;
        this.killsMade = 0;
        this.healAmount = 1;
        this.name = "Vampire Crown";
        this.description = "Kills heal";
        this.rarity = RARITY.B;
    }

    onKill(player) {
        this.killsMade++;
        if (this.killsMade >= this.killsNeeded) {
            player.heal(this.healAmount);
            this.killsMade = 0;
        }
        redrawHeadwear(player);
    }
}