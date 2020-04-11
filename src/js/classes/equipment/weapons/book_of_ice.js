import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";

export class BookOfIce extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_ice.png"]);
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.type = WEAPON_TYPE.BOOK_OF_ICE;
        this.atk = 1;
        this.maxUses = 3;
        this.uses = this.maxUses;
        this.focusTime = 3;
        this.primaryColor = 0x6696d7;
        this.holdTime = 15; //?
        this.name = "Book of Ice";
        this.description = "Cast stunning ice bolts";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;


        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }
}