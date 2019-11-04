"use strict";

class AnimatedTileElement extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.STEP_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 12;
        this.SLIDE_ANIMATION_TIME = 12;
        this.animation = null;
    }

    stepX(tileStepX, onFrame = null, onEnd = null) {
        this.tilePosition.x += tileStepX;
        const jumpHeight = Game.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.STEP_ANIMATION_TIME;
        let counter = 0;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            this.position.x += stepX;
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    //apparently incorrect
    //todo: revise this
    stepY(tileStepY, onFrame = null, onEnd = null) {
        this.tilePosition.y += tileStepY;
        let counter = 0;
        const oldPosition = this.position.y;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            x += 1 / this.STEP_ANIMATION_TIME;
            this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE * tileStepY;
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    bumpX(tileStepX, onFrame = null, onEnd = null) {
        const jumpHeight = Game.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE / 2) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        let counter = 0;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.x += stepX;
            } else {
                this.position.x -= stepX;
            }
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter++;

            if (onFrame) onFrame();
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    bumpY(tileStepY, onFrame = null, onEnd = null) {
        let counter = 0;
        const oldPosition = this.position.y;
        let newPosition = null;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            x += 1 / this.BUMP_ANIMATION_TIME;
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
                newPosition = this.position.y;
            } else {
                this.position.y = newPosition - cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
            }
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    slideX(tileStepX, onFrame = null, onEnd = null, SLIDE_ANIMATION_TIME = this.SLIDE_ANIMATION_TIME) {
        let counter = 0;
        const step = Game.TILESIZE * tileStepX / SLIDE_ANIMATION_TIME;
        this.tilePosition.x += tileStepX;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            this.position.x += step;
            counter++;
            if (onFrame) onFrame();
            if (counter >= SLIDE_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    slideY(tileStepY, onFrame = null, onEnd = null, SLIDE_ANIMATION_TIME = this.SLIDE_ANIMATION_TIME) {
        let counter = 0;
        const step = Game.TILESIZE * tileStepY / SLIDE_ANIMATION_TIME;
        this.tilePosition.y += tileStepY;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            this.position.y += step;
            counter++;
            if (onFrame) onFrame();
            if (counter >= SLIDE_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    slideBumpX(tileStepX, onFrame = null, onEnd = null) {
        let counter = 0;
        const step = Game.TILESIZE * tileStepX / this.SLIDE_ANIMATION_TIME;
        this.animation = () => {
            if (counter < this.SLIDE_ANIMATION_TIME / 2) {
                this.position.x += step;
            } else {
                this.position.x -= step;
            }
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.SLIDE_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    slideBumpY(tileStepY, onFrame = null, onEnd = null) {
        let counter = 0;
        const step = Game.TILESIZE * tileStepY / this.SLIDE_ANIMATION_TIME;
        this.animation = () => {
            if (counter < this.SLIDE_ANIMATION_TIME / 2) {
                this.position.y += step;
            } else {
                this.position.y -= step;
            }
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.SLIDE_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }
}
