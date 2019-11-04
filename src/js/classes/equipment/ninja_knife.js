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
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX, attackTileY)) {
            createPlayerWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX, attackTileY);
            attackTile(attackTileX, attackTileY, atk, tileDirX, tileDirY);
            return true;
        } else return false;
    }
}