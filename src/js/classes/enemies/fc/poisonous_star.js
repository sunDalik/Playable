import {ENEMY_TYPE} from "../../../enums/enums";
import {FCEnemiesSpriteSheet} from "../../../loader";
import {Star} from "./star";
import {Game} from "../../../game";
import {PoisonHazard} from "../../hazards/poison";

export class PoisonousStar extends Star {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["poisonous_star.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Poisonous Star";
        this.type = ENEMY_TYPE.POISONOUS_STAR;
        this.spikeColor = 0x8257a6;
        this.currentTurnDelay = this.turnDelay = 2;
    }


    attackTileAtOffset(tileOffsetX, tileOffsetY) {
        super.attackTileAtOffset(tileOffsetX, tileOffsetY);
        Game.world.addHazard(new PoisonHazard(this.tilePosition.x + tileOffsetX, this.tilePosition.y + tileOffsetY));
    }
}