"use strict";

class Statue extends TallTileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(Game.resources["src/images/other/statue.png"].texture, tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.updateTexture();
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.STATUE;
    }

    updateTexture() {
        if (this.weapon === null) this.texture = Game.resources["src/images/other/statue.png"].texture;
        else switch (this.weapon.type) {
            case WEAPON_TYPE.NONE:
                this.texture = Game.resources["src/images/other/statue.png"].texture;
                break;
            case WEAPON_TYPE.KNIFE:
                this.texture = Game.resources["src/images/other/statue_knife.png"].texture;
                break;
            case WEAPON_TYPE.SWORD:
                this.texture = Game.resources["src/images/other/statue_sword.png"].texture;
                break;
            case WEAPON_TYPE.NINJA_KNIFE:
                this.texture = Game.resources["src/images/other/statue_ninja_knife.png"].texture;
                break;
        }
    }
}