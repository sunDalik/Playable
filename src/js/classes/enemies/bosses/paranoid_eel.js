import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {isRelativelyEmpty} from "../../../map_checks";

export class ParanoidEel extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PARANOID_EEL;
        this.atk = 0.5;
        this.scaleModifier = 3.7;
        this.direction = {x: 1, y: 0};
        this.fitToTile();
    }

    afterMapGen() {
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        this.placeOnMap();
    }

    move() {
        // check if empty
        this.slide(this.direction.x, this.direction.y);
    }

    slide(tileStepX, tileStepY) {
        this.wiggled = false;
        super.slide(tileStepX, tileStepY, () => {
            if (this.animationCounter >= this.SLIDE_ANIMATION_TIME / 2 && !this.wiggled) {
                this.wiggle();
                this.wiggled = true;
            }
        }, () => {
            if (!isRelativelyEmpty(this.tilePosition.x + tileStepX + Math.sign(tileStepX),
                this.tilePosition.y + tileStepY + Math.sign(tileStepY))) this.turnAround();
            this.wiggled = false;
        });
    }

    turnAround() {
        if (this.direction.x !== 0) {
            this.flip();
            this.direction.x *= -1;
        }
    }

    flip() {
        const oldScaleX = this.scale.x;
        const time = 12;
        const step = -Math.sign(oldScaleX) * Math.abs(oldScaleX) * 2 / time;
        let counter = 0;
        const animation = delta => {
            counter += delta;
            this.scale.x += step * delta;
            if (counter >= time) {
                this.scale.x = -oldScaleX;
                Game.app.ticker.remove(animation);
            }
        };
        Game.app.ticker.add(animation);
    }

    wiggle() {
        if (this.direction.x !== 0) {
            if (this.texture === Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture) {
                this.texture = Game.resources["src/images/bosses/paranoid_eel/neutral_2.png"].texture
            } else {
                this.texture = Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture
            }
        } else if (this.direction.y !== 0) {

        }
    }

    placeOnMap() {
        super.placeOnMap();
        if (this.direction.x !== 0) {
            this.tilePosition.x++;
            super.placeOnMap();
            this.tilePosition.x -= 2;
            super.placeOnMap();
            this.tilePosition.x++;
        } else if (this.direction.y !== 0) {
            this.tilePosition.y++;
            super.placeOnMap();
            this.tilePosition.y -= 2;
            super.placeOnMap();
            this.tilePosition.y++;
        }
    }

    removeFromMap() {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity === this) {
                    Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity = null;
                }
            }
        }
    }
}