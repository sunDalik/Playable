import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Enemy} from "./enemy";
import {PoisonHazard} from "../hazards/poison_hazard";
import {getRandomInt, randomChoice} from "../../utils/random_utils";
import {addHazardOrRefresh, getRelativelyEmptyHorizontalDirections} from "../../utils/map_utils";
import {getPlayerOnTile, isEmpty} from "../../map_checks";

export class Mushroom extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mushroom.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.MUSHROOM;
        this.poisonDelay = 6; //half of poison hazard lifetime
        this.currentPoisonDelay = 0;
        this.walkDelay = this.getWalkDelay();
        this.walking = false;
        this.standing = false;
        this.atk = 0.5;
        this.direction = 1;
        this.zIndex = 1;
        this.scaleModifier = 0.9;
    }

    move() {
        if (this.standing) {
            this.texture = Game.resources["src/images/enemies/mushroom.png"].texture;
            this.walkDelay = this.getWalkDelay();
            this.currentPoisonDelay = 0;
            this.standing = false;
            this.place();
        } else if (this.walking) {
            if (isEmpty(this.tilePosition.x + this.direction, this.tilePosition.y)) {
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepX(this.direction);
                this.updateMapPosition();
            } else {
                const player = getPlayerOnTile(this.tilePosition.x + this.direction, this.tilePosition.y);
                if (player) player.damage(this.atk, this, true);
                this.bumpX(this.direction);
            }
            this.standing = true;
            this.walking = false;
        } else if (this.walkDelay <= 0) {
            const directions = getRelativelyEmptyHorizontalDirections(this);
            if (directions.length === 0)
                this.walkDelay += 4;
            else {
                this.direction = randomChoice(directions).x;
                this.texture = Game.resources["src/images/enemies/mushroom_walking.png"].texture;
                this.walking = true;
                this.correctScale();
                this.place();
            }
        } else {
            this.walkDelay--;
            if (this.currentPoisonDelay <= 0) {
                this.spillPoison();
                this.currentPoisonDelay = this.poisonDelay;
            } else {
                this.currentPoisonDelay--;
            }
        }
    }

    spillPoison() {
        const spread = 2;
        for (let x = -spread; x <= spread; x++) {
            for (let y = -spread; y <= spread; y++) {
                if (Math.abs(x) + Math.abs(y) <= spread && !(x === 0 && y === 0)) {
                    addHazardOrRefresh(new PoisonHazard(this.tilePosition.x + x, this.tilePosition.y + y));
                }
            }
        }
    }

    getWalkDelay() {
        return getRandomInt(8, 15);
    }


    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        if (this.standing || this.walking)
            this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) - this.bottomOffset + this.height * this.anchor.y;
        else {
            this.bottomOffset = (Game.TILESIZE - this.height) / 2;
            this.position.y = Game.TILESIZE * this.tilePosition.y + this.bottomOffset + this.height * this.anchor.y;
        }
    }

    //this guy is drawn facing left...
    correctScale() {
        if ((this.direction === 1 && this.scale.x > 0) || (this.direction === -1 && this.scale.x < 0)) {
            this.scale.x *= -1
        }
    }
}