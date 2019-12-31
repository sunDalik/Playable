import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {getPlayerOnTile, isEmpty, isRelativelyEmpty} from "../../../map_checks";
import {randomChoiceSeveral} from "../../../utils/random_utils";
import {get8Directions, get8DirectionsInRadius} from "../../../utils/map_utils";
import {PoisonHazard} from "../../hazards/poison";
import {Eel} from "../eel";

export class ParanoidEel extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PARANOID_EEL;
        this.atk = 1;

        this.waitingToMove = false;

        this.triggeredSpinAttack = false;
        this.spinCounter = 4;
        this.currentSpinCounter = 0;

        this.triggeredEelSpit = false;
        this.eelSpitCounter = 2;
        this.currentEelSpitCounter = 0;

        this.scaleModifier = 3.7;
        this.direction = {x: 1, y: 0};
        this.fitToTile();
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        this.normalScaleX = this.scale.x;

        this.normTextures = [Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture,
            Game.resources["src/images/bosses/paranoid_eel/neutral_2.png"].texture]
    }

    cancelAnimation() {
        super.cancelAnimation();
        if (this.direction.x !== 0) {
            this.scale.x = this.direction.x * Math.abs(this.normalScaleX);
        }
        if (this.direction.y === 1) this.angle = 0;
        else if (this.direction.y === -1) this.angle = 180;
        else this.angle = 0;
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
    + spit small eels DONE
    - rotate on hit
    - spill poison around (two types)
     */

    move() {
        if (this.waitingToMove) this.waitingToMove = false;
        else if (this.triggeredSpinAttack) {
            this.spinAttack();
            if (this.currentSpinCounter >= this.spinCounter) this.triggeredSpinAttack = false;
        } else if (this.triggeredEelSpit) {
            this.spitEels();
            if (this.currentEelSpitCounter >= this.eelSpitCounter) this.triggeredEelSpit = false;
        } else {
            let canMove = true;
            const roll = Math.random() * 100;
            if (roll < 5) {
                if (this.emptyInFront()) {
                    this.triggeredEelSpit = true;
                    this.currentEelSpitCounter = 0;
                    this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit.png"].texture;
                    this.shake(this.direction.y, this.direction.x);
                    canMove = false;
                }
            }
            if (!canMove) return;
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
        this.setNeutralTextureIfNone();
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
        this.setNeutralTextureIfNone();
        if (this.direction.x !== 0) {
            this.flip();
            this.direction.x *= -1;
        } else if (this.direction.y !== 0) {
            this.rotateByAngle(180);
            this.direction.y *= -1;
        }
    }

    spitEels() {
        this.texture = Game.resources["src/images/bosses/paranoid_eel/spitting.png"].texture;
        this.currentEelSpitCounter++;
        const minionEel = new Eel(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
        Game.world.addChild(minionEel);
        Game.enemies.push(minionEel);
        minionEel.stun = 1;
        if (this.direction.x !== 0) {
            minionEel.setAngle(90 * (this.direction.x + 2));
        } else if (this.direction.y !== 0) {
            minionEel.setAngle(90 * (-this.direction.y + 1));
        }
        const spitAnimationTime = minionEel.SLIDE_ANIMATION_TIME - 6 + Math.abs(this.currentEelSpitCounter * this.direction.x) * 2 + Math.abs(this.currentEelSpitCounter * this.direction.y) * 2;
        minionEel.slide(this.currentEelSpitCounter * this.direction.x, this.currentEelSpitCounter * this.direction.y, null, () => {
            if (Math.random() < 0.5) {
                minionEel.rotateByAngle(90);
                minionEel.increaseAngle(90);
            } else {
                minionEel.rotateByAngle(-90);
                minionEel.increaseAngle(-90);
            }
        }, spitAnimationTime);
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
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    wiggle() {
        if (this.direction.x !== 0) {
            if (this.texture === this.normTextures[0]) {
                this.texture = this.normTextures[1];
            } else {
                this.texture = this.normTextures[0];
            }
        } else if (this.direction.y !== 0) {

        }
    }

    spinAttack() {
        this.currentSpinCounter++;
        this.rotateByAngle(360, 12);
        const tileSpread = Math.min(this.currentSpinCounter, 2);
        const poisonDirs = randomChoiceSeveral(get8DirectionsInRadius(tileSpread, true), 3 + this.currentSpinCounter * 2);
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
            this.direction = {x: -inputX, y: -inputY};
            if (this.triggeredSpinAttack) return;
            const roll = Math.random() * 100;
            if (roll <= 20) {
                this.triggeredSpinAttack = true;
                this.waitingToMove = true;
                this.currentSpinCounter = 0;
                this.shake(this.direction.y, this.direction.x);
            }
        }
    }

    emptyInFront() {
        let directions = [];
        if (this.direction.x !== 0) {
            directions = [{x: this.direction.x * 2, y: 0},
                {x: this.direction.x * 3, y: 0},
                {x: this.direction.x * 2, y: -1},
                {x: this.direction.x * 2, y: 1}]
        } else if (this.direction.y !== 0) {
            directions = [{x: 0, y: this.direction.y * 2},
                {x: 0, y: this.direction.y * 3},
                {x: -1, y: this.direction.y * 2},
                {x: 1, y: this.direction.y * 2}]
        }
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            if (i === 0 || i === 1) {
                if (!isEmpty(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                    return false;
                }
            } else {
                if (Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].entity !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    setNeutralTextureIfNone() {
        if (this.direction.x !== 0 && !(this.texture === this.normTextures[0] || this.texture === this.normTextures[1])) {
            if (Math.random() < 0.5) this.texture = this.normTextures[0];
            else this.texture = this.normTextures[1];
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