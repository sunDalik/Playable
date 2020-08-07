import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE, RABBIT_TYPE} from "../../../enums/enums";
import {getRandomValue} from "../../../utils/random_utils";
import {isAnyWall, isInanimate} from "../../../map_checks";
import {FireHazard} from "../../hazards/fire";
import {PoisonHazard} from "../../hazards/poison";
import {ElectricBullet} from "../bullets/electric";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {randomAfraidAI} from "../../../enemy_movement_ai";

export class Rabbit extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["rabbit_x_fire.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.5;
        this.name = "Rabbit";
        this.type = ENEMY_TYPE.RABBIT;
        this.rabbitType = getRandomValue(RABBIT_TYPE);
        this.atk = 0.5;
        this.predator = null;
        this.currentTurnDelay = this.turnDelay = 1;
        this.stepXjumpHeight = Game.TILESIZE * 70 / 75;
        this.setScaleModifier(0.8);
        this.updateTexture();
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
        }
    }

    move() {
        if (this.predator && !this.predator.dead) {
            return false;
        } else if (this.currentTurnDelay <= 0) {
            this.predator = null;
            randomAfraidAI(this, 2);
        } else this.currentTurnDelay--;
    }

    die(source, eaten = false) {
        super.die(source);
        this.predator = null;
        if (!eaten) {
            if (this.rabbitType === RABBIT_TYPE.FIRE) {
                Game.world.addHazard(new FireHazard(this.tilePosition.x, this.tilePosition.y));
            } else if (this.rabbitType === RABBIT_TYPE.POISON) {
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x + 1, this.tilePosition.y, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x - 1, this.tilePosition.y, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y + 1, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y - 1, true));
            } else if (this.rabbitType === RABBIT_TYPE.ELECTRIC) {
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: 1, y: 1}]));
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: -1, y: 1}]));
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: 1, y: -1}]));
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: -1, y: -1}]));
            }
        }
    }

    updateTexture() {
        switch (this.rabbitType) {
            case RABBIT_TYPE.ELECTRIC:
                this.texture = DTEnemiesSpriteSheet["rabbit_x_electric.png"];
                break;
            case RABBIT_TYPE.FIRE:
                this.texture = DTEnemiesSpriteSheet["rabbit_x_fire.png"];
                break;
            case RABBIT_TYPE.POISON:
                this.texture = DTEnemiesSpriteSheet["rabbit_x_poison.png"];
                break;
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.predator && !this.predator.dead) {
            this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= 2) {
            this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}