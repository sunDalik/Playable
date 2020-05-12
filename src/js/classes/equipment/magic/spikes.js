import {Game} from "../../../game";
import * as PIXI from "pixi.js";
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY, STAGE} from "../../../enums";
import {getPlayerOnTile, isEnemy, isNotAWall, isObelisk} from "../../../map_checks";
import {createFadingAttack, rotate} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Spikes  extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_spikes.png"];
        this.type = MAGIC_TYPE.SPIKES;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 2;
        this.friendlyFire = 1;
        this.uses = this.maxUses = 4;
        this.name = "Spikes";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign <= 1; sign += 2) {
                const attackPositionX = wielder.tilePosition.x + offset;
                const attackPositionY = wielder.tilePosition.y + offset * sign;
                if (offset !== 0 && isNotAWall(attackPositionX, attackPositionY)) {
                    const attackSprite = new TileElement(PIXI.Texture.WHITE, attackPositionX, attackPositionY, true);
                    attackSprite.tint = 0x485164;
                    if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
                    createFadingAttack(attackSprite);
                    if (isEnemy(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage(wielder, this.atk, 0, 0, true);
                    } else if (isObelisk(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage();
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.damage(this.friendlyFire, wielder);
                }
            }
        }
        rotate(wielder, false);
        this.uses--;
        return true;
    }
}