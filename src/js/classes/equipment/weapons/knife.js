"use strict";

class Knife {
    constructor() {
        this.texture = Game.resources["src/images/weapons/knife.png"].texture;
        this.type = WEAPON_TYPE.KNIFE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX, attackTileY)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX, attackTileY);
            Game.map[attackTileY][attackTileX].entity.damage(atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }
}