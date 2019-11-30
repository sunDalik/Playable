import {Game} from "../../game"
import {Hazard} from "./hazard";
import {HAZARD_TYPE} from "../../enums";

export class PoisonHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/hazards/poison.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 12;
        this.turnsLeft = this.LIFETIME;
        this.type = HAZARD_TYPE.POISON;
        this.atk = 0.5;
    }
}