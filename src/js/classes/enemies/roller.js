import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {isRelativelyEmpty, getPlayerOnTile} from "../../map_checks";

export class Roller extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/roller.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.atk = 1;
        this.direction = 1;
        this.SLIDE_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 14;
        this.type = ENEMY_TYPE.ROLLER;
    }

    cancelAnimation() {
        Game.APP.ticker.remove(this.animation);
        this.place();
        this.correctScale();
    }

    move() {
        if (isRelativelyEmpty(this.tilePosition.x + this.direction, this.tilePosition.y)) {
            let player = getPlayerOnTile(this.tilePosition.x + this.direction, this.tilePosition.y);
            if (player !== null) {
                player.damage(this.atk, this);
                this.rollBump();
            } else {
                this.slide(this.direction, 0);
            }
        } else this.rollBump();
    }

    correctScale() {
        if ((this.direction === 1 && this.scale.x < 0) || (this.direction === -1 && this.scale.x > 0)) {
            this.scale.x *= -1
        }
    }

    rollBump() {
        const oldDirection = this.direction;
        this.direction *= -1;
        const oldStep = oldDirection * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        const newStep = oldStep * -1;
        const jumpHeight = Game.TILESIZE * 40 / 75;
        const a = jumpHeight / ((Game.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * oldDirection * Game.TILESIZE + (this.direction * Game.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        let counter = 0;

        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 3) {
                this.position.x += oldStep;
                counter++;
            } else if (counter >= this.BUMP_ANIMATION_TIME / 3 && counter < this.BUMP_ANIMATION_TIME) {
                this.correctScale();
                this.position.x += newStep / 2;
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
}