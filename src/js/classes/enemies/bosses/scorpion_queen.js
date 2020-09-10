import {ENEMY_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {ScorpionQueenSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {get8Directions, getDiagonalChasingOptions, getDirectionsWithConditions} from "../../../utils/map_utils";
import {getPlayerOnTile, isEmpty, isRelativelyEmpty} from "../../../map_checks";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {closestPlayerDiagonal, otherPlayer} from "../../../utils/game_utils";

// tilePosition refers to rightmost tile
export class ScorpionQueen extends Boss {
    constructor(tilePositionX, tilePositionY, texture = ScorpionQueenSpriteSheet["scorpion_queen_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 15;
        this.type = ENEMY_TYPE.SCORPION_QUEEN;
        this.atk = 1;
        this.name = "Scorpion Queen";

        this.startNoActionCounter = 4;
        this.triggeredRage = false;
        this.rageCounter = 6;
        this.currentRageCounter = 0;
        this.shakeWaiting = 0;
        this.setScaleModifier(2.2);

        this.shadowHeight = 12;
        this.shadowInside = true;
        this.regenerateShadow();
    }

    static getBossRoomStats() {
        return {width: randomInt(11, 14), height: randomInt(10, 12)};
    }

    afterMapGen() {
        this.removeFromMap();
        this.placeOnMap();
    }

    getTilePositionX() {
        return super.getTilePositionX() - Game.TILESIZE / 2;
    }

    placeOnMap() {
        super.placeOnMap();
        this.tilePosition.x--;
        super.placeOnMap();
        this.tilePosition.x++;
    }

    removeFromMap() {
        super.removeFromMap();
        this.tilePosition.x--;
        super.removeFromMap();
        this.tilePosition.x++;
    }

    move() {
        if (this.shakeWaiting > 0) {
            this.shake(1, 0);
            this.shakeWaiting--;
        } else if (this.triggeredRage) {
            this.rageChase();
            this.currentRageCounter++;
            if (this.currentRageCounter >= this.rageCounter) {
                this.triggeredRage = false;
                this.tint = 0xffffff;
            }
        }
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        const previousHealth = this.health;
        super.damage(source, dmg, inputX, inputY, damageType);
        const rageMarks = [this.maxHealth * 3 / 4, this.maxHealth / 2, this.maxHealth / 4];
        for (const rageMark of rageMarks) {
            if (previousHealth > rageMark && this.health <= rageMark) {
                this.triggerRage();
                break;
            }
        }
    }

    triggerRage() {
        this.triggeredRage = true;
        this.shakeWaiting = 3;
        this.shake(1, 0);
        this.currentRageCounter = 0;
        this.tint = 0xff0000;
    }

    rageChase() {
        if (!this.damagePlayer()) {
            const initPlayer = closestPlayerDiagonal(this);
            let movementOptions = this.getChasingDiagonalOptions(initPlayer);
            if (movementOptions.length === 0 && !otherPlayer(initPlayer).dead) {
                movementOptions = this.getChasingDiagonalOptions(otherPlayer(initPlayer));
            }
            if (movementOptions.length !== 0) {
                const dir = randomChoice(movementOptions);
                this.step(dir.x, dir.y);
            }
        }
    }

    randomWalk() {
        const dir = randomChoice(this.getEmptyMoveDirections());
        if (dir === undefined) return;
        this.step(dir.x, dir.y);
    }

    getEmptyMoveDirections() {
        return getDirectionsWithConditions(this, get8Directions(), (tilePosX, tilePosY) => this.isTileEmptyForQueen(tilePosX, tilePosY));
    }

    damagePlayer() {
        for (const dirObj of this.getPlayerDamageDirections()) {
            const player = getPlayerOnTile(this.tilePosition.x + dirObj.dir.x, this.tilePosition.y + dirObj.dir.y);
            if (player) {
                this.bump(dirObj.bumpDir.x, dirObj.bumpDir.y);
                player.damage(this.atk, this, true);
                console.log("yes");
                return true;
            }
        }
        console.log("no");
        return false;
    }

    getPlayerDamageDirections() {
        return [
            {dir: {x: -2, y: -1}, bumpDir: {x: -1, y: -1}},
            {dir: {x: -1, y: -1}, bumpDir: {x: 0, y: -1}},
            {dir: {x: 0, y: -1}, bumpDir: {x: 0, y: -1}},
            {dir: {x: 1, y: -1}, bumpDir: {x: 1, y: -1}},

            {dir: {x: -2, y: 0}, bumpDir: {x: -1, y: 0}},
            {dir: {x: 1, y: 0}, bumpDir: {x: 1, y: 0}},

            {dir: {x: -2, y: 1}, bumpDir: {x: -1, y: 1}},
            {dir: {x: -1, y: 1}, bumpDir: {x: 0, y: 1}},
            {dir: {x: 0, y: 1}, bumpDir: {x: 0, y: 1}},
            {dir: {x: 1, y: 1}, bumpDir: {x: 1, y: 1}}
        ];
    }

    getChasingDiagonalOptions(player) {
        const chaseDirX = Math.sign(player.tilePosition.x - this.tilePosition.x);
        const chaseDirY = Math.sign(player.tilePosition.y - this.tilePosition.y);
        const bestOption = {x: chaseDirX, y: chaseDirY};
        if (this.isTileEmptyForQueen(this.tilePosition.x + bestOption.x, this.tilePosition.y + bestOption.y)) {
            // check for surrounding tiles if going diagonally
            if (chaseDirY === 0 || chaseDirX === 0
                || isRelativelyEmpty(this.tilePosition.x + bestOption.x, this.tilePosition.y)
                || isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + bestOption.y)) {
                return [bestOption];
            }
        }

        const altDirections = [];
        const finalOptions = [];
        if (player.tilePosition.x !== this.tilePosition.x) altDirections.push({x: chaseDirX, y: 0});
        if (player.tilePosition.y !== this.tilePosition.y) altDirections.push({x: 0, y: chaseDirY});
        for (const dir of altDirections) {
            if (this.isTileEmptyForQueen(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                finalOptions.push(dir);
            }
        }

        return finalOptions;
    }

    isTileEmptyForQueen(tilePosX, tilePosY) {
        return (isEmpty(tilePosX, tilePosY) || Game.map[tilePosY][tilePosX].entity === this)
            && (isEmpty(tilePosX - 1, tilePosY) || Game.map[tilePosY][tilePosX - 1].entity === this);
    }
}