import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY, SLOT} from "../../../enums";
import {redrawSlotContents} from "../../../drawing/draw_hud";
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
        this.description = "Every 10th kill heals";
        this.rarity = RARITY.B;
    }

    onKill(player) {
        this.killsMade++;
        if (this.killsMade >= this.killsNeeded) {
            player.heal(this.healAmount);
            this.killsMade = 0;
        }
        redrawSlotContents(player, SLOT.HEADWEAR);
    }
}