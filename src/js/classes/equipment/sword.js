"use strict";

class Sword {
    constructor() {
        this.texture = Game.resources["src/images/weapons/sword.png"].texture;
        this.type = WEAPON_TYPE.SWORD;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX1 = wielder.tilePosition.x + tileDirX;
        const attackTileY1 = wielder.tilePosition.y + tileDirY;
        const attackTileX2 = wielder.tilePosition.x + tileDirX * 2;
        const attackTileY2 = wielder.tilePosition.y + tileDirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX1, attackTileY1)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX1, attackTileY1);
            attackTile(attackTileX1, attackTileY1, atk, tileDirX, tileDirY);
            return true;
        } else if (isEnemy(attackTileX2, attackTileY2) && isNotAWall(attackTileX1, attackTileY1)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX2, attackTileY2);
            attackTile(attackTileX2, attackTileY2, atk, tileDirX, tileDirY);
            return true;
        } else return false;
    }
}