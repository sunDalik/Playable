import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createPlayerWeaponAnimationSwing} from "../../../animations";

export class Knife {
    constructor() {
        this.texture = Game.resources["src/images/weapons/knife.png"].texture;
        this.type = WEAPON_TYPE.KNIFE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
        this.name = "Knife";
        this.description = "Basic weapon";
        this.rarity = RARITY.C;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createPlayerWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 4, 35, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }
}