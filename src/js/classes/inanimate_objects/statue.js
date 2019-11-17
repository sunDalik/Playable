import {Game} from "../../game"
import {TallTileElement} from "../tile_elements/tall_tile_element"
import {ROLE, INANIMATE_TYPE, WEAPON_TYPE} from "../../enums";
import {createFadingText, longShakeScreen} from "../../animations";
import {randomChoice} from "../../utils/random_utils";

export class Statue extends TallTileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(Game.resources["src/images/other/statue.png"].texture, tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.updateTexture();
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.STATUE;
        this.marauded = false;
    }

    updateTexture() {
        if (this.weapon === null) this.texture = Game.resources["src/images/other/statue.png"].texture;
        else switch (this.weapon.type) {
            case WEAPON_TYPE.KNIFE:
                this.texture = Game.resources["src/images/other/statue_knife.png"].texture;
                break;
            case WEAPON_TYPE.SWORD:
                this.texture = Game.resources["src/images/other/statue_sword.png"].texture;
                break;
            case WEAPON_TYPE.NINJA_KNIFE:
                this.texture = Game.resources["src/images/other/statue_ninja_knife.png"].texture;
                break;
            case WEAPON_TYPE.BOW:
                this.texture = Game.resources["src/images/other/statue_bow.png"].texture;
                break;
            case WEAPON_TYPE.BOOK_OF_FLAMES:
                this.texture = Game.resources["src/images/other/statue_book_of_flames.png"].texture;
                break;
            case WEAPON_TYPE.SCYTHE:
                this.texture = Game.resources["src/images/other/statue_scythe.png"].texture;
                break;
            case WEAPON_TYPE.MAIDEN_DAGGER:
                const option = randomChoice([1, 2]);
                if (option === 1) {
                    this.texture = Game.resources["src/images/other/statue_maiden_dagger.png"].texture;
                } else this.texture = Game.resources["src/images/other/statue_maiden_dagger_2.png"].texture;
                break;
        }
    }

    maraud() {
        if (!this.marauded) {
            createFadingText("Marauder!", this.position.x, this.position.y);
            longShakeScreen();
            this.marauded = true;
        }
    }
}