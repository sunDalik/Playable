import {ENEMY_TYPE} from "../../../enums/enums";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {PoisonHazard} from "../../hazards/poison";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {getEmptyRunAwayOptions, getRelativelyEmptyLitCardinalDirections} from "../../../utils/map_utils";
import {FireCactus} from "./fire_cactus";

// todo make it so that it ALWAYS runs away even after choosing a direction
export class PoisonCactus extends FireCactus {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["poison_cactus.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Poison Cactus";
        this.type = ENEMY_TYPE.POISON_CACTUS;
        this.walkingTexture = DCEnemiesSpriteSheet["poison_cactus_walking.png"];
        this.normalTexture = DCEnemiesSpriteSheet["poison_cactus.png"];
    }

    getDirections() {
        let movementOptions = [];
        if (tileDistance(this, closestPlayer(this)) <= 2) {
            movementOptions = getEmptyRunAwayOptions(this, closestPlayer(this));
        }
        if (movementOptions.length === 0) movementOptions = getRelativelyEmptyLitCardinalDirections(this);
        return movementOptions;
    }

    putHazard(tilePosX, tilePosY) {
        Game.world.addHazard(new PoisonHazard(tilePosX, tilePosY, true));
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.walking && tileDistance(this, closestPlayer(this)) <= 2) {
            this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
            this.intentIcon.angle = 0;
        }
    }
}