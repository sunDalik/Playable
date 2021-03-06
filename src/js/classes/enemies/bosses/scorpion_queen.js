import {ENEMY_TYPE, HAZARD_TYPE, STAGE, TILE_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {IntentsSpriteSheet, ScorpionQueenSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {get8Directions, getDirectionsWithConditions} from "../../../utils/map_utils";
import {getPlayerOnTile, isEmpty, isEnemy, isNotAWall, isRelativelyEmpty} from "../../../map_checks";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {closestPlayer, closestPlayerDiagonal, otherPlayer} from "../../../utils/game_utils";
import {Enemy} from "../enemy";
import {Scorpion} from "../dc/scorpion";
import {RedScorpion} from "../dc/red_scorpion";
import {stageBeaten} from "../../../setup";
import {WallTile} from "../../draw/wall";
import * as PIXI from "pixi.js";
import {quadraticBezier} from "../../../utils/math_utils";
import {getZIndexForLayer} from "../../../z_indexing";

// tilePosition refers to rightmost tile
export class ScorpionQueen extends Boss {
    constructor(tilePositionX, tilePositionY, texture = ScorpionQueenSpriteSheet["scorpion_queen_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 24;
        this.type = ENEMY_TYPE.SCORPION_QUEEN;
        this.atk = 1;
        this.name = "Scorpion Queen";

        this.triggeredRage = false;
        this.rageCounter = 5;
        this.currentRageCounter = 0;

        this.triggeredEggSpawning = false;
        this.eggCounter = 4;
        this.currentEggCounter = 0;

        this.noSpecialAttacksTime = 7;
        this.currentNoSpecialAttacksTime = 0;

        this.turnDelay = 2;
        this.currentTurnDelay = this.turnDelay + 1;
        this.currentRageTurnDelay = this.rageTurnDelay = 2;
        this.laidRageEgg = false;

        this.shakeWaiting = 0;

        this.setScaleModifier(2.2);

        this.phase = 1;

        this.shadowHeight = 12;
        this.shadowInside = true;
        this.regenerateShadow();
        this.minions = [];
        this.minionsLimit = 0;
    }

    static getBossRoomStats() {
        const height = randomInt(10, 11);
        const width = height === 10 ? randomInt(12, 13) : randomInt(11, 13);
        return {width: width, height: height};
    }

    afterMapGen() {
        this.removeFromMap();
        this.placeOnMap();

        // push all scorpions inside boss room to minions list
        for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
            for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
                if (isEnemy(x, y)) {
                    const entity = Game.map[y][x].entity;
                    if ([ENEMY_TYPE.SCORPION, ENEMY_TYPE.RED_SCORPION].includes(entity.type)) {
                        this.minions.push(entity);
                    }
                }
            }
        }

        this.minionsLimit = (Game.endRoomBoundaries[1].x - Game.endRoomBoundaries[0].x - 1) *
            (Game.endRoomBoundaries[1].y - Game.endRoomBoundaries[0].y - 1) * 0.085;
    }

    onBossModeActivate() {
        // replace super walls with walls
        for (let x = Game.endRoomBoundaries[0].x; x <= Game.endRoomBoundaries[1].x; x++) {
            for (let y = Game.endRoomBoundaries[0].y; y <= Game.endRoomBoundaries[1].y; y++) {
                if (Game.map[y][x].tileType === TILE_TYPE.SUPER_WALL &&
                    (x === Game.endRoomBoundaries[0].x || x === Game.endRoomBoundaries[1].x || y === Game.endRoomBoundaries[0].y || y === Game.endRoomBoundaries[1].y)) {
                    Game.world.removeTile(x, y, null, false);
                    Game.world.addTile(new WallTile(x, y), TILE_TYPE.WALL);
                }
            }
        }
    }

    damageWithHazards() {
        for (const x of [this.tilePosition.x, this.tilePosition.x - 1]) {
            const hazard = Game.map[this.tilePosition.y][x].hazard;
            if (hazard) {
                if (hazard.type === HAZARD_TYPE.DARK_FIRE || hazard.type === HAZARD_TYPE.DARK_POISON) {
                    this.damage(hazard, hazard.atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
                }
            }
        }
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
                this.stopSpecialAttack(false);
            }
        } else if (this.triggeredEggSpawning) {
            this.spawnEgg();
            this.currentEggCounter++;
            if (this.currentEggCounter >= this.eggCounter) {
                this.triggeredEggSpawning = false;
                this.stopSpecialAttack();
                this.noSpecialAttacksTime = this.eggCounter * 3;
                this.incrementEggCounter();
            }
        } else {
            if (this.phase === 3) {
                if (this.currentRageTurnDelay === 1) {
                    this.texture = ScorpionQueenSpriteSheet["scorpion_queen_crownless_about_to_move.png"];
                }
                if (this.currentRageTurnDelay <= 0) {
                    this.phase3Chase();
                    this.texture = ScorpionQueenSpriteSheet["scorpion_queen_crownless.png"];
                    this.currentRageTurnDelay = this.rageTurnDelay;
                } else this.currentRageTurnDelay--;
            } else {
                if (this.currentNoSpecialAttacksTime > this.noSpecialAttacksTime) {
                    if (this.canSpawnMinions(this.eggCounter)) {
                        this.triggerEggSpawning();
                    } else if (this.currentNoSpecialAttacksTime - this.noSpecialAttacksTime > 7 && this.canSpawnMinions(4)) {
                        this.eggCounter = 4;
                        this.triggerEggSpawning();
                    }
                }

                if (!this.triggeredEggSpawning) {
                    if (this.currentTurnDelay === 1) {
                        this.texture = ScorpionQueenSpriteSheet["scorpion_queen_about_to_move.png"];
                    }
                    if (this.currentTurnDelay <= 0) {
                        this.randomWalk();
                        this.currentTurnDelay = this.turnDelay;
                    } else this.currentTurnDelay--;
                }
            }
        }
        this.currentNoSpecialAttacksTime++;
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        super.damage(source, dmg, inputX, inputY, damageType);
        if (!this.triggeredRage) {
            if (this.phase === 1 && this.health <= this.maxHealth * 6.5 / 9) {
                this.phase = 2;
                this.triggerRage();
            } else if (this.phase === 2 && this.health <= this.maxHealth * 4 / 9) {
                this.phase = 3;
                this.triggerRage();
                this.dropCrown();
            }
        }
    }

    stopSpecialAttack(resetAttackTime = true) {
        if (this.phase === 3) this.texture = ScorpionQueenSpriteSheet["scorpion_queen_crownless.png"];
        else this.texture = ScorpionQueenSpriteSheet["scorpion_queen_neutral.png"];
        this.currentTurnDelay = this.turnDelay;
        if (resetAttackTime) this.currentNoSpecialAttacksTime = 0;
    }

    triggerRage() {
        this.unTriggerEverything();
        this.triggeredRage = true;
        if (this.phase === 3) this.shakeWaiting = 2;
        else this.shakeWaiting = 3;
        this.shake(1, 0);
        this.currentRageCounter = 0;
        if (this.phase === 3) this.texture = ScorpionQueenSpriteSheet["scorpion_queen_rage_crownless.png"];
        else this.texture = ScorpionQueenSpriteSheet["scorpion_queen_rage.png"];
    }

    dropCrown() {
        const crown = new PIXI.Sprite(ScorpionQueenSpriteSheet["scorpion_queen_crown.png"]);
        crown.anchor.set(this.anchor.x, this.anchor.y);
        crown.scale.set(this.scale.x, this.scale.y);
        Game.world.addChild(crown);
        crown.position.y = this.position.y + this.height * 0.02;
        crown.position.x = this.position.x + this.width * 0.21 * Math.sign(this.scale.x);
        crown.zIndex = this.zIndex + 1;

        const centerTilePositionX = Math.sign(this.scale.x) === 1 ? this.tilePosition.x : this.tilePosition.x - 1;
        const centerTilePosition = {x: centerTilePositionX, y: this.tilePosition.y};
        const dropTiles = get8Directions().map(tile => {
            return {x: tile.x + centerTilePosition.x, y: tile.y + centerTilePosition.y};
        }).filter(tile => isNotAWall(tile.x, tile.y));
        if (dropTiles.length === 0) {
            Game.world.removeChild(crown);
            return;
        }
        const dropTile = randomChoice(dropTiles);

        const oldPos = {x: crown.position.x, y: crown.position.y};
        const newPos = {
            x: dropTile.x * Game.TILESIZE + Game.TILESIZE / 2 + randomInt(-Game.TILESIZE / 4, Game.TILESIZE / 4),
            y: dropTile.y * Game.TILESIZE + Game.TILESIZE / 2 + randomInt(-Game.TILESIZE / 4, Game.TILESIZE / 4)
        };
        const middlePoint = {x: oldPos.x + (newPos.x - oldPos.x) / 2, y: oldPos.y - Game.TILESIZE};
        const animationTime = 10;
        const step = 1 / animationTime;
        let counter = 0;
        const animation = delta => {
            counter += delta;
            const t = counter * step;
            crown.position.x = quadraticBezier(t, oldPos.x, middlePoint.x, newPos.x);
            crown.position.y = quadraticBezier(t, oldPos.y, middlePoint.y, newPos.y);
            if (counter >= animationTime / 2) {
                crown.zIndex = getZIndexForLayer(dropTile.y) - 2;
            }
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                crown.position.set(newPos.x, newPos.y);
            }
        };
        Game.app.ticker.add(animation);
    }

    unTriggerEverything() {
        this.triggeredEggSpawning = false;
        this.triggeredRage = false;
    }

    triggerEggSpawning() {
        this.triggeredEggSpawning = true;
        this.texture = ScorpionQueenSpriteSheet["scorpion_queen_egg_spawning.png"];
        this.shakeWaiting = 1;
        this.shake(1, 0);
        this.currentEggCounter = 0;
    }

    incrementEggCounter() {
        this.eggCounter++;
        if (this.eggCounter > 6) this.eggCounter = 4;
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
            } else {
                this.bump(Math.sign(initPlayer.tilePosition.x - this.tilePosition.x), Math.sign(initPlayer.tilePosition.y - this.tilePosition.y));
            }
        }
    }

    phase3Chase() {
        let spawnPos = {x: this.tilePosition.x, y: this.tilePosition.y};
        if (Math.sign(this.scale.x) > 0) spawnPos.x--;
        this.rageChase();
        if (this.canSpawnMinions(1)) {
            if (this.laidRageEgg) this.laidRageEgg = false;
            else {
                this.layEgg(spawnPos.x, spawnPos.y);
                this.laidRageEgg = true;
            }
        }
    }

    canSpawnMinions(amount) {
        this.minions = this.minions.filter(m => !m.dead);
        return this.minions.length + amount <= this.minionsLimit;
    }

    spawnEgg() {
        const walkDir = randomChoice(this.getEmptyMoveDirections());
        if (walkDir === undefined) return;
        let spawnPos = {x: this.tilePosition.x, y: this.tilePosition.y};
        this.step(walkDir.x, walkDir.y);
        if (Math.sign(this.scale.x) > 0) spawnPos.x--;
        this.layEgg(spawnPos.x, spawnPos.y);
    }

    layEgg(tilePosX, tilePosY) {
        if (isEmpty(tilePosX, tilePosY)) {
            let enemyType = Scorpion;
            // see also replaceEnemy()
            if (this.phase >= 2 && Math.random() < 0.20 && stageBeaten(STAGE.DRY_CAVE) >= 1) enemyType = RedScorpion;
            const egg = new ScorpionQueenEgg(tilePosX, tilePosY, enemyType, this);
            Game.world.addEnemy(egg);
            this.minions.push(egg);
        }
    }

    randomWalk() {
        this.texture = ScorpionQueenSpriteSheet["scorpion_queen_neutral.png"];
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
                return true;
            }
        }
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

    step(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.STEP_ANIMATION_TIME) {
        super.step(tileStepX, tileStepY, onFrame, onEnd, animationTime);
        this.correctScale(tileStepX, tileStepY);
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        super.bump(tileStepX, tileStepY, onFrame, onEnd, animationTime);
        this.correctScale(tileStepX, tileStepY);
    }

    correctScale(tileStepX, tileStepY) {
        if ((tileStepX !== 0 && Math.sign(tileStepX) !== Math.sign(this.scale.x))
            || (tileStepX === 0 && tileStepY !== 0 && Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x) !== Math.sign(this.scale.x))) {
            this.scale.x *= -1;
        }
    }

    die(source) {
        super.die(source);
        for (const minion of this.minions) {
            minion.die(null);
        }
    }
}

// todo add texture
class ScorpionQueenEgg extends Enemy {
    constructor(tilePositionX, tilePositionY, enemyType, queen, texture = ScorpionQueenSpriteSheet["scorpion_queen_egg.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Scorpion Queen's Egg";
        this.type = ENEMY_TYPE.SCORPION_QUEEN_EGG;
        this.atk = 0;
        this.isMinion = true;
        this.currentDelay = 3;
        this.summonedEnemyType = enemyType;
        this.queen = queen;
        if (enemyType === RedScorpion) this.setScaleModifier(1.1);
        this.shadowInside = true;
        this.regenerateShadow();
    }

    move() {
        if (this.currentDelay === 1) {
            this.shake(1, 0);
            this.texture = ScorpionQueenSpriteSheet["scorpion_queen_egg_cracked.png"];
        } else if (this.currentDelay <= 0) {
            this.die();
            const enemy = new this.summonedEnemyType(this.tilePosition.x, this.tilePosition.y);
            Game.world.addEnemy(enemy, true);
            this.queen.minions.push(enemy);
        }
        this.currentDelay--;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.currentDelay <= 0) {
            this.intentIcon.texture = IntentsSpriteSheet["magic.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }
}