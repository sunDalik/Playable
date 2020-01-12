import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Spear {
    constructor() {
        this.texture = Game.resources["src/images/weapons/spear.png"].texture;
        this.type = WEAPON_TYPE.SPEAR;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Spear";
        this.description = "It isn't well suitable for a close-range combat...";
    }

    attack(wielder, tileDirX, tileDirY) {
        const tileX1 = wielder.tilePosition.x + tileDirX;
        const tileY1 = wielder.tilePosition.y + tileDirY;
        const attackTileX2 = wielder.tilePosition.x + tileDirX * 2;
        const attackTileY2 = wielder.tilePosition.y + tileDirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(tileX1, tileY1) && isLit(attackTileX2, attackTileY2)) {
            createPlayerWeaponAnimation(wielder, attackTileX2, attackTileY2, Game.TILESIZE / 4);
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }
}