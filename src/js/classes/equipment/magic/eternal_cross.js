import {Game} from "../../../game"
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY, STAGE,} from "../../../enums";
import {isAnyWall, isEnemy, isObelisk, isWallTrap} from "../../../map_checks";
import {createFadingAttack, rotate} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import * as PIXI from "pixi.js";

export class EternalCross {
    constructor() {
        this.texture = Game.resources["src/images/magic/eternal_cross.png"].texture;
        this.type = MAGIC_TYPE.ETERNAL_CROSS;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 3;
        this.maxUses = 5;
        this.uses = this.maxUses;
        this.name = "Eternal Cross";
        this.description = "The unbounded divinity";
        this.rarity = RARITY.S;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        this.attack(wielder, {x: 1, y: 0});
        this.attack(wielder, {x: -1, y: 0});
        this.attack(wielder, {x: 0, y: 1});
        this.attack(wielder, {x: 0, y: -1});
        rotate(wielder, true);
        this.uses--;
        return true;
    }

    attack(wielder, direction) {
        for (let x = wielder.tilePosition.x + direction.x, y = wielder.tilePosition.y + direction.y; ; x += direction.x, y += direction.y) {
            if (isAnyWall(x, y, false)) break;
            const attackSprite = new TileElement(PIXI.Texture.WHITE, x, y);
            attackSprite.zIndex = Game.primaryPlayer.zIndex + 1;
            attackSprite.tint = 0x57c799;
            if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
            createFadingAttack(attackSprite);
            if (isEnemy(x, y) || isWallTrap(x, y)) {
                Game.map[y][x].entity.damage(wielder, this.atk, 0, 0, true, false);
            } else if (isObelisk(x, y)) {
                Game.map[y][x].entity.destroy();
            }
        }
    }
}