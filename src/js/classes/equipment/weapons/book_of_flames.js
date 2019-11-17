import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isNotAWall} from "../../../map_checks";
import {createFadingAttack} from "../../../animations";
import {FullTileElement} from "../../tile_elements/full_tile_element";
import * as PIXI from "pixi.js";

export class BookOfFlames {
    constructor() {
        this.texture = Game.resources["src/images/weapons/book_of_flames.png"].texture;
        this.type = WEAPON_TYPE.BOOK_OF_FLAMES;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 2;
        this.maxUses = 2;
        this.uses = this.maxUses;
        this.concentrationLimit = 3;
        this.concentration = 0;
    }

    attack(wielder, tileDirX, tileDirY) {
        if (this.uses <= 0) return false;
        return false;
    }

    concentrate() {
        if (this.uses < this.maxUses) {
            this.concentration++;
            if (this.concentration >= this.concentrationLimit) {
                this.concentration = 0;
                this.uses = this.maxUses;
            }
        } else return false;
    }
}