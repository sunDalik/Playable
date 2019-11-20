import {Game} from "../../game"
import {TileElement} from "./tile_element"
import {cubicBezier} from "../../utils/math_utils";

export class AnimatedTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.STEP_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 12;
        this.SLIDE_ANIMATION_TIME = 12;
        this.ROTATE_TIME = 6;
        this.SHAKE_ANIMATION_TIME = 9;
        this.animationCounter = 0;
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

    step(tileStepX, tileStepY) {
        if (tileStepX !== 0) this.stepX(tileStepX);
        else if (tileStepY !== 0) this.stepY(tileStepY);
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

    bump(tileStepX, tileStepY) {
        if (tileStepX !== 0) this.bumpX(tileStepX);
        else if (tileStepY !== 0) this.bumpY(tileStepY);
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.animationCounter = 0;
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            this.position.x += stepX;
            this.position.y += stepY;
            this.animationCounter++;
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime) {
                this.cancelAnimation();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.animationCounter = 0;
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            if (this.animationCounter < animationTime / 2) {
                this.position.x += stepX;
                this.position.y += stepY;
            } else {
                this.position.x -= stepX;
                this.position.y -= stepY;
            }
            this.animationCounter++;
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime) {
                this.cancelAnimation();
                if (onEnd) onEnd();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    rotateByAngle(angle, rotateTime = this.ROTATE_TIME, cancellable = true) {
        this.animationCounter = 0;
        if (cancellable) this.cancelAnimation(); //to not reset angle

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            this.angle += angle / rotateTime;
            this.animationCounter++;
            if (this.animationCounter >= rotateTime) {
                this.cancelAnimation();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    shake(dirX, dirY, animationTime = this.SHAKE_ANIMATION_TIME) {
        this.animationCounter = 0;
        let step = Game.TILESIZE / 20 / (animationTime / 4);

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            if (this.animationCounter < animationTime / 4) {
                this.position.x += step * dirX;
                this.position.y += step * dirY;
            } else if (this.animationCounter < animationTime * 3 / 4) {
                this.position.x -= step * dirX;
                this.position.y -= step * dirY;
            } else if (this.animationCounter < animationTime) {
                this.position.x += step * dirX;
                this.position.y += step * dirY;
            }
            this.animationCounter++;
            if (this.animationCounter >= animationTime) {
                this.animationCounter = 0;
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
    }
}
