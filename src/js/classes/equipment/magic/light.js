import {Game} from "../../../game";
import * as PIXI from "pixi.js";
import {DAMAGE_TYPE, EQUIPMENT_ID, MAGIC_ALIGNMENT, STAGE} from "../../../enums/enums";
import {getPlayerOnTile, isEnemy, isNotAWall} from "../../../map_checks";
import {createFadingAttack, rotate} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Light extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_light.png"];
        this.id = EQUIPMENT_ID.LIGHT;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 1;
        this.healAmount = 0.5;
        this.uses = this.maxUses = 5;
        this.name = "Light";
        this.description = `Creates a circle of light around you that damages all enemies inside by ${this.atk} dmg and heals allies inside it by ${this.healAmount} HP`;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                const attackPositionX = wielder.tilePosition.x + x;
                const attackPositionY = wielder.tilePosition.y + y;
                if (!(x === 0 && y === 0) && Math.abs(x) + Math.abs(y) <= 2 && isNotAWall(attackPositionX, attackPositionY)) {
                    const attackSprite = new TileElement(PIXI.Texture.WHITE, attackPositionX, attackPositionY, true);
                    attackSprite.tint = 0xe9e7a0;
                    if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
                    createFadingAttack(attackSprite);
                    if (isEnemy(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage(wielder, wielder.getAtk(this), 0, 0, DAMAGE_TYPE.MAGICAL);
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.heal(this.healAmount);
                }
            }
        }
        rotate(wielder, true);
        this.uses--;
        return true;
    }
}