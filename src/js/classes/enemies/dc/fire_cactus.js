import {ENEMY_TYPE} from "../../../enums/enums";
import {DCEnemiesSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {PoisonCactus} from "./poison_cactus";
import {FireHazard} from "../../hazards/fire";

export class FireCactus extends PoisonCactus {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["fire_cactus.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Fire Cactus";
        this.type = ENEMY_TYPE.FIRE_CACTUS;
        this.walkingTexture = DCEnemiesSpriteSheet["fire_cactus_walking.png"];
        this.normalTexture = DCEnemiesSpriteSheet["fire_cactus.png"];
    }

    putHazard(tilePosX, tilePosY) {
        const fire = new FireHazard(tilePosX, tilePosY, true);
        fire.currentSpreadDelay = 0;
        fire.tileSpread = 2;
        Game.world.addHazard(fire);
    }
}