import {Game} from "../../game"
import {HAZARD_TYPE} from "../../enums";
import {FireHazard} from "./fire";

export class DarkFireHazard extends FireHazard {
    constructor(tilePositionX, tilePositionY, subFire = false, texture = Game.resources["src/images/hazards/dark_fire.png"].texture) {
        super(tilePositionX, tilePositionY, subFire, texture);
        this.type = HAZARD_TYPE.DARK_FIRE;
        this.normalTexture = Game.resources["src/images/hazards/dark_fire.png"].texture;
        this.smallTexture = Game.resources["src/images/hazards/dark_fire_small.png"].texture;
        if (subFire) this.texture = this.smallTexture;
    }
}