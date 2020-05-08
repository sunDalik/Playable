import {Game} from "../../../game"
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY, STAGE,} from "../../../enums";
import {isDiggable, isEnemy, isImpassable, isObelisk, isWallTrap} from "../../../map_checks";
import {createFadingAttack, rotate} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {otherPlayer} from "../../../utils/game_utils";
import {MagicSpriteSheet} from "../../../loader";
import {ActiveEquipment} from "../active_equipment";

export class EternalCross extends ActiveEquipment {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_eternal_cross.png"];
        this.type = MAGIC_TYPE.ETERNAL_CROSS;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 3;
        this.uses = this.maxUses = 5;
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
        lightPlayerPosition(wielder);
        lightPlayerPosition(otherPlayer(wielder));
        rotate(wielder, true);
        this.uses--;
        return true;
    }

    attack(wielder, direction) {
        for (let x = wielder.tilePosition.x + direction.x, y = wielder.tilePosition.y + direction.y; ; x += direction.x, y += direction.y) {
            if (isImpassable(x, y)) break;
            if (isDiggable(x, y)) Game.world.removeTile(x, y, null);
            const attackSprite = new TileElement(PIXI.Texture.WHITE, x, y, true);
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