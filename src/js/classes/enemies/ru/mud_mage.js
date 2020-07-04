import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {get8Directions, getDirectionsOnSquare} from "../../../utils/map_utils";
import {MudCubeZombie} from "./mud_cube_zombie";
import {isNotAWall} from "../../../map_checks";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {randomAfraidAI} from "../../../enemy_movement_ai";

export class MudMage extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["mud_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.type = ENEMY_TYPE.MUD_MAGE;
        this.atk = 0;
        this.SLIDE_ANIMATION_TIME = 5;
        this.turnDelay = 2;
        this.currentTurnDelay = this.turnDelay;
        this.casting = false;
        this.cooldown = 14;
        this.currentCooldown = Math.floor(this.cooldown / 3);
        this.castDistance = 7;
        this.dangerDistance = 3;
        this.castTime = 2;
        this.currentCastTime = this.castTime;
        this.setScaleModifier(1.1);
        this.minions = [];
        this.minionsMax = 10;
    }

    move() {
        this.correctScale();
        if (this.casting) {
            this.currentCooldown = this.cooldown;
            this.currentCastTime--;
            if (this.currentCastTime === 1) this.texture = RUEnemiesSpriteSheet["mud_mage_cast.png"];
            else if (this.currentCastTime <= 0) {
                this.casting = false;
                this.currentTurnDelay = this.turnDelay;
                this.texture = RUEnemiesSpriteSheet["mud_mage.png"];
                for (const tile of this.getRandomPattern()) {
                    if (isNotAWall(tile.x, tile.y)) {
                        const enemy = new MudCubeZombie(tile.x, tile.y);
                        Game.world.addEnemyViaSummonCircle(enemy, 2);
                        this.minions.push(enemy);
                    }
                }
            }
        } else if (this.currentCooldown <= 0 && tileDistance(this, closestPlayer(this)) <= this.castDistance && this.aliveMinionsCount() < this.minionsMax) {
            this.casting = true;
            this.currentCastTime = this.castTime;
            this.texture = RUEnemiesSpriteSheet["mud_mage_prepare.png"];
        } else if (this.currentTurnDelay <= 0) {
            randomAfraidAI(this, this.dangerDistance, false, true);
        } else {
            this.currentTurnDelay--;
        }
        this.currentCooldown--;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.filters = [];
        if (this.casting) {
            if (this.currentCastTime === 1) {
                this.intentIcon.texture = IntentsSpriteSheet["magic.png"];
            } else {
                this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
            }
        } else if (this.currentTurnDelay <= 0) {
            if (tileDistance(this, closestPlayer(this)) <= this.dangerDistance) {
                this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
            } else {
                this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
            }
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }

    getRandomPattern() {
        //anticlockwise
        const radius = randomInt(1, 3);
        const pattern = [randomChoice(getDirectionsOnSquare(radius, true))]; //dumb hack
        let directionX;
        let directionY;

        const setDirections = (tile) => {
            if (tile.y === radius && tile.x === radius) {
                directionX = -1;
                directionY = -1;
            } else if (tile.y === -radius && tile.x === radius) {
                directionX = -1;
                directionY = 1;
            } else if (tile.y === -radius && tile.x === -radius) {
                directionX = 1;
                directionY = 1;
            } else if (tile.y === radius && tile.x === -radius) {
                directionX = 1;
                directionY = -1;
            } else if (tile.y === radius) {
                directionX = 1;
                directionY = -1;
            } else if (tile.y === -radius) {
                directionX = -1;
                directionY = 1;
            } else if (tile.x === radius) {
                directionX = -1;
                directionY = -1;
            } else if (tile.x === -radius) {
                directionX = 1;
                directionY = 1;
            }
        };

        setDirections(pattern[0]);

        let attempt = 0;
        while (attempt < 100) {
            let direction = randomChoice([
                {x: 0, y: directionY},
                {x: directionX, y: 0},
                {x: directionX, y: directionY}]);
            if (pattern.length === 1) {
                if (pattern[0].y === radius) direction = {x: 1, y: 0};
                if (pattern[0].y === -radius) direction = {x: -1, y: 0};
                if (pattern[0].x === radius) direction = {x: 0, y: -1};
                if (pattern[0].x === -radius) direction = {x: 0, y: 1};
            }
            const newTile = {
                x: pattern[pattern.length - 1].x + direction.x,
                y: pattern[pattern.length - 1].y + direction.y
            };
            if (Math.abs(newTile.x) < Math.max(radius - 1, 1) && Math.abs(newTile.y) < Math.max(radius - 1, 1)) {
                attempt++;
                continue;
            }
            if (pattern.find(tile => tile.x === newTile.x && tile.y === newTile.y)) {
                attempt++;
                continue;
            }
            pattern.push(newTile);
            attempt = 0;

            if (pattern.length >= 4 * radius) {
                for (const dir of get8Directions()) {
                    if (newTile.x === pattern[0].x + dir.x && newTile.y === pattern[0].y + dir.y) {
                        attempt = 9999; //to break from while
                        break;
                    }
                }
            }
            setDirections(newTile);
        }
        const targetPlayer = closestPlayer(this);
        return pattern.map(tile => {
            tile.x += targetPlayer.tilePosition.x;
            tile.y += targetPlayer.tilePosition.y;
            return tile;
        });
    }

    correctScale() {
        const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
        if (sign !== 0) {
            this.scale.x = sign * Math.abs(this.scale.x);
        }
    }

    aliveMinionsCount() {
        this.minions = this.minions.filter(minion => !minion.dead);
        return this.minions.length;
    }
}