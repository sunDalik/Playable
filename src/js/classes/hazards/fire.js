import {Game} from "../../game"
import {Hazard} from "./hazard";
import {HAZARD_TYPE} from "../../enums";
import {get8Directions, getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall} from "../../map_checks";
import {randomChoice, randomShuffle} from "../../utils/random_utils";
import {addHazardToWorld} from "../../game_logic";

export class FireHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, subFire = false, texture = Game.resources["src/images/hazards/fire.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.normalTexture = Game.resources["src/images/hazards/fire.png"].texture;
        this.smallTexture = Game.resources["src/images/hazards/fire_small.png"].texture;
        this.LIFETIME = 14;
        this.subFire = subFire;
        this.actualAtk = 0.5;
        if (subFire) {
            this.small = true;
            this.texture = this.smallTexture;
            this.atk = 0;
        } else {
            this.small = false;
            this.currentFires = [];
            this.tileSpread = 5;
            this.maxSpreadTimes = 3;
            this.spreadDelay = 2;
            this.currentSpreadDelay = this.spreadDelay - 1;
            this.spreadTimes = this.maxSpreadTimes;
            this.atk = this.actualAtk;
        }
        this.turnsLeft = this.LIFETIME;
        this.type = HAZARD_TYPE.FIRE;
    }

    updateLifetime() {
        if (super.updateLifetime()) {
            if (this.small && this.turnsLeft > 0) {
                this.texture = this.normalTexture;
                this.small = false;
                this.atk = this.actualAtk;
            }
            if (!this.subFire && this.spreadTimes > 0 && this.currentSpreadDelay <= 0) {
                if (this.currentFires.length === 0) {
                    let spreadCounter = this.tileSpread;
                    for (const dir of randomShuffle(get8Directions())) {
                        if (spreadCounter <= 0) break;
                        if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                            addHazardToWorld(new this.constructor(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true));
                            const newHazard = Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].hazard;
                            if (newHazard && newHazard.type === this.type)
                                this.currentFires.push(newHazard);
                        }
                        spreadCounter--;
                    }
                } else {
                    let newFires = [];
                    for (const fire of this.currentFires) {
                        const spreadDir = randomChoice(this.getCardinalDirectionsWithNoHazardsOfType(fire));
                        if (spreadDir !== undefined && fire.turnsLeft > 0) {
                            if (isNotAWall(fire.tilePosition.x + spreadDir.x, fire.tilePosition.y + spreadDir.y)) {
                                addHazardToWorld(new this.constructor(fire.tilePosition.x + spreadDir.x, fire.tilePosition.y + spreadDir.y, true))
                                const newHazard = Game.map[fire.tilePosition.y + spreadDir.y][fire.tilePosition.x + spreadDir.x].hazard;
                                if (newHazard && newHazard.type === this.type)
                                    newFires.push(newHazard);
                            }
                        }
                    }
                    this.currentFires = newFires;
                }
                this.currentSpreadDelay = this.spreadDelay;
                this.spreadTimes--;
            } else if (this.currentSpreadDelay > 0) {
                this.currentSpreadDelay--;
            }
        }
    }

    extinguish() {
        this.small = true;
        this.texture = this.smallTexture;
        this.atk = 0;
        this.spreadTimes = 0;
        this.turnsLeft = 1;
    }

    ignite() {
        this.spreadTimes++;
        this.turnsLeft += 2;
        if (this.spreadTimes > this.maxSpreadTimes) this.spreadTimes = this.maxSpreadTimes;
    }

    refreshLifetime() {
        super.refreshLifetime();
    }

    getCardinalDirectionsWithNoHazardsOfType(tileElement) {
        let directions = [];
        for (const dir of getCardinalDirections()) {
            if (Game.map[tileElement.tilePosition.y + dir.y][tileElement.tilePosition.x + dir.x].hazard === null
                || Game.map[tileElement.tilePosition.y + dir.y][tileElement.tilePosition.x + dir.x].hazard.type !== tileElement.type) {
                directions.push(dir);
            }
        }
        return directions;
    }
}