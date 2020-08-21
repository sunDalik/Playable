import {ENEMY_TYPE} from "../../../enums/enums";
import {DCEnemiesSpriteSheet} from "../../../loader";
import {SmallMushroom} from "../fc/mushroom_small";
import {isNotAWall} from "../../../map_checks";
import {Game} from "../../../game";
import {PoisonHazard} from "../../hazards/poison";

export class PoisonCactus extends SmallMushroom {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["poison_cactus.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Poison Cactus";
        this.type = ENEMY_TYPE.POISON_CACTUS;
        this.walkingTexture = DCEnemiesSpriteSheet["poison_cactus_walking.png"];
        this.normalTexture = DCEnemiesSpriteSheet["poison_cactus.png"];
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
        for (let i = -3; i <= 3; i++) {
            if (isNotAWall(this.tilePosition.x, this.tilePosition.y + i)) {
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y + i, true));
            }
        }
    }
}