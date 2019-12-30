import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {getPlayerOnTile, isRelativelyEmpty} from "../../../map_checks";
import {randomChoiceSeveral} from "../../../utils/random_utils";
import {get8Directions, get8DirectionsInRadius} from "../../../utils/map_utils";
import {PoisonHazard} from "../../hazards/poison";

export class ParanoidEel extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PARANOID_EEL;
        this.atk = 1;

        this.waitingToAttack = false;

        this.triggeredSpinAttack = false;
        this.spinCounter = 4;
        this.currentSpinCounter = 0;

        this.scaleModifier = 3.7;
        this.direction = {x: 1, y: 0};
        this.fitToTile();
        this.zIndex = Game.primaryPlayer.zIndex + 1;
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.angle = 0;
    }

    afterMapGen() {
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        this.placeOnMap();
    }

    /*
    TODO ATTACKS:
    - charge horizontally
    - spill poison in a straight line
    - vertical rush
    - spit small eels
    - spill poison around (two types)
     */

    move() {
        if (this.triggeredSpinAttack) {
            if (this.waitingToAttack) this.waitingToAttack = false;
            else {
                this.spinAttack();
                if (this.currentSpinCounter >= this.spinCounter) this.triggeredSpinAttack = false;
            }
        } else {
            if (isRelativelyEmpty(this.tilePosition.x + this.direction.x * 2, this.tilePosition.y + this.direction.y * 2)) {
                const player = getPlayerOnTile(this.tilePosition.x + this.direction.x * 2, this.tilePosition.y + this.direction.y * 2);
                if (player) {
                    player.damage(this.atk, this, true, true);
                    this.slideBump(this.direction.x, this.direction.y);
                } else this.slide(this.direction.x, this.direction.y);
            } else this.turnAround();
        }
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

    spinAttack() {
        this.currentSpinCounter++;
        this.rotateByAngle(360, 12);
        const tileSpread = Math.min(this.currentSpinCounter, 2);
        const poisonDirs = randomChoiceSeveral(get8DirectionsInRadius(tileSpread, true), 6);
        for (const dir of poisonDirs) {
            Game.world.addHazard(new PoisonHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y));
        }
        for (const dir of get8Directions()) {
            const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
            if (player) player.damage(this.atk, this, true, true);
        }
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (!this.dead) {
            if (this.triggeredSpinAttack) return;
            const rand = Math.random() * 100;
            if (rand <= 20) {
                this.triggeredSpinAttack = true;
                this.waitingToAttack = true;
                this.currentSpinCounter = 0;
            }
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