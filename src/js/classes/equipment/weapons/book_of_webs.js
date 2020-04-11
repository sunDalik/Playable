import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";

export class BookOfWebs extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_webs.png"]);
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.type = WEAPON_TYPE.BOOK_OF_WEBS;
        this.atk = 1.5;
        this.maxUses = 1;
        this.uses = this.maxUses;
        this.focusTime = 3;
        this.primaryColor = 0xf4f4f4;
        this.holdTime = 20;
        this.name = "Book of Webs";
        this.description = "Cast a single huge web";
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