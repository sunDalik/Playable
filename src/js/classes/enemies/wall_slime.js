import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, PANE} from "../../enums";
import {randomChoice} from "../../utils/random_utils";
import {getPlayerOnTile, isEmpty, isRelativelyEmpty} from "../../map_checks";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {getHealthArray} from "../../drawing/draw_utils";
import {getCardinalDirections, getChasingDirections} from "../../utils/map_utils";
import {removeObjectFromArray} from "../../utils/basic_utils";

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
        this.STEP_ANIMATION_TIME = 14;
        this.spawnAttempt = false;
        this.baseSlime = null;
        this.subSlimes = [];
    }

    afterMapGen() {
        if (this.baseSlime) return;
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
                    this.texture = Game.resources["src/images/enemies/wall_slime_single.png"].texture;
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
                    this.texture = Game.resources["src/images/enemies/wall_slime_single.png"].texture;
                    return;
                }
                this.pane = PANE.VERTICAL;
                this.spawnAttempt = true;
                this.afterMapGen();
            }
        }
    }

    //stunning sub slimes will probably not work...
    move() {
        if (this.baseSlime) return;
        this.correctScale();
        if (this.currentTurnDelay <= 0) {
            let movementOptions = this.closestSlimeToPlayer().getChasingOptionsForSlime(closestPlayer(this));
            if (movementOptions.length === 0) movementOptions = this.getRelativelyEmptyCardinalDirectionsForSlime();
            if (movementOptions.length !== 0) {
                const dir = randomChoice(movementOptions);
                const players = [];
                for (const slime of this.subSlimes.concat([this])) {
                    const player = getPlayerOnTile(slime.tilePosition.x + dir.x, slime.tilePosition.y + dir.y);
                    if (player) players.push(player);
                }
                if (players.length > 0) {
                    for (const player of players) {
                        player.damage(this.atk, this, true);
                    }
                    for (const slime of this.subSlimes.concat([this])) {
                        slime.bump(dir.x, dir.y);
                        if (Game.enemies.indexOf(slime) < Game.enemies.indexOf(this)) slime.cancellable = false;
                    }
                } else {
                    for (const slime of this.subSlimes.concat([this])) {
                        slime.step(dir.x, dir.y);
                        //assuming we iterate through Game.enemies from end to start
                        if (Game.enemies.indexOf(slime) < Game.enemies.indexOf(this)) slime.cancellable = false;
                    }
                }
                this.currentTurnDelay = this.turnDelay;
            }
        } else {
            this.currentTurnDelay--;
        }
    }

    //assuming it is always called on the base slime
    getChasingOptionsForSlime(runner) {
        const directions = getChasingDirections(this, runner);
        for (let i = directions.length - 1; i >= 0; i--) {
            if (!this.isDirectionRelativelyEmpty(directions[i])) {
                removeObjectFromArray(directions[i], directions);
            }
        }
        return directions;
    }

    getRelativelyEmptyCardinalDirectionsForSlime() {
        const directions = getCardinalDirections();
        for (let i = directions.length - 1; i >= 0; i--) {
            if (!this.isDirectionRelativelyEmpty(directions[i])) {
                removeObjectFromArray(directions[i], directions);
            }
        }
        return directions;
    }

    closestSlimeToPlayer() {
        let closestSlime = this;
        for (const slime of this.subSlimes.concat([this])) {
            if (tileDistance(slime, closestPlayer(slime)) < tileDistance(closestSlime, closestPlayer(closestSlime))) {
                closestSlime = slime;
            }
        }
        return closestSlime;
    }

    isDirectionRelativelyEmpty(dir) {
        if (dir.y !== 0) {
            if (this.pane === PANE.VERTICAL) {
                if (dir.y === 1) {
                    if (!isRelativelyEmpty(this.getLowestSlime().tilePosition.x, this.getLowestSlime().tilePosition.y + 1)) {
                        return false;
                    }
                } else if (dir.y === -1) {
                    if (!isRelativelyEmpty(this.getHighestSlime().tilePosition.x, this.getHighestSlime().tilePosition.y - 1)) {
                        return false;

                    }
                }
            } else {
                for (const slime of this.subSlimes.concat([this])) {
                    if (!isRelativelyEmpty(slime.tilePosition.x, slime.tilePosition.y + dir.y)) {
                        return false;
                    }
                }
            }
        } else if (dir.x !== 0) {
            if (this.pane === PANE.HORIZONTAL) {
                if (dir.x === 1) {
                    if (!isRelativelyEmpty(this.getRightmostSlime().tilePosition.x + 1, this.getRightmostSlime().tilePosition.y)) {
                        return false;
                    }
                } else if (dir.x === -1) {
                    if (!isRelativelyEmpty(this.getLeftmostSlime().tilePosition.x - 1, this.getLeftmostSlime().tilePosition.y)) {
                        return false;
                    }
                }
            } else {
                for (const slime of this.subSlimes.concat([this])) {
                    if (!isRelativelyEmpty(slime.tilePosition.x + dir.x, slime.tilePosition.y)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
        if (this.baseSlime) {
            if (dmg >= this.baseSlime.health) {
                this.baseSlime.health = this.baseSlime.maxHealth;
                super.damage(source, this.health, inputX, inputY, magical, hazardDamage);
                this.baseSlime.divide(this);
            } else {
                this.baseSlime.damage(source, dmg, inputX, inputY, magical, hazardDamage);
            }
        } else {
            super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
            for (const slime of this.subSlimes) {
                slime.runHitAnimation();
            }
            if (this.dead) this.divide(this);
        }
    }

    revive() {
        if (super.revive()) {
            this.afterMapGen();
        }
    }

    //assuming this method is always called on the base slime
    //new base slime will be either at the center or at BOTTOM/RIGHT
    divide(divider) {
        this.healthContainer.visible = false;
        this.intentIcon.visible = false;
        this.subSlimes.push(this);
        if (this.pane === PANE.HORIZONTAL) {
            this.subSlimes.sort((a, b) => a.tilePosition.x - b.tilePosition.x);
        } else if (this.pane === PANE.VERTICAL) {
            this.subSlimes.sort((a, b) => a.tilePosition.y - b.tilePosition.y);
        }
        const firstHalf = this.subSlimes.slice(0, this.subSlimes.indexOf(divider));
        const secondHalf = this.subSlimes.slice(this.subSlimes.indexOf(divider) + 1, this.subSlimes.length);
        for (const newSlimeArray of [firstHalf, secondHalf]) {
            if (newSlimeArray.length === 1) {
                const newSlime = newSlimeArray[0];
                newSlime.texture = Game.resources["src/images/enemies/wall_slime_single.png"].texture;
                newSlime.baseSlime = null;
                newSlime.subSlimes = [];
            } else if (newSlimeArray.length === 2) {
                newSlimeArray[0].texture = newSlimeArray[1].texture = Game.resources["src/images/enemies/wall_slime_edge_face.png"].texture;
                if (this.pane === PANE.HORIZONTAL) {
                    newSlimeArray[0].angle = 180;
                    newSlimeArray[1].angle = 0;
                } else {
                    newSlimeArray[0].angle = 270;
                    newSlimeArray[1].angle = 90;
                }
                newSlimeArray[0].baseSlime = newSlimeArray[1];
                newSlimeArray[0].subSlimes = [];
                newSlimeArray[1].baseSlime = null;
                newSlimeArray[1].subSlimes = [newSlimeArray[0]];
            } else if (newSlimeArray.length === 3) {
                newSlimeArray[0].texture = newSlimeArray[2].texture = Game.resources["src/images/enemies/wall_slime_edge.png"].texture;
                newSlimeArray[1].texture = Game.resources["src/images/enemies/wall_slime.png"].texture;
                if (this.pane === PANE.HORIZONTAL) {
                    newSlimeArray[0].angle = 180;
                    newSlimeArray[1].angle = newSlimeArray[2].angle = 0;
                } else {
                    newSlimeArray[0].angle = 270;
                    newSlimeArray[1].angle = newSlimeArray[2].angle = 90;
                }
                newSlimeArray[0].baseSlime = newSlimeArray[2].baseSlime = newSlimeArray[1];
                newSlimeArray[0].subSlimes = newSlimeArray[2].subSlimes = [];
                newSlimeArray[1].baseSlime = null;
                newSlimeArray[1].subSlimes = [newSlimeArray[0], newSlimeArray[2]];
            } else if (newSlimeArray.length === 4) {
                newSlimeArray[1].texture = newSlimeArray[2].texture = Game.resources["src/images/enemies/wall_slime_sub_face.png"].texture;
                newSlimeArray[0].texture = newSlimeArray[3].texture = Game.resources["src/images/enemies/wall_slime_edge.png"].texture;
                if (this.pane === PANE.HORIZONTAL) {
                    newSlimeArray[0].angle = 180;
                    newSlimeArray[2].angle = newSlimeArray[3].angle = 0;
                    newSlimeArray[1].angle = 180;
                } else {
                    newSlimeArray[0].angle = 270;
                    newSlimeArray[2].angle = newSlimeArray[3].angle = 90;
                    newSlimeArray[1].angle = 270;
                }
                newSlimeArray[0].baseSlime = newSlimeArray[1].baseSlime = newSlimeArray[3].baseSlime = newSlimeArray[2];
                newSlimeArray[0].subSlimes = newSlimeArray[1].subSlimes = newSlimeArray[3].subSlimes = [];
                newSlimeArray[2].baseSlime = null;
                newSlimeArray[2].subSlimes = [newSlimeArray[0], newSlimeArray[1], newSlimeArray[3]];
            }
            for (const slime of newSlimeArray) {
                slime.turnDelay = newSlimeArray.length;
                slime.STEP_ANIMATION_TIME = newSlimeArray.length * 2 + 4;
                slime.currentTurnDelay = slime.turnDelay;
                if (newSlimeArray.length === 4) slime.maxHealth = 4;
                else if (newSlimeArray.length === 3) slime.maxHealth = 3;
                else if (newSlimeArray.length === 2) slime.maxHealth = 3;
                else if (newSlimeArray.length === 1) slime.maxHealth = 2;
                slime.health = slime.maxHealth;
                if (slime.baseSlime === null) slime.updateIntentIcon();
            }
            if (newSlimeArray.length !== 0) newSlimeArray[0].correctScale();
        }
    }

    correctScale() {
        if (this.baseSlime) {
            this.baseSlime.correctScale();
            return;
        }
        if (this.subSlimes.length % 2 === 1) return;
        if (this.subSlimes.length === 0) {
            this.angle = 0;
        } else if (this.pane === PANE.VERTICAL) {
            const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (sign === 1) this.angle = 270;
            else if (sign === -1) this.angle = 90;
        }
    }

    updateIntentIcon() {
        if (this.baseSlime) return;
        super.updateIntentIcon();
        if (this.currentTurnDelay <= 0) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/anger.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
        }
    }

    moveHealthContainer() {
        if (!this.subSlimes) return;
        if (this.baseSlime) return;
        if (this.pane === PANE.HORIZONTAL && this.subSlimes.length % 2 === 0 || this.subSlimes.length === 0) super.moveHealthContainer();
        else if (this.pane === PANE.HORIZONTAL && this.subSlimes.length % 2 === 1) {
            this.healthContainer.position.x = this.position.x - this.width / 2 - getHealthArray(this).slice(0, 5).length * (Game.TILESIZE / 65 * 20 + 0) / 2 + 0 / 2;
            this.healthContainer.position.y = this.position.y + this.height * 0.5 + 10;

            this.intentIcon.position.x = this.position.x - this.width / 2;
            this.intentIcon.position.y = this.position.y - this.height / 2 - this.intentIcon.height / 2;
            if (this.intentIcon2) {
                this.intentIcon2.position.x = this.intentIcon.position.x;
                this.intentIcon2.position.y = this.intentIcon.position.y;
            }
        } else {
            const lowestSlime = this.getLowestSlime();
            const highestSlime = this.getHighestSlime();
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

    getLowestSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.y > prev.tilePosition.y ? val : prev, this.subSlimes[0]);
    }

    getHighestSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.y < prev.tilePosition.y ? val : prev, this.subSlimes[0]);
    }

    getLeftmostSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.x < prev.tilePosition.x ? val : prev, this.subSlimes[0]);
    }

    getRightmostSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.x > prev.tilePosition.x ? val : prev, this.subSlimes[0]);
    }
}