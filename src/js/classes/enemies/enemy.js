"use strict";

class Enemy extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.dead = false;
        this.role = ROLE.ENEMY;
    }

    damage(health) {
        this.health -= health;
        if (this.health <= 0) this.dead = true;
    }

    isDead() {
        return this.dead;
    }
}