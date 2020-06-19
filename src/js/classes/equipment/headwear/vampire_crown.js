import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY, SLOT} from "../../../enums";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class VampireCrown extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["vampire_crown.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.VAMPIRE_CROWN;
        this.killsNeeded = 10;
        this.killsMade = 0;
        this.healAmount = 1;
        this.name = "Vampire Crown";
        this.description = "Every 10th kill heals you by 1 HP";
        this.rarity = RARITY.B;
    }

    onKill(player, enemy) {
        if (!enemy.isMinion) {
            this.killsMade++;
            if (this.killsMade >= this.killsNeeded) {
                player.heal(this.healAmount);
                this.killsMade = 0;
            }
            redrawSlotContents(player, SLOT.HEADWEAR);
        }
    }
}