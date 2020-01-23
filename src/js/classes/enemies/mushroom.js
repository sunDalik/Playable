import {Game} from "../../game"
import {ENEMY_TYPE, TILE_TYPE} from "../../enums";
import {Enemy} from "./enemy";
import {PoisonHazard} from "../hazards/poison";
import {getRandomInt, randomChoice} from "../../utils/random_utils";
import {getRelativelyEmptyHorizontalDirections} from "../../utils/map_utils";
import {getPlayerOnTile, isEmpty, isNotAWall} from "../../map_checks";
import {closestPlayer, tileDistance} from "../../utils/game_utils";

export class Mushroom extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mushroom.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.MUSHROOM;
        this.atk = 1.5;
        this.poisonDelay = 6; //half of poison hazard lifetime
        this.currentPoisonDelay = this.poisonDelay;
        this.poisonSpread = 2;
        this.walkDelay = this.getWalkDelay();
        this.canMoveInvisible = true;
        this.walking = false;
        this.walkingTexture = Game.resources["src/images/enemies/mushroom_walking.png"].texture;
        this.normalTexture = Game.resources["src/images/enemies/mushroom.png"].texture;
        this.standing = false;
        this.direction = {x: 1, y: 0}; //just a default value
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        this.scaleModifier = 0.9;
        this.fitToTile();
        this.spillAreas = [];
        this.healOnHit = 0;
    }

    afterMapGen() {
        this.spillPoison(true);
    }

    move() {
        if (this.standing) {
            this.texture = this.normalTexture;
            this.walkDelay = this.getWalkDelay();
            this.currentPoisonDelay = 0;
            this.standing = false;
            this.place();
        } else if (this.walking) {
            if (isEmpty(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y)) {
                this.step(this.direction.x, this.direction.y);
            } else {
                const player = getPlayerOnTile(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
                if (player) {
                    player.damage(this.atk, this, true);
                    if (this.healOnHit) this.heal(this.healOnHit);
                }
                this.bump(this.direction.x, this.direction.y);
            }
            this.standing = true;
            this.walking = false;
        } else if (this.walkDelay <= 0) {
            const directions = this.getDirections();
            if (directions.length === 0) {
                this.walkDelay += 4;
            } else {
                this.direction = randomChoice(directions);
                this.texture = this.walkingTexture;
                this.walking = true;
                this.correctScale();
                this.place();
            }
        } else {
            if (this.visible) this.walkDelay--;
            if (this.currentPoisonDelay <= 0) {
                this.spillPoison();
                this.currentPoisonDelay = this.poisonDelay;
            } else {
                this.currentPoisonDelay--;
            }
        }
    }

    spillPoison(invisiblePoison = false) {
        this.spillAreas = [];
        this.spillPoisonR(this.tilePosition.x, this.tilePosition.y, this.poisonSpread, invisiblePoison);
    }

    //probably will use it for some other enemies later too....
    spillPoisonR(tileX, tileY, distance = 8, invisiblePoison = false, sourceDirX = 0, sourceDirY = 0) {
        if (distance > -1 && isNotAWall(tileX, tileY)) {
            if (sourceDirX !== 0 || sourceDirY !== 0) {
                const hazard = new PoisonHazard(tileX, tileY);
                if (invisiblePoison) hazard.visible = false;
                Game.world.addHazard(hazard);
            }
            this.spillAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                this.spillPoisonR(tileX + 1, tileY, distance - 1, invisiblePoison, -1, 0);
                this.spillPoisonR(tileX - 1, tileY, distance - 1, invisiblePoison, 1, 0);
                this.spillPoisonR(tileX, tileY + 1, distance - 1, invisiblePoison, 0, -1);
                this.spillPoisonR(tileX, tileY - 1, distance - 1, invisiblePoison, 0, 1);
            } else {
                if (sourceDirY === 0) {
                    if (!this.spillAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) this.spillPoisonR(tileX, tileY - 1, distance - 1, invisiblePoison, sourceDirX, 1);
                    if (!this.spillAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) this.spillPoisonR(tileX, tileY + 1, distance - 1, invisiblePoison, sourceDirX, -1);
                }
                if (!this.spillAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) this.spillPoisonR(tileX, tileY - sourceDirY, distance - 1, invisiblePoison, sourceDirX, sourceDirY);
                if (sourceDirX === 0) {
                    if (!this.spillAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) this.spillPoisonR(tileX - 1, tileY, distance - 1, invisiblePoison, 1, sourceDirY);
                    if (!this.spillAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) this.spillPoisonR(tileX + 1, tileY, distance - 1, invisiblePoison, -1, sourceDirY);
                }
                if (!this.spillAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) this.spillPoisonR(tileX - sourceDirX, tileY, distance - 1, invisiblePoison, sourceDirX, sourceDirY);
            }
        }
    }


    getWalkDelay() {
        return getRandomInt(8, 14);
    }

    moveHealthContainer() {
        super.moveHealthContainer();
        if (this.type !== ENEMY_TYPE.MUSHROOM && this.type !== ENEMY_TYPE.SMALL_MUSHROOM) return;
        if (this.standing || this.walking) {
            if (this.type === ENEMY_TYPE.SMALL_MUSHROOM) {
                this.intentIcon.position.y = this.position.y - this.height / 5 - this.intentIcon.height / 2;
            } else {
                this.intentIcon.position.y = this.position.y - this.height / 3 - this.intentIcon.height / 2;
            }
        }
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        if (this.standing || this.walking)
            this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) - this.bottomOffset + this.height * this.anchor.y;
        else {
            this.bottomOffset = (Game.TILESIZE - this.height) / 2;
            this.position.y = Game.TILESIZE * this.tilePosition.y + this.bottomOffset + this.height * this.anchor.y;
        }
        if (this.healthContainer) {
            this.moveHealthContainer();
        }
    }

    correctScale() {
        if ((this.direction.x === 1 && this.scale.x < 0) || (this.direction.x === -1 && this.scale.x > 0)) {
            this.scale.x *= -1
        } else if (this.direction.x === 0) {
            const playerDir = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (playerDir === 0 || tileDistance(this, closestPlayer(this)) > 2) this.scale.x *= randomChoice([-1, 1]);
            else this.scale.x = playerDir * Math.abs(this.scale.x);
        }
    }

    getDirections() {
        return getRelativelyEmptyHorizontalDirections(this);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.walking) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/arrow_right.png"].texture;
            this.intentIcon.angle = this.getArrowRightAngleForDirection(this.direction);
        } else if (this.standing) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
        } else if (this.currentPoisonDelay === 0) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/poison.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
        }
    }
}