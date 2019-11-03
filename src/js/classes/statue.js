class Statue extends TallTileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        if (weapon === null) super(Game.resources["src/images/other/statue.png"].texture, tilePositionX, tilePositionY);
        else {
            switch (weapon.type) {
                case WEAPON_TYPE.KNIFE:
                    super(Game.resources["src/images/other/statue_knife.png"].texture, tilePositionX, tilePositionY);
                    break;
                case WEAPON_TYPE.SWORD:
                    super(Game.resources["src/images/other/statue_sword.png"].texture, tilePositionX, tilePositionY);
                    break;
                case WEAPON_TYPE.NINJA_KNIFE:
                    super(Game.resources["src/images/other/statue_ninja_knife.png"].texture, tilePositionX, tilePositionY);
                    break;
            }
        }
        this.weapon = weapon;
    }
}