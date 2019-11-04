class NinjaKnife {
    constructor() {
        this.texture = Game.resources["src/images/weapons/ninja_knife.png"].texture;
        this.type = WEAPON_TYPE.NINJA_KNIFE;
        this.atk = 1.25
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX, attackTileY)) {
            this.createNinjaKnifeAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX, attackTileY);
            attackTile(attackTileX, attackTileY, atk, tileDirX, tileDirY, this);
            if (isNotAWallOrEnemy(wielder.tilePosition.x + tileDirX * 2, wielder.tilePosition.y + tileDirY * 2)) {
                if (tileDirX !== 0) wielder.slideX(tileDirX * 2, 4);
                else if (tileDirY !== 0) wielder.slideY(tileDirY * 2, 4);
                if (Game.gameMap[attackTileY][attackTileX].entity) Game.gameMap[attackTileY][attackTileX].entity.stun = 1;
            }
            return true;
        } else return false;
    }

    createNinjaKnifeAnimation() {

    }
}