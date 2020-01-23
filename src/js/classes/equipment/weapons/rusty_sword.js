import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";

export class RustySword {
    constructor() {
        this.texture = Game.resources["src/images/weapons/rusty_sword.png"].texture;
        this.type = WEAPON_TYPE.RUSTY_SWORD;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 2;
        this.name = "Rusty Sword";
        this.description = "Powerful, but breakable";
        this.rarity = RARITY.UNIQUE;
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }
}