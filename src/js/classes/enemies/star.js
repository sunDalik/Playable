"use strict";

class Star extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/star.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.triggered = false;
        this.SHAKE_ANIMATION_TIME = 4;
        this.entityType = ENEMY_TYPE.STAR;
    }

    move() {
        if (this.triggered) this.attack();
        else {
            loop: for (let offset = -2; offset <= 2; offset++) {
                for (let sign = -1; sign <= 1; sign += 2) {
                    if (offset !== 0) {
                        const player = getPlayerOnTile(this.tilePosition.x + offset, this.tilePosition.y + offset * sign);
                        if (player !== null) {
                            this.triggered = true;
                            break loop;
                        }
                    }
                }
            }
            if (this.triggered) this.shake();
        }
    }

    shake() {
        let counter = 0;
        let step = GameState.TILESIZE / 20 / (this.SHAKE_ANIMATION_TIME / 2);
        let direction = -1;
        this.animation = () => {
            if (counter < this.SHAKE_ANIMATION_TIME / 2) {
                this.position.x += step * direction;
                counter++;
            } else if (counter < this.SHAKE_ANIMATION_TIME) {
                this.position.x -= step * direction;
                counter++;
            } else {
                counter = 0;
                direction *= -1;
                this.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }

    attack() {
        this.triggered = false;
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign <= 1; sign += 2) {
                if (offset !== 0 && isNotAWall(this.tilePosition.x + offset, this.tilePosition.y + offset * sign)) {
                    const attackPositionX = this.tilePosition.x + offset;
                    const attackPositionY = this.tilePosition.y + offset * sign;
                    createFadingAttack(new TileElement(GameState.resources["src/images/enemy_attack.png"].texture, attackPositionX, attackPositionY));
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player !== null) damagePlayer(player, 1);
                }
            }
        }
    }
}