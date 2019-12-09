import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {PoisonHazard} from "../hazards/poison";
import {isRelativelyEmpty, getPlayerOnTile, isAnyWall} from "../../map_checks";
import {getRandomInt} from "../../utils/random_utils";

export class Snail extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/snail.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SNAIL;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = 0;
        this.chase = false;
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
        }
    }

    move() {
        if (this.currentTurnDelay === 0) {
            if (this.chase) {
                /*
                    let path;
                    const path1 = this.getPathToPlayer1();
                    const path2 = this.getPathToPlayer2();
                    path = path1.length < path2.length ? path1 : path2;
                    if (path.length !== 0) {
                        if (path[0].y !== this.tilePosition.x) {
                            this.slideX(path[0].y - this.tilePosition.x);
                        } else this.slideY(path[0].x - this.tilePosition.y);
                    }
                 */

                const player1DistX = Game.player.tilePosition.x - this.tilePosition.x;
                const player1DistY = Game.player.tilePosition.y - this.tilePosition.y;
                const player1Dist = Math.abs(player1DistX) + Math.abs(player1DistY);

                const player2DistX = Game.player2.tilePosition.x - this.tilePosition.x;
                const player2DistY = Game.player2.tilePosition.y - this.tilePosition.y;
                const player2Dist = Math.abs(player2DistX) + Math.abs(player2DistY);
                if (Game.player.dead) this.chasePlayer(Game.player2);
                else if (Game.player2.dead) this.chasePlayer(Game.player);
                else if (player1Dist < player2Dist) {
                    this.chasePlayer(Game.player);
                } else {
                    this.chasePlayer(Game.player2);
                }
                this.currentTurnDelay = this.turnDelay;
            } else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                }
            }
            Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y));
        } else this.currentTurnDelay--;
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        if (tileStepX !== 0 && Math.sign(tileStepX) !== Math.sign(this.scale.x)) {
            this.scale.x *= -1;
        }
        super.slide(tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        if (tileStepX !== 0 && Math.sign(tileStepX) !== Math.sign(this.scale.x)) {
            this.scale.x *= -1;
        }
        super.slideBump(tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    chasePlayer(player) {
        const playerDistX = player.tilePosition.x - this.tilePosition.x;
        const playerDistY = player.tilePosition.y - this.tilePosition.y;
        const playerDirX = Math.sign(playerDistX);
        const playerDirY = Math.sign(playerDistY);

        if (Math.abs(playerDistX) > Math.abs(playerDistY)) {
            if (!this.tryToStep(playerDirX, 0)) {
                if (playerDirY === 0) this.slideBump(playerDirX, 0);
                else if (!this.tryToStep(0, playerDirY)) this.slideBump(0, playerDirY);
            }
        } else if (Math.abs(playerDistX) < Math.abs(playerDistY)) {
            if (!this.tryToStep(0, playerDirY)) {
                if (playerDirX === 0) this.slideBump(0, playerDirY);
                else if (!this.tryToStep(playerDirX, 0)) this.slideBump(playerDirX, 0);
            }
        } else {
            const randomDirection = getRandomInt(0, 2);
            if (randomDirection === 0) {
                if (!this.tryToStep(playerDirX, 0)) {
                    if (playerDirY === 0) this.slideBump(playerDirX, 0);
                    else if (!this.tryToStep(0, playerDirY)) this.slideBump(0, playerDirY);
                }
            } else {
                if (!this.tryToStep(0, playerDirY)) {
                    if (playerDirX === 0) this.slideBump(0, playerDirY);
                    else if (!this.tryToStep(playerDirX, 0)) this.slideBump(playerDirX, 0);
                }
            }
        }
    }

    tryToStep(tileStepX, tileStepY) {
        if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
            const player = getPlayerOnTile(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY);
            if (player !== null) {
                player.damage(this.atk, this);
                this.slideBump(tileStepX, tileStepY);
            } else this.slide(tileStepX, tileStepY);
            return true;
        }
        return false;
    }
}