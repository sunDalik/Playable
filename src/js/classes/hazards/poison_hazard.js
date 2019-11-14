import {Game} from "../../game"
import {Hazard} from "./hazard";

export class PoisonHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/hazards/poison.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 12;
        this.turnsLeft = this.LIFETIME;
        this.atk = 0.5;
    }
}