import * as PIXI from "pixi.js"
import {Game} from "../../game"
import {Hazard} from "./hazard";
import {HAZARD_TYPE, STAGE} from "../../enums";
import {get8Directions, getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall} from "../../map_checks";
import {randomShuffle} from "../../utils/random_utils";

export class FireHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, small = false, spreadTimes = undefined, texture = Game.resources["src/images/hazards/fire.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.normalTexture = Game.resources["src/images/hazards/fire.png"].texture;
        this.smallTexture = Game.resources["src/images/hazards/fire_small.png"].texture;
        this.LIFETIME = 14;
        this.actualAtk = 0.5;
        this.small = small;
        this.subFire = small;
        this.maxSpreadTimes = 3;
        if (spreadTimes !== undefined) this.spreadTimes = spreadTimes;
        else this.spreadTimes = this.maxSpreadTimes;
        this.spreadDelay = 1;
        this.currentSpreadDelay = this.spreadDelay;
        if (this.small) {
            this.tileSpread = 1;
            this.texture = this.smallTexture;
            this.atk = 0;
        } else {
            this.tileSpread = 5;
            this.atk = this.actualAtk;
        }
        this.turnsLeft = this.LIFETIME;
        this.type = HAZARD_TYPE.FIRE;
    }

    addToWorld() {
        super.addToWorld();
        if (Game.stage === STAGE.DARK_TUNNEL) {
            //this.maskLayer = new PIXI.Sprite(PIXI.Texture.WHITE);
            this.maskLayer = {};
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        }
    }

    removeFromWorld() {
        super.removeFromWorld();
        if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
    }

    updateLifetime() {
        if (super.updateLifetime()) {
            if (this.small && this.turnsLeft > 0) {
                this.texture = this.normalTexture;
                this.small = false;
                this.atk = this.actualAtk;
            } else if (!this.small && this.spreadTimes > 0 && this.currentSpreadDelay <= 0) {
                let spreadCounter = this.tileSpread;
                let directionsArray;
                if (!this.subFire) directionsArray = this.getDirectionsWithNoHazardsOfType(false);
                else {
                    if (Math.random() < 0.8) directionsArray = this.getDirectionsWithNoHazardsOfType(true);
                    else directionsArray = this.getDirectionsWithNoHazardsOfType(false)
                }
                for (const dir of randomShuffle(directionsArray)) {
                    if (spreadCounter <= 0) break;
                    if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                        if (this.type === HAZARD_TYPE.FIRE) {
                            Game.world.addHazard(new FireHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true, this.spreadTimes - 1));
                        } else if (this.type === HAZARD_TYPE.DARK_FIRE) {
                            Game.world.addHazard(new DarkFireHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true, this.spreadTimes - 1));
                        }
                    }
                    spreadCounter--;
                }
                this.currentSpreadDelay = this.spreadDelay;
                this.spreadTimes = 0;
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
        this.turnsLeft += 3;
        if (this.spreadTimes > this.maxSpreadTimes) this.spreadTimes = this.maxSpreadTimes;
    }

    getDirectionsWithNoHazardsOfType(cardinalsOnly = false) {
        let directions = [];
        const dirArray = cardinalsOnly ? getCardinalDirections() : get8Directions();
        for (const dir of dirArray) {
            if (Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].hazard === null
                || Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].hazard.type !== this.type) {
                directions.push(dir);
            }
        }
        return directions;
    }

    turnToDark() {
        if (this.type === HAZARD_TYPE.FIRE) {
            this.type = HAZARD_TYPE.DARK_FIRE;
            this.normalTexture = Game.resources["src/images/hazards/dark_fire.png"].texture;
            this.smallTexture = Game.resources["src/images/hazards/dark_fire_small.png"].texture;
            if (this.subFire) {
                if (Math.random() < 0.5) {
                    this.tileSpread++;
                    this.spreadTimes += 2;
                } else {
                    this.tileSpread += 2;
                    this.spreadTimes++;
                }
            }
            if (this.small) this.texture = this.smallTexture;
            else this.texture = this.normalTexture;
            this.turnsLeft += 3;
        }
    }
}

export class DarkFireHazard extends FireHazard {
    constructor(tilePositionX, tilePositionY, small = false, spreadTimes = undefined, texture = Game.resources["src/images/hazards/dark_fire.png"].texture) {
        super(tilePositionX, tilePositionY, small, spreadTimes, texture);
        this.type = HAZARD_TYPE.DARK_FIRE;
        this.normalTexture = Game.resources["src/images/hazards/dark_fire.png"].texture;
        this.smallTexture = Game.resources["src/images/hazards/dark_fire_small.png"].texture;
        if (small) this.texture = this.smallTexture;
    }
}