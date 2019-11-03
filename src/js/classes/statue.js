class Statue extends TallTileElement {
    constructor(tilePositionX, tilePositionY, weaponType) {
        switch (weaponType) {
            case WEAPON_TYPE.NONE:
                super(GameState.resources["src/images/other/statue.png"].texture, tilePositionX, tilePositionY);
                break;
            case WEAPON_TYPE.KNIFE:
                super(GameState.resources["src/images/other/statue_knife.png"].texture, tilePositionX, tilePositionY);
                break;
            case WEAPON_TYPE.SWORD:
                super(GameState.resources["src/images/other/statue_sword.png"].texture, tilePositionX, tilePositionY);
                break;
            case WEAPON_TYPE.NINJA_KNIFE:
                super(GameState.resources["src/images/other/statue_ninja_knife.png"].texture, tilePositionX, tilePositionY);
                break;
        }
    }
}