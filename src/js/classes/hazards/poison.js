import {Game} from "../../game"
import {Hazard} from "./hazard";
import {HAZARD_TYPE} from "../../enums";
import {HazardsSpriteSheet} from "../../loader";

export class PoisonHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, startAt0Atk = false, texture = HazardsSpriteSheet["hazard_poison.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 12;
        this.turnsLeft = this.LIFETIME;
        this.type = HAZARD_TYPE.POISON;
        this.actualAtk = 0.5;
        if (startAt0Atk) this.atk = 0;
        else this.atk = 0.5;
    }

    turnToDark() {
        if (this.type === HAZARD_TYPE.POISON) {
            this.type = HAZARD_TYPE.DARK_POISON;
            this.texture = HazardsSpriteSheet["hazard_dark_poison.png"];
            this.turnsLeft += 3;
        }
    }

    updateLifetime() {
        if (this.atk === 0) this.atk = this.actualAtk;
        return super.updateLifetime();
    }
}

export class DarkPoisonHazard extends PoisonHazard {
    constructor(tilePositionX, tilePositionY, startAt0Atk = false, texture = HazardsSpriteSheet["hazard_dark_poison.png"]) {
        super(tilePositionX, tilePositionY, startAt0Atk, texture);
        this.type = HAZARD_TYPE.DARK_POISON;
    }
}