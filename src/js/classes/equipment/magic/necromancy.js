import {Game} from "../../../game";
import {camera} from "../../game/camera";
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {
    drawInteractionKeys,
    drawMovementKeyBindings,
    redrawAllMagicSlots,
    redrawHealthForPlayer,
    redrawWeaponAndSecondHand
} from "../../../drawing/draw_hud";
import {otherPlayer} from "../../../utils/game_utils";
import {MagicSpriteSheet} from "../../../loader";
import {ActiveEquipment} from "../active_equipment";

export class Necromancy extends ActiveEquipment {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_necromancy.png"];
        this.type = MAGIC_TYPE.NECROMANCY;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.atk = 0;
        this.uses = this.maxUses = 1;
        this.name = "Necromancy";
        this.description = "Return your beloved";
        this.rarity = RARITY.B;
    }

    cast(wielder) {
        if (this.removeIfExhausted(wielder)) return false;
        const revivedPlayer = otherPlayer(wielder);
        if (revivedPlayer.dead) {
            //todo add revive method probably and also restore shadow
            revivedPlayer.dead = false;
            revivedPlayer.visible = true;
            revivedPlayer.regenerateShadow();
            Game.world.addChild(revivedPlayer);
            revivedPlayer.health = revivedPlayer.maxHealth;
            redrawHealthForPlayer(revivedPlayer);
            revivedPlayer.tilePosition.set(wielder.tilePosition.x, wielder.tilePosition.y);
            revivedPlayer.placeOnMap();
            revivedPlayer.place();
            drawMovementKeyBindings();
            drawInteractionKeys();
            redrawWeaponAndSecondHand(revivedPlayer);
            redrawAllMagicSlots(revivedPlayer);
            camera.center();
            for (const eq of revivedPlayer.getEquipment()) {
                if (eq && eq.onRevive) {
                    eq.onRevive(revivedPlayer);
                }
            }
            this.uses--;
            //maybe should shift all magic to left? who knows...
            this.removeIfExhausted(wielder);
        } else return false;
        return true;
    }

    removeIfExhausted(wielder) {
        if (this.uses <= 0) {
            for (let i = 1; i <= 4; ++i) {
                if (wielder.getMagicById(i) === this) {
                    wielder.setMagicById(i, null);
                    return true;
                }
            }
        }
        return false;
    }
}