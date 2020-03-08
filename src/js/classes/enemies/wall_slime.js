import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, PANE} from "../../enums";
import {randomChoice} from "../../utils/random_utils";
import {isEmpty} from "../../map_checks";
import {closestPlayer} from "../../utils/game_utils";
import {getHealthArray} from "../../drawing/draw_utils";

export class WallSlime extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/wall_slime.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.WALL_SLIME;
        this.atk = 1;
        this.pane = randomChoice([PANE.VERTICAL, PANE.HORIZONTAL]);
        this.turnDelay = 5;
        this.currentTurnDelay = this.turnDelay;
        this.spawnAttempt = false;
        this.baseSlime = null;
        this.subSlimes = [];
    }

    afterMapGen() {
        if (this.pane === PANE.VERTICAL) {
            if (isEmpty(this.tilePosition.x, this.tilePosition.y - 1)
                && isEmpty(this.tilePosition.x, this.tilePosition.y - 2)
                && isEmpty(this.tilePosition.x, this.tilePosition.y + 1)
                && isEmpty(this.tilePosition.x, this.tilePosition.y + 2)) {
                const subSlimes = [new WallSlime(this.tilePosition.x, this.tilePosition.y - 1),
                    new WallSlime(this.tilePosition.x, this.tilePosition.y - 2),
                    new WallSlime(this.tilePosition.x, this.tilePosition.y + 1),
                    new WallSlime(this.tilePosition.x, this.tilePosition.y + 2)];
                this.subSlimes = subSlimes;
                for (const slime of subSlimes) {
                    slime.baseSlime = this;
                    slime.pane = this.pane;
                    Game.world.addChild(slime);
                    Game.enemies.push(slime);
                    slime.placeOnMap()
                }
                this.correctScale();
                subSlimes[0].texture = subSlimes[2].texture = Game.resources["src/images/enemies/wall_slime_sub.png"].texture;
                subSlimes[1].texture = subSlimes[3].texture = Game.resources["src/images/enemies/wall_slime_edge.png"].texture;
                subSlimes[0].angle = subSlimes[2].angle = 90;
                subSlimes[1].angle = 270;
                subSlimes[3].angle = 90;
            } else {
                if (this.spawnAttempt) {
                    return;
                }
                this.pane = PANE.HORIZONTAL;
                this.spawnAttempt = true;
                this.afterMapGen();
            }
        } else if (this.pane === PANE.HORIZONTAL) {
            if (isEmpty(this.tilePosition.x - 1, this.tilePosition.y)
                && isEmpty(this.tilePosition.x - 2, this.tilePosition.y)
                && isEmpty(this.tilePosition.x + 1, this.tilePosition.y)
                && isEmpty(this.tilePosition.x + 2, this.tilePosition.y)) {
                const subSlimes = [new WallSlime(this.tilePosition.x - 1, this.tilePosition.y),
                    new WallSlime(this.tilePosition.x - 2, this.tilePosition.y),
                    new WallSlime(this.tilePosition.x + 1, this.tilePosition.y),
                    new WallSlime(this.tilePosition.x + 2, this.tilePosition.y)];
                this.subSlimes = subSlimes;
                for (const slime of subSlimes) {
                    slime.baseSlime = this;
                    slime.pane = this.pane;
                    Game.world.addChild(slime);
                    Game.enemies.push(slime);
                    slime.placeOnMap()
                }
                subSlimes[0].texture = subSlimes[2].texture = Game.resources["src/images/enemies/wall_slime_sub.png"].texture;
                subSlimes[1].texture = subSlimes[3].texture = Game.resources["src/images/enemies/wall_slime_edge.png"].texture;
                subSlimes[1].angle = 180;
            } else {
                if (this.spawnAttempt) {
                    return;
                }
                this.pane = PANE.VERTICAL;
                this.spawnAttempt = true;
                this.afterMapGen();
            }
        }
    }

    move() {
        if (this.baseSlime) return;
        this.correctScale();
        if (this.currentTurnDelay <= 0) {
            this.currentTurnDelay = this.turnDelay;
        }
        this.currentTurnDelay--;
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
        if (this.baseSlime) {
            if (dmg >= this.baseSlime.health) {
                //split
            }
            this.baseSlime.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        } else {
            super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
            for (const slime of this.subSlimes) {
                slime.runHitAnimation();
            }
        }
    }

    correctScale() {
        if (this.pane === PANE.VERTICAL) {
            const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (sign === 1) this.angle = 270;
            else if (sign === -1) this.angle = 90;
        } else if (this.pane === PANE.HORIZONTAL) {
            const sign = Math.sign(closestPlayer(this).tilePosition.y - this.tilePosition.y);
            if (sign === 1) this.angle = 0;
            else if (sign === -1) this.angle = 180;
        }
    }

    updateIntentIcon() {
        if (this.baseSlime) return;
        else {
            super.updateIntentIcon();
            if (this.currentTurnDelay <= 0) {
                this.intentIcon.texture = Game.resources["src/images/icons/intents/anger.png"].texture;
            } else {
                this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
            }
        }
    }

    moveHealthContainer() {
        if (this.baseSlime) return;
        if (this.pane === PANE.HORIZONTAL) super.moveHealthContainer();
        else {
            if (!this.subSlimes) return;
            const lowestSlime = this.subSlimes.reduce((prev, val) => val.tilePosition.y > prev.tilePosition.y ? val : prev, this.subSlimes[0]);
            const highestSlime = this.subSlimes.reduce((prev, val) => val.tilePosition.y < prev.tilePosition.y ? val : prev, this.subSlimes[0]);
            this.healthContainer.position.x = lowestSlime.position.x - getHealthArray(this).slice(0, 5).length * (Game.TILESIZE / 65 * 20 + 0) / 2 + 0 / 2;
            this.healthContainer.position.y = lowestSlime.position.y + this.height * 0.5 + 10;

            this.intentIcon.position.x = highestSlime.position.x;
            this.intentIcon.position.y = highestSlime.position.y - this.height / 2 - this.intentIcon.height / 2;
            if (this.intentIcon2) {
                this.intentIcon2.position.x = this.intentIcon.position.x;
                this.intentIcon2.position.y = this.intentIcon.position.y;
            }
        }
    }
}