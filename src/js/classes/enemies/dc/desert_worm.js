import {ENEMY_TYPE} from "../../../enums/enums";
import {Enemy} from "../enemy";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {Z_INDEXES} from "../../../z_indexing";
import {randomAggressiveAI} from "../../../enemy_movement_ai";
import {getPlayerOnTile, isEmpty, isLit} from "../../../map_checks";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {shakeScreen} from "../../../animations";
import {randomShuffle} from "../../../utils/random_utils";

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
        this.setOwnZIndex(Z_INDEXES.PLAYER - 1);
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
            this.slide(player.tilePosition.x - this.tilePosition.x, player.tilePosition.y - this.tilePosition.y);
        } else {
            randomAggressiveAI(this, this.noticeDistance, false);
        }
    }

    attack() {
        const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y);
        if (player) {
            player.damage(this.atk, this, true, true, true);
            if (!player.dead) {
                loop: for (const r of [0]) {
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
                                player.step(tile.x - player.tilePosition.x, tile.y - player.tilePosition.y);
                                break loop;
                            }
                        }
                    }
                }
            }
            const player2 = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y);
            if (player2 && player2 !== player) this.attack();
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
    }
}