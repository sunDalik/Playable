import {ENEMY_TYPE} from "../../../enums/enums";
import {DCEnemiesSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {FireHazard} from "../../hazards/fire";
import {SmallMushroom} from "../fc/mushroom_small";
import {isNotAWall} from "../../../map_checks";

export class FireCactus extends SmallMushroom {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["fire_cactus.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Fire Cactus";
        this.type = ENEMY_TYPE.FIRE_CACTUS;
        this.walkingTexture = DCEnemiesSpriteSheet["fire_cactus_walking.png"];
        this.normalTexture = DCEnemiesSpriteSheet["fire_cactus.png"];
        // never spill poison
        this.currentPoisonDelay = 999;
        this.setScaleModifier(1);
        this.shadowWidthMul = 0.43;
        this.regenerateShadow();
    }

    move() {
        super.move();
        this.currentPoisonDelay = 999;
    }

    spillPoison() {
    }

    getWalkDelay() {
        return 4;
    }

    die(source) {
        super.die(source);
        // spill hazard on two sides vertically, stop if meet a wall
        for (const arr of [[-1, -2, -3], [0, 1, 2, 3]]) {
            for (const i of arr) {
                if (isNotAWall(this.tilePosition.x, this.tilePosition.y + i)) {
                    this.putHazard(this.tilePosition.x, this.tilePosition.y + i);
                } else break;
            }
        }
    }

    putHazard(tilePosX, tilePosY) {
        const fire = new FireHazard(tilePosX, tilePosY, true);
        fire.currentSpreadDelay = 0;
        fire.tileSpread = 2;
        Game.world.addHazard(fire);
    }
}