import {Game} from "../../../game";
import {camera} from "../../game/camera";
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY, SLOT} from "../../../enums";
import {
    drawInteractionKeys,
    drawMovementKeyBindings,
    redrawSlotContents,
    redrawSlotContentsForPlayer
} from "../../../drawing/draw_hud";
import {otherPlayer} from "../../../utils/game_utils";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Necromancy extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_necromancy.png"];
        this.type = MAGIC_TYPE.NECROMANCY;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.uses = this.maxUses = 1;
        this.name = "Necromancy";
        this.description = "Revive a fallen character\nThis magic vanishes when exhausted";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.removeIfExhausted(wielder)) return false;
        const revivedPlayer = otherPlayer(wielder);
        if (revivedPlayer.dead) {
            //todo add revive method probably
            //todo add animation
            revivedPlayer.dead = false;
            revivedPlayer.visible = true;
            revivedPlayer.regenerateShadow();
            Game.world.addChild(revivedPlayer);
            revivedPlayer.health = revivedPlayer.maxHealth;
            revivedPlayer.tilePosition.set(wielder.tilePosition.x, wielder.tilePosition.y);
            revivedPlayer.placeOnMap();
            revivedPlayer.place();
            drawMovementKeyBindings();
            drawInteractionKeys();
            redrawSlotContentsForPlayer(revivedPlayer);
            camera.center();
            for (const eq of revivedPlayer.getEquipment()) {
                if (eq && eq.onRevive) {
                    eq.onRevive(revivedPlayer);
                }
            }
            this.uses--;
            //maybe should shift all magic to left? who knows...
            this.removeIfExhausted(wielder);
            return true;
        } else return false;
    }

    removeIfExhausted(wielder) {
        if (this.uses <= 0) {
            for (const slot of [SLOT.MAGIC1, SLOT.MAGIC2, SLOT.MAGIC3]) {
                if (wielder[slot] === this) {
                    wielder[slot] = null;
                    redrawSlotContents(wielder, slot);
                    return true;
                }
            }
        }
        return false;
    }
}