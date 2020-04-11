import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";

export class BookOfThunders extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_thunders.png"]);
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.type = WEAPON_TYPE.BOOK_OF_THUNDERS;
        this.atk = 1;
        this.maxUses = 5;
        this.uses = this.maxUses;
        this.focusTime = 4;
        this.primaryColor = 0xdec356;
        this.holdTime = 15; //?
        this.name = "Book of Thunders";
        this.description = "Cast single thunders in a large radius";
        this.rarity = RARITY.A;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;


        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }
}