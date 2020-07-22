import {Enemy} from "../enemy";
import {DIRECTIONS, ENEMY_TYPE} from "../../../enums/enums";
import {getPlayerOnTile} from "../../../map_checks";
import {createCrazySpikeAnimation, createEnemyAttackTile} from "../../../animations";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";

export class Star extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["star.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.atk = 1;
        this.triggered = false;
        this.triggeredDirections = null;
        this.type = ENEMY_TYPE.STAR;
        this.turnDelay = 1;
        this.movable = false;
        this.shadowInside = true;
        this.shadowHeight = 7;
        this.regenerateShadow();
        this.place();
    }

    setStun(stun) {
        super.setStun(stun);
        this.cancelAnimation();
        this.triggered = false;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                //if you want to make sure stars cant hit through walls you can just check for walls while you loop
                loop: for (let offset = -2; offset <= 2; offset++) {
                    for (let sign = -1; sign <= 1; sign += 2) {
                        if (offset !== 0) {
                            const player = getPlayerOnTile(this.tilePosition.x + offset, this.tilePosition.y + offset * sign);
                            if (player) {
                                this.triggered = true;
                                this.triggeredDirections = DIRECTIONS.DIAGONAL;
                                break loop;
                            }
                        }
                    }
                }
                loop2: for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (Math.abs(x) !== Math.abs(y)) {
                            const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y + y);
                            if (player) {
                                this.triggered = true;
                                this.triggeredDirections = DIRECTIONS.CARDINAL;
                                break loop2;
                            }
                        }
                    }
                }
                if (this.triggered) this.shake(1, 0);
            }
        } else this.turnDelay--;
    }

    attack() {
        this.triggered = false;
        if (this.triggeredDirections === DIRECTIONS.CARDINAL) {
            this.attackCardinal();
        } else if (this.triggeredDirections === DIRECTIONS.DIAGONAL) {
            this.attackDiagonal();
        }
        this.turnDelay = 1;
    }

    attackCardinal() {
        this.attackTileAtOffset(0, 1);
        this.attackTileAtOffset(1, 0);
        this.attackTileAtOffset(0, -1);
        this.attackTileAtOffset(-1, 0);
    }

    attackDiagonal() {
        this.attackTileAtOffset(-2, -2);
        this.attackTileAtOffset(-1, -1);
        this.attackTileAtOffset(2, 2);
        this.attackTileAtOffset(1, 1);
        this.attackTileAtOffset(-2, 2);
        this.attackTileAtOffset(-1, 1);
        this.attackTileAtOffset(2, -2);
        this.attackTileAtOffset(1, -1);

        this.createSpikeAnimation(-2, -2);
        this.createSpikeAnimation(2, -2);
        this.createSpikeAnimation(-2, 2);
        this.createSpikeAnimation(2, 2);
    }

    attackTileAtOffset(tileOffsetX, tileOffsetY) {
        const attackPositionX = this.tilePosition.x + tileOffsetX;
        const attackPositionY = this.tilePosition.y + tileOffsetY;

        const player = getPlayerOnTile(attackPositionX, attackPositionY);
        if (player) player.damage(this.atk, this, false, true);

        createEnemyAttackTile({x: attackPositionX, y: attackPositionY}, 16, 0.3);
        if (Math.abs(tileOffsetX) + Math.abs(tileOffsetY) >= 2) return;
        this.createSpikeAnimation(tileOffsetX, tileOffsetY);
    }

    createSpikeAnimation(offsetX, offsetY) {
        createCrazySpikeAnimation(this, offsetX, offsetY, this.type === ENEMY_TYPE.STAR ? 0xa4d352 : 0xdf403c);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            if (this.triggeredDirections === DIRECTIONS.CARDINAL) this.intentIcon.angle = 45;
        } else if (this.turnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["eye.png"];
        }
    }
}