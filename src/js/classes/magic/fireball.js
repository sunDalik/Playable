import {Game} from "../../game"
import * as PIXI from "pixi.js"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE,} from "../../enums";
import {collisionCheck} from "../../collision_check";
import {createFadingAttack} from "../../animations";
import {redrawSlotContents} from "../../drawing/draw_hud";

export class Fireball {
    constructor() {
        this.texture = Game.resources["src/images/magic/fireball.png"].texture;
        this.type = MAGIC_TYPE.FIREBALL;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.atk = 1.5;
        this.multiplier = 0;
        this.castedThisTurn = true;
        this.multiplierDecreaseDelay = 2;
        this.maxUses = 3;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        if (Game.player.dead || Game.player2.dead) return false;
        if (this.multiplier < 3) {
            this.multiplier++;
            wielder.chargingMagic = this;
            this.updateTexture();
            this.castedThisTurn = true;
            this.multiplierDecreaseDelay = 2;

            let fire = new PIXI.Sprite(Game.resources["src/images/fire.png"].texture);
            const fireHeight = Game.TILESIZE * this.multiplier;
            fire.alpha = 0.15;
            fire.anchor.set(0, 0.5);
            fire.position.set(Game.player.x, Game.player.y);
            fire.width = Math.sqrt((Game.player2.x - Game.player.x) ** 2 + (Game.player.y - Game.player2.y) ** 2);
            fire.height = fireHeight;
            fire.rotation = Math.atan((Game.player2.y - Game.player.y) / (Game.player2.x - Game.player.x));
            if ((Game.player2.x - Game.player.x) < 0) fire.rotation += Math.PI;
            if (fire.width !== 0) createFadingAttack(fire);

        } else this.release();
        return true;
    }

    release() {
        if (this.uses <= 0) return false;
        if (this.multiplier <= 0) return false;
        if (Game.player.dead || Game.player2.dead) return false;
        let fire = new PIXI.Sprite(Game.resources["src/images/fire.png"].texture);
        const fireHeight = Game.TILESIZE * this.multiplier;
        fire.anchor.set(0, 0.5);
        fire.position.set(Game.player.x, Game.player.y);
        fire.width = Math.sqrt((Game.player2.x - Game.player.x) ** 2 + (Game.player.y - Game.player2.y) ** 2);
        fire.height = fireHeight;
        fire.rotation = Math.atan((Game.player2.y - Game.player.y) / (Game.player2.x - Game.player.x));
        if (Game.player2.x < Game.player.x) {
            fire.rotation += Math.PI;
        }
        createFadingAttack(fire);
        fire.getBounds();
        let fireCorrectVertexData;
        const fv = fire.vertexData;
        const fa = fire.angle >= 0 ? fire.angle : 360 - Math.abs(fire.angle);
        if (fa > 0 && fa <= 90) {
            fireCorrectVertexData = [fv[6], fv[7], fv[0], fv[1], fv[2], fv[3], fv[4], fv[5]]
        } else if (fa > 90 && fa <= 180) {
            fireCorrectVertexData = [fv[4], fv[5], fv[6], fv[7], fv[0], fv[1], fv[2], fv[3]]
        } else if (fa > 180 && fa <= 270) {
            fireCorrectVertexData = [fv[2], fv[3], fv[4], fv[5], fv[6], fv[7], fv[0], fv[1]]
        } else {
            fireCorrectVertexData = [fv[0], fv[1], fv[2], fv[3], fv[4], fv[5], fv[6], fv[7]]
        }
        if (fire.width !== 0) {
            for (const enemy of Game.enemies) {
                if (enemy.visible) {
                    if (collisionCheck(fireCorrectVertexData, enemy.vertexData)) {
                        enemy.damage(Game.BOTH_PLAYERS, this.atk * this.multiplier, 0, 0, true);
                    }
                }
            }
            for (const obelisk of Game.obelisks) {
                if (obelisk.visible) {
                    if (collisionCheck(fireCorrectVertexData, obelisk.vertexData)) {
                        obelisk.damage();
                    }
                }
            }
        }
        this.multiplier = 0;
        this.updateTexture();
        this.uses--;
        return true;
    }

    onNewTurn(player) {
        if (!this.castedThisTurn && this.multiplier > 0) {
            this.multiplierDecreaseDelay--;
            if (this.multiplierDecreaseDelay <= 0) {
                this.multiplier--;
                this.updateTexture();
                this.multiplierDecreaseDelay = 2;
                redrawSlotContents(player, player.getPropertyNameOfItem(this));
            }
        }
        this.castedThisTurn = false;
    }

    updateTexture() {
        switch (this.multiplier) {
            case 0:
                this.texture = Game.resources["src/images/magic/fireball.png"].texture;
                break;
            case 1:
                this.texture = Game.resources["src/images/magic/fireball_1.png"].texture;
                break;
            case 2:
                this.texture = Game.resources["src/images/magic/fireball_2.png"].texture;
                break;
            case 3:
                this.texture = Game.resources["src/images/magic/fireball_3.png"].texture;
                break;
        }
    }
}