"use strict";

class Bow {
    constructor() {
        this.texture = Game.resources["src/images/weapons/bow.png"].texture;
        this.type = WEAPON_TYPE.BOW;
        this.atk = 0.75;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX1 = wielder.tilePosition.x + tileDirX;
        const attackTileY1 = wielder.tilePosition.y + tileDirY;
        const attackTileX2 = wielder.tilePosition.x + tileDirX * 2;
        const attackTileY2 = wielder.tilePosition.y + tileDirY * 2;
        const attackTileX3 = wielder.tilePosition.x + tileDirX * 3;
        const attackTileY3 = wielder.tilePosition.y + tileDirY * 3;
        const atk = wielder.getAtkWithWeapon(this);
        //maybe should weaken close-range attacks for bow? who knows...
        if (isEnemy(attackTileX1, attackTileY1)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX1, attackTileY1, true);
            Game.map[attackTileY1][attackTileX1].entity.damage(atk, tileDirX, tileDirY, false);
            return true;
            //Assuming that tiles directly adjacent to players are always lit
        } else if (isEnemy(attackTileX2, attackTileY2) && isNotAWall(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX2, attackTileY2, true);
            Game.map[attackTileY2][attackTileX2].entity.damage(atk, tileDirX, tileDirY, false);
            return true;
        } else if (isEnemy(attackTileX3, attackTileY3) && isNotAWall(attackTileX2, attackTileY2) && isNotAWall(attackTileX1, attackTileY1) && isLit(attackTileX3, attackTileY3) && isLit(attackTileX2, attackTileY2)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX3, attackTileY3, true);
            Game.map[attackTileY3][attackTileX3].entity.damage(atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }
}