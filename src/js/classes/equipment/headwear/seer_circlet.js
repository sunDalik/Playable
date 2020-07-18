import {Game} from "../../../game";
import {EQUIPMENT_ID, EQUIPMENT_TYPE, INANIMATE_TYPE, RARITY, SLOT} from "../../../enums/enums";
import {otherPlayer} from "../../../utils/game_utils";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class SeerCirclet extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["seer_circlet.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.SEER_CIRCLET;
        this.name = "Seer Circlet";
        this.description = "Shows chest contents before opening them";
        this.rarity = RARITY.A;
    }

    onWear(wielder) {
        this.enableVision(wielder);
    }

    onTakeOff(wielder) {
        this.disableVision(wielder);
    }

    onDeath(wielder) {
        this.disableVision(wielder);
    }

    onRevive(wielder) {
        this.enableVision(wielder);
    }

    onNextLevel(wielder) {
        if (!wielder.dead) {
            this.enableVision(wielder);
        }
    }

    enableVision(wielder) {
        for (const inanimate of Game.inanimates) {
            if (inanimate.type === INANIMATE_TYPE.CHEST && !inanimate.opened) {
                inanimate.itemSprite.visible = inanimate.textObj.visible = true;
            }
        }
    }

    disableVision(wielder) {
        if (otherPlayer(wielder)[SLOT.HEADWEAR] && otherPlayer(wielder)[SLOT.HEADWEAR].id === this.id && !otherPlayer(wielder).dead) {
            return false;
        } else {
            for (const inanimate of Game.inanimates) {
                if (inanimate.type === INANIMATE_TYPE.CHEST && !inanimate.opened) {
                    inanimate.itemSprite.visible = inanimate.textObj.visible = false;
                }
            }
        }
    }
}