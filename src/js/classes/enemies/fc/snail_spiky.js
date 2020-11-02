import {Snail} from "./snail";
import {ENEMY_TYPE} from "../../../enums/enums";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class SpikySnail extends Snail {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["snail_spiky.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 5;
        this.name = "Spiky Snail";
        this.currentTurnDelay = this.turnDelay = 2;
        this.atk = 1.25;
        this.type = ENEMY_TYPE.SNAIL_SPIKY;
    }

    canBeGolden() {
        return this.type === ENEMY_TYPE.SNAIL_SPIKY;
    }

    becomeGolden() {
        super.becomeGolden();
        this.texture = FCEnemiesSpriteSheet["golden_snail_spiky.png"];
    }
}