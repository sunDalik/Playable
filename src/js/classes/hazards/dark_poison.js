import {Game} from "../../game"
import {HAZARD_TYPE} from "../../enums";
import {PoisonHazard} from "./poison";

export class DarkPoisonHazard extends PoisonHazard {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/hazards/dark_poison.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.type = HAZARD_TYPE.DARK_POISON;
    }
}