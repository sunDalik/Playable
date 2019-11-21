import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Knife {
    constructor() {
        this.texture = Game.resources["src/images/weapons/knife.png"].texture;
        this.type = WEAPON_TYPE.KNIFE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createPlayerWeaponAnimation(wielder, attackTileX, attackTileY);
            Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }
}