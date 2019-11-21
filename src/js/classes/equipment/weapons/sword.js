import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isNotAWall, isLit} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Sword {
    constructor() {
        this.texture = Game.resources["src/images/weapons/sword.png"].texture;
        this.type = WEAPON_TYPE.SWORD;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX1 = wielder.tilePosition.x + tileDirX;
        const attackTileY1 = wielder.tilePosition.y + tileDirY;
        const attackTileX2 = wielder.tilePosition.x + tileDirX * 2;
        const attackTileY2 = wielder.tilePosition.y + tileDirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX1, attackTileY1)) {
            createPlayerWeaponAnimation(wielder, attackTileX1, attackTileY1);
            Game.map[attackTileY1][attackTileX1].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else if (isEnemy(attackTileX2, attackTileY2) && isNotAWall(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            createPlayerWeaponAnimation(wielder, attackTileX2, attackTileY2);
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }
}