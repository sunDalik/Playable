class Sword {
    constructor() {
        this.texture = Game.resources["src/images/weapons/sword.png"].texture;
        this.type = WEAPON_TYPE.SWORD;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX * 2;
        const attackTileY = wielder.tilePosition.y + tileDirY * 2;
        if (isEnemy(attackTileX, attackTileY)) {
            createWeaponAnimation(wielder.tilePosition.x, wielder.tilePosition.y, attackTileX, attackTileY);
            attackTile(attackTileX, attackTileY, wielder.atk + this.atk, tileDirX, tileDirY);
            return true;
        } else return false;
    }
}