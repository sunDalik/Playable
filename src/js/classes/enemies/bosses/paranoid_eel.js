import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {getPlayerOnTile, isAnyWall, isEmpty, isRelativelyEmpty} from "../../../map_checks";
import {randomChoiceSeveral} from "../../../utils/random_utils";
import {get8Directions, get8DirectionsInRadius} from "../../../utils/map_utils";
import {PoisonHazard} from "../../hazards/poison";
import {Eel} from "../eel";
import {PoisonEel} from "../eel_poison";

export class ParanoidEel extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PARANOID_EEL;
        this.atk = 1;

        this.waitingToMove = false;

        this.triggeredSpinAttack = false;
        this.spinCounter = 5;
        this.currentSpinCounter = 0;

        this.triggeredEelSpit = false;
        this.eelSpitCounter = 2;
        this.currentEelSpitCounter = 0;

        this.triggeredPoisonEelSpit = false;

        this.triggeredStraightPoisonAttack = false;

        this.scaleModifier = 3.7;
        this.direction = {x: 1, y: 0};
        this.fitToTile();
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        this.normalScaleX = this.scale.x;

        this.normTextures = [Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture,
            Game.resources["src/images/bosses/paranoid_eel/neutral_2.png"].texture,
            Game.resources["src/images/bosses/paranoid_eel/neutral_y.png"].texture,
            Game.resources["src/images/bosses/paranoid_eel/neutral_y_2.png"].texture]

        this.minions = [];
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.correctLook();
    }

    afterMapGen() {
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        this.placeOnMap();
    }

    /*
    TODO ATTACKS:
    - charge horizontally
    - vertical rush
    - spill poison around (two types)
     */

    move() {
        if (this.waitingToMove) {
            this.waitingToMove = false;
            if (this.triggeredSpinAttack || this.triggeredPoisonEelSpit) this.shake(this.direction.y, this.direction.x);
        } else if (this.triggeredStraightPoisonAttack) {
            this.straightPoisonAttack();
            this.triggeredStraightPoisonAttack = false;
        } else if (this.triggeredSpinAttack) {
            this.spinAttack();
            if (this.currentSpinCounter >= this.spinCounter) this.triggeredSpinAttack = false;
        } else if (this.triggeredEelSpit) {
            this.spitEels();
            if (this.currentEelSpitCounter >= this.eelSpitCounter) this.triggeredEelSpit = false;
        } else if (this.triggeredPoisonEelSpit) {
            this.spitPoisonEel();
            this.triggeredPoisonEelSpit = false;
        } else {
            let canMove = true;
            const roll = Math.random() * 100;
            //bugs when it slides into wall then spits and all that happens quickly because you double tap player. Dont know why.
            if (roll < 2) {
                if (this.emptyInFront()) {
                    this.triggeredPoisonEelSpit = true;
                    this.waitingToMove = true;
                    if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit.png"].texture;
                    else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit_y.png"].texture;
                    this.shake(this.direction.y, this.direction.x);
                    canMove = false;
                }
            } else if (roll < 7) {
                if (this.emptyInFront()) {
                    this.triggeredEelSpit = true;
                    this.currentEelSpitCounter = 0;
                    if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit.png"].texture;
                    else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit_y.png"].texture;
                    this.shake(this.direction.y, this.direction.x);
                    canMove = false;
                }
            } else if (roll < 12) {
                this.triggeredSpinAttack = true;
                if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/panic.png"].texture;
                else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/panic_y.png"].texture;
                this.currentSpinCounter = 0;
                this.shake(this.direction.y, this.direction.x);
                canMove = false;
            } else if (roll < 25) {
                if (this.canDoPoisonStraightAttack()) {
                    this.triggeredStraightPoisonAttack = true;
                    if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit_poison.png"].texture;
                    else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit_poison_y.png"].texture;
                    this.shake(this.direction.x, this.direction.y);
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
        this.correctLook();
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
        this.correctLook();
        if (this.direction.x !== 0) {
            this.flip();
            this.direction.x *= -1;
        } else if (this.direction.y !== 0) {
            this.rotateByAngle(180);
            this.direction.y *= -1;
        }
    }

    spitEels() {
        //todo if player in front then spit eel that will damage him and die
        if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/spitting.png"].texture;
        else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/spitting_y.png"].texture;
        this.currentEelSpitCounter++;
        const minionEel = new Eel(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
        Game.world.addChild(minionEel);
        Game.enemies.push(minionEel);
        this.minions.push(minionEel);
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

    spitPoisonEel() {
        //todo if player in front then spit eel that will ???
        if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/spitting.png"].texture;
        else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/spitting_y.png"].texture;
        const minionEel = new PoisonEel(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
        Game.world.addChild(minionEel);
        Game.enemies.push(minionEel);
        this.minions.push(minionEel);
        minionEel.stun = 1;
        if (this.direction.x !== 0) {
            minionEel.setAngle(90 * (this.direction.x + 2));
        } else if (this.direction.y !== 0) {
            minionEel.setAngle(90 * (-this.direction.y + 1));
        }
        const spitAnimationTime = minionEel.SLIDE_ANIMATION_TIME - 6 + Math.abs(2 * this.direction.x) * 2 + Math.abs(2 * this.direction.y) * 2;
        minionEel.slide(2 * this.direction.x, 2 * this.direction.y, null, () => {
            if (Math.random() < 0.5) {
                minionEel.rotateByAngle(90);
                minionEel.increaseAngle(90);
            } else {
                minionEel.rotateByAngle(-90);
                minionEel.increaseAngle(-90);
            }
        }, spitAnimationTime);
    }

    straightPoisonAttack() {
        this.bump(this.direction.x, this.direction.y);
        for (let i = (this.direction.x + this.direction.y) * 2; ; i += this.direction.x + this.direction.y) {
            const x = this.tilePosition.x + i * Math.abs(this.direction.x);
            const y = this.tilePosition.y + i * Math.abs(this.direction.y);
            if (isAnyWall(x, y)) break;
            Game.world.addHazard(new PoisonHazard(x, y));
            const player = getPlayerOnTile(x, y);
            if (player) player.damage(this.atk, this, false, true);
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
            if (this.texture === this.normTextures[2]) {
                this.texture = this.normTextures[3];
            } else {
                this.texture = this.normTextures[2];
            }
        }
    }

    spinAttack() {
        this.currentSpinCounter++;
        this.rotateByAngle(360, 12);
        const tileSpread = Math.min(this.currentSpinCounter, 3);
        const poisonDirs = randomChoiceSeveral(get8DirectionsInRadius(tileSpread, true), 3 + Math.min(this.currentSpinCounter, 3));
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
            if ((this.direction.x !== -inputX || this.direction.y !== -inputY)
                && !this.triggeredStraightPoisonAttack && !this.triggeredEelSpit && !this.triggeredPoisonEelSpit) this.waitingToMove = true;
            if (inputX !== 0 || inputY !== 0) {
                this.shiftPositionOnDamage(source, inputX, inputY);
            } else this.rotateDirectionBy90();
            const roll = Math.random() * 100;
            if (roll <= 20) {
                this.triggeredSpinAttack = true;
                if (this.direction.x !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/panic.png"].texture;
                else if (this.direction.y !== 0) this.texture = Game.resources["src/images/bosses/paranoid_eel/panic_y.png"].texture;
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

    canDoPoisonStraightAttack() {
        for (let i = (this.direction.x + this.direction.y) * 2; ; i += this.direction.x + this.direction.y) {
            const x = this.tilePosition.x + i * Math.abs(this.direction.x) + Math.abs(this.direction.y);
            const y = this.tilePosition.y + i * Math.abs(this.direction.y) + Math.abs(this.direction.x);
            if (getPlayerOnTile(x, y)) return true;
            if (isAnyWall(x, y)) break;
        }
        for (let i = (this.direction.x + this.direction.y) * 2; ; i += this.direction.x + this.direction.y) {
            const x = this.tilePosition.x + i * Math.abs(this.direction.x) - Math.abs(this.direction.y);
            const y = this.tilePosition.y + i * Math.abs(this.direction.y) - Math.abs(this.direction.x);
            if (getPlayerOnTile(x, y)) return true;
            if (isAnyWall(x, y)) break;
        }
        return false;
    }

    shiftPositionOnDamage(player, inputX, inputY) {
        if (inputX === -this.direction.x && inputY === -this.direction.y) {
            return;
        } else if (inputX === this.direction.x && inputY === this.direction.y) {
            this.turnAround();
        } else {
            if (!player) return;
            this.removeFromMap();
            if (inputX !== 0) {
                this.tilePosition.y += Math.sign(player.tilePosition.y - this.tilePosition.y);
                this.tilePosition.x += Math.sign(this.tilePosition.x - player.tilePosition.x);
            } else if (inputY !== 0) {
                this.tilePosition.x += Math.sign(player.tilePosition.x - this.tilePosition.x);
                this.tilePosition.y += Math.sign(this.tilePosition.y - player.tilePosition.y);
            }
            this.direction = {x: -inputX, y: -inputY};
            this.correctLook();
            this.place();
            this.placeOnMap();
        }
    }

    rotateDirectionBy90() {
        this.removeFromMap();
        if (this.direction.x === 1) {
            this.direction = {x: 0, y: 1}
        } else if (this.direction.x === -1) {
            this.direction = {x: 0, y: -1}
        } else if (this.direction.y === 1) {
            this.direction = {x: -1, y: 0}
        } else if (this.direction.y === -1) {
            this.direction = {x: 1, y: 0}
        }
        this.correctLook();
        this.placeOnMap();
    }

    correctLook() {
        if (this.triggeredSpinAttack) {
            if (this.direction.x !== 0) {
                this.texture = Game.resources["src/images/bosses/paranoid_eel/panic.png"].texture;
            } else if (this.direction.y !== 0) {
                this.texture = Game.resources["src/images/bosses/paranoid_eel/panic_y.png"].texture;
            }
        } else if (this.triggeredEelSpit || this.triggeredPoisonEelSpit) {
            if (this.direction.x !== 0) {
                this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit.png"].texture;
            } else if (this.direction.y !== 0) {
                this.texture = Game.resources["src/images/bosses/paranoid_eel/ready_to_spit_y.png"].texture;
            }
        } else {
            if (this.direction.x !== 0 && this.texture !== this.normTextures[0] && this.texture !== this.normTextures[1]) {
                if (this.texture === Game.resources["src/images/bosses/paranoid_eel/spitting.png"].texture) {
                    this.texture = this.normTextures[0];
                } else if (Math.random() < 0.5) this.texture = this.normTextures[0];
                else this.texture = this.normTextures[1];
            } else if (this.direction.y !== 0 && this.texture !== this.normTextures[2] && this.texture !== this.normTextures[3]) {
                if (this.texture === Game.resources["src/images/bosses/paranoid_eel/spitting_y.png"].texture) {
                    this.texture = this.normTextures[2];
                } else if (Math.random() < 0.5) this.texture = this.normTextures[2];
                else this.texture = this.normTextures[3];
            }
        }

        if (this.direction.x !== 0) {
            this.scale.x = this.direction.x * Math.abs(this.normalScaleX);
        }
        if (this.direction.y === 1) this.angle = 0;
        else if (this.direction.y === -1) this.angle = 180;
        else this.angle = 0;
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