import {Game} from "../../game"
import {Roller} from "./roller"
import {ENEMY_TYPE} from "../../enums";
import {isNotOutOfMap, isRelativelyEmpty, getPlayerOnTile, isEmpty} from "../../map_checks";

export class RollerB extends Roller {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/roller_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.health = 0.25;
        this.atk = 1.25;
        this.SLIDE_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 14;
        this.type = ENEMY_TYPE.ROLLER_B;
    }

    move() {
        let lastDirTileEmpty = true;
        let lastNotDirTileEmpty = true;
        for (let x = 1; ; x++) {
            if (isNotOutOfMap(this.tilePosition.x + x * this.direction, this.tilePosition.y)) {
                if (lastDirTileEmpty === true) {
                    if (!isRelativelyEmpty(this.tilePosition.x + x * this.direction, this.tilePosition.y)) {
                        lastDirTileEmpty = false;
                    }
                    let player = getPlayerOnTile(this.tilePosition.x + x * this.direction, this.tilePosition.y);
                    if (player !== null) {
                        if (x === 1) {
                            player.damage(this.atk, this);
                            this.rollBump();
                        } else if (x === 2) {
                            player.damage(this.atk, this);
                            this.rollThenBump();
                        } else if (x >= 3) {
                            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                            this.slide(this.direction * 2, 0);
                            this.updateMapPosition();
                        }
                        break;
                    }
                }
            }
            if (isNotOutOfMap(this.tilePosition.x - x * this.direction, this.tilePosition.y)) {
                if (lastNotDirTileEmpty === true) {
                    if (!isRelativelyEmpty(this.tilePosition.x - x * this.direction, this.tilePosition.y)) {
                        lastNotDirTileEmpty = false;
                    }
                    let player = getPlayerOnTile(this.tilePosition.x - x * this.direction, this.tilePosition.y);
                    if (player !== null) {
                        this.direction *= -1;
                        this.correctScale();
                        if (x === 1) {
                            player.damage(this.atk, this);
                            this.rollBump();
                        } else if (x === 2) {
                            player.damage(this.atk, this);
                            this.rollThenBump();
                        } else if (x >= 3) {
                            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                            this.slide(2 * this.direction, 0);
                            this.updateMapPosition();
                        }
                        break;
                    }
                }
            }
            if ((lastDirTileEmpty === false && lastNotDirTileEmpty === false) ||
                (!isNotOutOfMap(this.tilePosition.x + x * this.direction, this.tilePosition.y) &&
                    !isNotOutOfMap(this.tilePosition.x - x * this.direction, this.tilePosition.y))) {
                break;
            }
        }
    }

    rollThenBump() {
        let counter = 0;
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        let step = this.direction * Game.TILESIZE / (this.SLIDE_ANIMATION_TIME / 2);
        const jumpHeight = Game.TILESIZE * 40 / 75;
        const a = jumpHeight / ((Game.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (4 / 3) * this.direction * Game.TILESIZE + (-this.direction * Game.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        this.tilePosition.x += this.direction;

        this.animation = () => {
            if (counter < this.SLIDE_ANIMATION_TIME / 2) {
                this.position.x += step;
                counter++;
            } else if (counter < this.SLIDE_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME / 3) {
                step = this.direction * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
                this.position.x += step;
                counter++;
            } else if (counter < this.SLIDE_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME) {
                this.position.x -= step / 2;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
                counter++;
            } else if (counter >= this.SLIDE_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
            this.moveHealthContainer();
        };
        Game.APP.ticker.add(this.animation);
        this.updateMapPosition();
    }

    rollBump() {
        let counter = 0;
        const step = this.direction * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        const jumpHeight = Game.TILESIZE * 40 / 75;
        const a = jumpHeight / ((Game.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * this.direction * Game.TILESIZE + (-this.direction * Game.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);

        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 3) {
                this.position.x += step;
                counter++;
            } else if (counter < this.BUMP_ANIMATION_TIME) {
                this.position.x -= step / 2;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
                counter++;
            } else if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
            this.moveHealthContainer();
        };
        Game.APP.ticker.add(this.animation);
    }

    damage(dmg, inputX, inputY, magical = false) {
        if (inputX === 0 && this.stun === 0 && !magical) {
            this.cancelAnimation();
            if (isEmpty(this.tilePosition.x, this.tilePosition.y + inputY)) {
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepY(inputY);
                this.updateMapPosition();
            } else this.bumpY(inputY);
            this.cancellable = false;
        } else {
            super.damage(dmg, inputX, inputY, magical);
        }
    }
}