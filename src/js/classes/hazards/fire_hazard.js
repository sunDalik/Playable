import {Game} from "../../game"
import {Hazard} from "./hazard";
import {HAZARD_TYPE} from "../../enums";
import {
    addHazardOrRefresh,
    get8Directions,
    getCardinalDirectionsWithNoHazards,
} from "../../utils/map_utils";
import {isNotAWall} from "../../map_checks";
import {randomChoice, randomShuffle} from "../../utils/random_utils";

export class FireHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, subFire = false, texture = Game.resources["src/images/hazards/fire.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 14;
        this.subFire = subFire;
        this.actualAtk = 0.5;
        if (subFire) {
            this.small = true;
            this.texture = Game.resources["src/images/hazards/fire_small.png"].texture;
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
            if (this.small) {
                this.texture = Game.resources["src/images/hazards/fire.png"].texture;
                this.small = false;
                this.atk = this.actualAtk;
            }
            if (!this.subFire && this.spreadTimes > 0 && this.currentSpreadDelay <= 0) {
                if (this.currentFires.length === 0) {
                    let spreadCounter = this.tileSpread;
                    for (const dir of randomShuffle(get8Directions())) {
                        if (spreadCounter <= 0) break;
                        if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                            const newFire = addHazardOrRefresh(new FireHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true))
                            this.currentFires.push(newFire);
                        }
                        spreadCounter--;
                    }
                } else {
                    let newFires = [];
                    for (const fire of this.currentFires) {
                        const spreadDir = randomChoice(getCardinalDirectionsWithNoHazards(fire));
                        if (spreadDir !== undefined) {
                            if (isNotAWall(fire.tilePosition.x + spreadDir.x, fire.tilePosition.y + spreadDir.y)) {
                                const newFire = addHazardOrRefresh(new FireHazard(fire.tilePosition.x + spreadDir.x, fire.tilePosition.y + spreadDir.y, true))
                                newFires.push(newFire);
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

    refreshLifetime() {
        super.refreshLifetime();
    }
}