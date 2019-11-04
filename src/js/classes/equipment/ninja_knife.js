class NinjaKnife {
    constructor() {
        this.texture = Game.resources["src/images/weapons/ninja_knife.png"].texture;
        this.type = WEAPON_TYPE.NINJA_KNIFE;
        this.atk = 1.25
    }

    //placeholder
    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            createWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX, attackTileY);
            attackTile(attackTileX, attackTileY, wielder.atk + this.atk, tileDirX, tileDirY);
            return true;
        } else return false;
    }
}