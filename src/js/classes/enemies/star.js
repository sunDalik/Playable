import {Game} from "../../game"
import {Enemy} from "./enemy"
import {DIRECTIONS, ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile} from "../../map_checks";
import {createEnemyAttackTile} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../loader";

export class Star extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/fc_enemies/star.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.atk = 1;
        this.triggered = false;
        this.triggeredDirections = null;
        this.type = ENEMY_TYPE.STAR;
        this.turnDelay = 1;
        this.movable = false;
        this.setScaleModifier(0.9);
        this.tallModifier = -5;
        this.place();
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                if (this.canSeePlayers()) {
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
        this.createSpikeAnimation(tileOffsetX, tileOffsetY)
    }

    createSpikeAnimation(offsetX, offsetY) {
        let prefix = this.type === ENEMY_TYPE.STAR ? "star" : "star_b";
        const attack = new TileElement(FCEnemiesSpriteSheet[`${prefix}_spike.png`], 0, 0);
        attack.position.set(this.getTilePositionX(), this.getTilePositionY());
        attack.zIndex = this.zIndex - 1;
        attack.anchor.set(0, 0.5);
        attack.angle = this.getArrowRightAngleForDirection({x: Math.sign(offsetX), y: Math.sign(offsetY)});
        Game.world.addChild(attack);
        const animationTime = 10;
        let sizeMod;
        if (Math.max(Math.abs(offsetX), Math.abs(offsetY)) === 1) sizeMod = 1.5;
        else sizeMod = 3.5;
        const widthStep = attack.width * sizeMod / (animationTime / 2);
        attack.width = 1;
        const delay = 6;
        let counter = 0;
        let halfReached = false;

        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            if (counter < animationTime / 2) {
                attack.width += widthStep;
            } else if (counter < animationTime / 2 + delay) {
                if (!halfReached) {
                    halfReached = true;
                    attack.width = widthStep * animationTime / 2;
                }
            } else if (counter >= animationTime / 2 + delay) {
                attack.width -= widthStep;
                if (attack.width <= 0) attack.width = 1;
            }
            if (counter >= animationTime + delay) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(attack);
            }
        };
        Game.app.ticker.add(animation);
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