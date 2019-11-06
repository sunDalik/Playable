"use strict";

class Fireball {
    constructor() {
        this.texture = Game.resources["src/images/magic/fireball.png"].texture;
        this.type = MAGIC_TYPE.FIREBALL;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.atk = 1.5;
        this.multiplier = 0;
        this.maxUses = 3;
        this.uses = this.maxUses;
    }

    //don't know yet bro
    cast() {
        if (this.uses <= 0) return false;
        let fire = new PIXI.Sprite(Game.resources["src/images/fire.png"].texture);
        const fireHeight = Game.TILESIZE * this.multiplier;
        fire.anchor.set(0, 0.5);
        fire.position.set(Game.player.x, Game.player.y);
        fire.width = Math.sqrt((Game.player2.x - Game.player.x) ** 2 + (Game.player.y - Game.player2.y) ** 2);
        fire.height = fireHeight;
        Game.world.addChild(fire);
        fire.rotation = Math.atan((Game.player2.y - Game.player.y) / (Game.player2.x - Game.player.x));
        if ((Game.player2.x - Game.player.x) < 0) {
            fire.rotation += Math.PI;
        }
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
            createFadingAttack(fire, false);
            for (const enemy of Game.enemies) {
                if (!enemy.dead) {
                    if (collisionCheck(fireCorrectVertexData, enemy.vertexData)) {
                        enemy.damage(this.atk * this.multiplier, 0, 0, true);
                    }
                }
            }
        }
        this.uses--;
    }

    charge() {
        if (this.multiplier < 3) {
            this.multiplier++;
        } else this.cast();
    }
}