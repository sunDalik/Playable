import {Game} from "../../../game";
import {camera} from "../../game/camera";
import {EQUIPMENT_ID, MAGIC_ALIGNMENT, SLOT} from "../../../enums/enums";
import {
    drawInteractionKeys,
    drawMovementKeyBindings,
    redrawSlotContents,
    redrawSlotContentsForPlayer
} from "../../../drawing/draw_hud";
import {otherPlayer} from "../../../utils/game_utils";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {TileElement} from "../../tile_elements/tile_element";
import {easeOutQuad} from "../../../utils/math_utils";

export class Necromancy extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_necromancy.png"];
        this.id = EQUIPMENT_ID.NECROMANCY;
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
            camera.moveToCenter(10);
            for (const eq of revivedPlayer.getEquipment()) {
                if (eq && eq.onRevive) {
                    eq.onRevive(revivedPlayer);
                }
            }
            this.animate(wielder);
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

    animate(wielder) {
        const skull = new TileElement(MagicSpriteSheet["magic_necromancy.png"], wielder.tilePosition.x, wielder.tilePosition.y - 0.5);
        Game.world.addChild(skull);
        const initSize = skull.width;
        const sizeChange = Game.TILESIZE / 4;
        const startPosY = skull.position.y;
        const posYEndChange = -Game.TILESIZE / 2;
        skull.zIndex = otherPlayer(Game.primaryPlayer).zIndex - 1;

        const animationTime = 50;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            skull.position.y = startPosY + easeOutQuad(counter / animationTime) * posYEndChange;
            skull.height = skull.width = initSize + easeOutQuad(counter / animationTime) * sizeChange;
            if (counter >= animationTime * 3 / 4) {
                skull.alpha = 1 - easeOutQuad((counter - animationTime * 3 / 4) / (animationTime / 4));
            }

            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(skull);
                skull.destroy();
            }
        };

        Game.app.ticker.add(animation);
    }
}