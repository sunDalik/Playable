import {Game} from "../../game"
import {TileElement} from "./tile_element"
import {cubicBezier, quadraticBezier} from "../../utils/math_utils";

export class AnimatedTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.STEP_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 12;
        this.SLIDE_ANIMATION_TIME = 12;
        this.ROTATE_TIME = 6;
        this.SHAKE_ANIMATION_TIME = 9;
        this.MICRO_JUMP_ANIMATION_TIME = 8;
        this.MICRO_SLIDE_ANIMATION_TIME = 4;
        this.animationCounter = 0;
        this.animation = null;
    }

    stepXY(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        this.placeOnMap();

        let jumpHeight = Game.TILESIZE * 30 * (Math.abs(tileStepY) + Math.abs(tileStepX)) / 2 / 75;
        if (tileStepY < 0) jumpHeight += Math.abs(tileStepY) * Game.TILESIZE;
        const oldPosX = this.position.x;
        const oldPosY = this.position.y;
        let counter = 0;
        const animationTime = this.STEP_ANIMATION_TIME - 1 + Math.abs(tileStepX) + Math.abs(tileStepY);
        const step = 1 / animationTime;

        const animation = () => {
            const t = (counter + 1) * step;
            const stepX = quadraticBezier(t, 0, tileStepX * Game.TILESIZE / 2, tileStepX * Game.TILESIZE);
            const stepY = quadraticBezier(t, 0, -jumpHeight, tileStepY * Game.TILESIZE);
            this.position.x = oldPosX + stepX;
            this.position.y = oldPosY + stepY;
            counter++;
            if (onFrame) onFrame();
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    stepX(tileStepX, onFrame = null, onEnd = null) {
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.placeOnMap();
        let jumpHeight = Game.TILESIZE * 25 / 75;
        if (this.stepXjumpHeight) jumpHeight = this.stepXjumpHeight;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.STEP_ANIMATION_TIME;
        let counter = 0;

        const animation = () => {
            this.position.x += stepX;
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    //are we happy with this??
    //I'm not sure...
    //todo...
    stepY(tileStepY, onFrame = null, onEnd = null) {
        this.removeFromMap();
        this.tilePosition.y += tileStepY;
        this.placeOnMap();
        const oldPosY = this.position.y;
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

        const animationTime = this.STEP_ANIMATION_TIME;
        const step = 1 / animationTime;
        let counter = 0;

        const animation = () => {
            const t = (counter + 1) * step;
            this.position.y = oldPosY + cubicBezier(t, P0, P1, P2, P3) * Game.TILESIZE * tileStepY;
            counter++;
            if (onFrame) onFrame();
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    step(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        if (tileStepX !== 0 && tileStepY !== 0) this.stepXY(tileStepX, tileStepY, onFrame, onEnd);
        else if (tileStepX !== 0) this.stepX(tileStepX, onFrame, onEnd);
        else if (tileStepY !== 0) this.stepY(tileStepY, onFrame, onEnd);
    }

    bumpX(tileStepX, onFrame = null, onEnd = null) {
        const jumpHeight = Game.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE / 2) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        let counter = 0;

        const animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.x += stepX;
            } else {
                this.position.x -= stepX;
            }
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter++;

            if (onFrame) onFrame();
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
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

        const animation = () => {
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
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        if (tileStepX !== 0) this.bumpX(tileStepX, onFrame, onEnd);
        else if (tileStepY !== 0) this.bumpY(tileStepY, onFrame, onEnd);
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.animationCounter = 0;
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        this.placeOnMap();

        const animation = () => {
            this.position.x += stepX;
            this.position.y += stepY;
            this.animationCounter++;
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.animationCounter = 0;
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;

        const animation = () => {
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
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    rotateByAngle(angle, rotateTime = this.ROTATE_TIME, cancellable = true) {
        this.animationCounter = 0;
        if (cancellable) this.cancelAnimation(); //to not reset angle

        const animation = () => {
            this.angle += angle / rotateTime;
            this.animationCounter++;
            if (this.animationCounter >= rotateTime) {
                Game.app.ticker.remove(animation);
                this.cancelAnimation();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    shake(dirX, dirY, animationTime = this.SHAKE_ANIMATION_TIME) {
        this.animationCounter = 0;
        const step = Game.TILESIZE / 20 / (animationTime / 4);

        const animation = () => {
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
                if (this.animation !== animation) Game.app.ticker.remove(animation);
            }
        };
        Game.app.ticker.remove(this.animation);
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    microJump() {
        let counter = 0;
        const stepY = Game.TILESIZE * 0.4 / (this.MICRO_JUMP_ANIMATION_TIME / 2);

        const animation = () => {
            if (counter < this.MICRO_JUMP_ANIMATION_TIME / 2) {
                this.position.y -= stepY;
            } else {
                this.position.y += stepY;
            }
            counter++;
            if (counter >= this.MICRO_JUMP_ANIMATION_TIME) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    microSlide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.MICRO_SLIDE_ANIMATION_TIME) {
        this.animationCounter = 0;
        let stepX;
        let stepY;
        if (tileStepX === 0 && tileStepY === 0) {
            //slide back
            stepX = (this.getTilePositionX() - this.position.x) / animationTime;
            stepY = (this.getTilePositionY() - this.position.y) / animationTime;
        } else {
            stepX = Game.TILESIZE * 0.4 * tileStepX / animationTime;
            stepY = Game.TILESIZE * 0.4 * tileStepY / animationTime;
        }

        const animation = () => {
            this.position.x += stepX;
            this.position.y += stepY;
            this.animationCounter++;
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }
}
