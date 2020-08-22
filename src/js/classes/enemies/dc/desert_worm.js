import {ENEMY_TYPE} from "../../../enums/enums";
import {Enemy} from "../enemy";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {getPlayerOnTile, isEmpty, isEnemy, isLit} from "../../../map_checks";
import {closestPlayer, otherPlayer, tileDistance} from "../../../utils/game_utils";
import {shakeScreen} from "../../../animations";
import {randomChoice, randomShuffle} from "../../../utils/random_utils";
import {getChasingBurrowedOptions, getFreeBurrowedDirections, noBurrowedEnemies} from "../../../utils/map_utils";
import {Game} from "../../../game";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class DesertWorm extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["desert_worm.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Desert Worm";
        this.type = ENEMY_TYPE.DESERT_WORM;
        this.atk = 1;
        this.noticeDistance = 3;
        this.removeShadow();
        this.burrowed = true;
        this.triggered = false;
        this.currentBurrowDelay = this.burrowDelay = 3;
        this.movable = false;
        this.SLIDE_ANIMATION_TIME = 8;
        this.setScaleModifier(1.21); // 312 / 256 = 1.21
        this.setOwnZIndex(-2);
    }

    afterMapGen() {
        Game.burrowedEnemies.push(this);
    }

    immediateReaction() {
        if (this.burrowed) this.removeFromMap();
    }

    placeOnMap() {
        if (!this.burrowed) {
            super.placeOnMap();
        }
    }

    move() {
        if (!this.burrowed) {
            if (this.currentBurrowDelay <= 0) {
                this.burrowed = true;
                this.texture = DCEnemiesSpriteSheet["desert_worm.png"];
                this.place();
                this.removeFromMap();
            } else this.currentBurrowDelay--;
        } else if (this.triggered) {
            this.triggered = false;
            this.attack();
            this.burrowed = false;
            this.currentBurrowDelay = this.burrowDelay;
            this.texture = DCEnemiesSpriteSheet["desert_worm_attacked.png"];
            shakeScreen(4, 4);
            this.place();
            this.placeOnMap();
        } else if (getPlayerOnTile(this.tilePosition.x, this.tilePosition.y) !== null) {
            this.triggered = true;
            this.shake(1, 0);
        } else if (tileDistance(this, closestPlayer(this)) === 1) {
            const player = closestPlayer(this);
            if (noBurrowedEnemies(player.tilePosition.x, player.tilePosition.y)) {
                this.slide(player.tilePosition.x - this.tilePosition.x, player.tilePosition.y - this.tilePosition.y);
            } else {
                const player2 = otherPlayer(player);
                if (!player2.dead && tileDistance(this, player2) === 1 && noBurrowedEnemies(player2.tilePosition.x, player2.tilePosition.y)) {
                    this.slide(player2.tilePosition.x - this.tilePosition.x, player2.tilePosition.y - this.tilePosition.y);
                }
            }
        } else {
            if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
                const initPlayer = closestPlayer(this);
                let movementOptions = getChasingBurrowedOptions(this, initPlayer);
                // go after closest player but if you can't, then go after other player if he isn't dead and within the notice distance
                if (movementOptions.length === 0 && !otherPlayer(initPlayer).dead && tileDistance(this, otherPlayer(initPlayer)) <= this.noticeDistance) {
                    movementOptions = getChasingBurrowedOptions(this, otherPlayer(initPlayer));
                }
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    this.slide(dir.x, dir.y);
                }
            } else {
                const movementOptions = getFreeBurrowedDirections(this);
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    this.slide(dir.x, dir.y);
                }
            }
        }
    }

    // called before we place worm on map
    attack(allowRecursion = true) {
        const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y);
        if (player) {
            player.damage(this.atk, this, true, true, true);
            if (!player.dead) {
                this.throwEntity(player);
            }
            const player2 = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y);
            if (player2 && player2 !== player && allowRecursion) this.attack(false);
        } else if (isEnemy(this.tilePosition.x, this.tilePosition.y)) {
            const enemy = Game.map[this.tilePosition.y][this.tilePosition.x].entity;
            if (enemy && enemy !== this) {
                enemy.damage(this, this.atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
                if (!enemy.dead) {
                    enemy.addStun(2);
                    this.throwEntity(enemy);
                }
            }
        }
    }

    throwEntity(entity) {
        loop: for (const r of [4, 3, 2, 1]) {
            let xArray = [];
            let yArray = [];
            for (let i = -r; i <= r; i++) {
                xArray.push(i);
                yArray.push(i);
            }
            randomShuffle(xArray);
            randomShuffle(yArray);
            for (const x of xArray) {
                for (const y of yArray) {
                    const tile = {x: this.tilePosition.x + x, y: this.tilePosition.y + y};
                    if (Math.abs(x) + Math.abs(y) === r && isEmpty(tile.x, tile.y) && isLit(tile.x, tile.y)) {
                        entity.step(tile.x - entity.tilePosition.x, tile.y - entity.tilePosition.y);
                        break loop;
                    }
                }
            }
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["magic.png"];
        } else if (!this.burrowed) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}