import {Game} from "../../game"
import {TileElement} from "./tile_element"
import {cubicBezier, quadraticBezier} from "../../utils/math_utils";
import {BLACK_INVERT_FILTER, HIT_FILTER} from "../../filters";
import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";

const floorLevel = Game.TILESIZE * 0.4;

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
        this.tallModifier = 0;
        this.noShadow = false;
        this.regenerateShadow();
        this.place();
    }

    fitToTile() {
        super.fitToTile();
        if (this.shadow) this.regenerateShadow()
    }

    regenerateShadow() {
        Game.world.removeChild(this.shadow);
        if (this.noShadow) return;
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(0x666666, 0.2);
        this.shadow.drawEllipse(0, 0, (this.texture.trim.right - this.texture.trim.left) * this.scale.y * 0.5, 8);
        Game.world.addChild(this.shadow);
    }

    place() {
        super.place();
        if (this.shadow) this.placeShadow();
    }

    getTilePositionY() {
        let posY = super.getTilePositionY();
        if (!this.preserveCenteredPosition) //hack for eels
            posY += (this.texture.height - this.texture.trim.bottom) * this.scale.y + (Game.TILESIZE - this.height) / 2
                - floorLevel - this.tallModifier;
        return posY;
    }

    placeShadow() {
        //todo:they do be still looking kinda weird on y steps
        if (this.noShadow) return;
        this.shadow.zIndex = this.zIndex - 1;
        this.shadow.position.x = this.position.x;
        if (Math.abs(this.position.x - this.getTilePositionX()) < 2) {
            this.shadow.position.y = (this.tilePosition.y + 1) * Game.TILESIZE - floorLevel - (this.getTilePositionY() - this.position.y);
        } else {
            this.shadow.position.y = (this.tilePosition.y + 1) * Game.TILESIZE - floorLevel;
        }
    }

    step(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.STEP_ANIMATION_TIME) {
        this.onAnimationEnd = onEnd;
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        this.placeOnMap();

        let jumpHeight = Game.TILESIZE * 30 * (Math.abs(tileStepY) + Math.abs(tileStepX)) / 2 / 75;
        if (tileStepY < 0) jumpHeight += Math.abs(tileStepY) * Game.TILESIZE;
        else if (tileStepY === 0 && this.stepXjumpHeight) jumpHeight = this.stepXjumpHeight * (Math.abs(tileStepX));
        else if (tileStepY === 0) jumpHeight = Game.TILESIZE * 50 * (Math.abs(tileStepX)) / 75;

        const oldPosX = this.position.x;
        const oldPosY = this.position.y;
        const time = animationTime - 1 + Math.abs(tileStepX) + Math.abs(tileStepY);
        const step = 1 / time;
        this.animationCounter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            this.animationCounter += delta;
            const t = this.animationCounter * step;
            this.position.x = quadraticBezier(t, oldPosX, oldPosX + tileStepX * Game.TILESIZE / 2, oldPosX + tileStepX * Game.TILESIZE);
            this.position.y = quadraticBezier(t, oldPosY, oldPosY - jumpHeight, oldPosY + tileStepY * Game.TILESIZE);
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime / 2) {
                this.correctZIndex();
            }
            if (this.animationCounter >= time) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                this.onAnimationEnd = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    bumpX(tileStepX, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        this.onAnimationEnd = onEnd;
        let jumpHeight = Game.TILESIZE * 25 / 75;
        if (this.stepXjumpHeight) jumpHeight = this.stepXjumpHeight / 2;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE / 2) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / animationTime;
        let counter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            if (counter < animationTime / 2) {
                this.position.x += stepX * delta;
            } else {
                this.position.x -= stepX * delta;
            }
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter += delta;

            if (onFrame) onFrame();
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                this.onAnimationEnd = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    bumpY(tileStepY, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        this.onAnimationEnd = onEnd;
        const oldPosition = this.position.y;
        let newPosition = null;
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
        let counter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            const x = counter / animationTime;
            if (counter <= animationTime / 2) {
                this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
                newPosition = this.position.y;
            } else {
                this.position.y = newPosition - cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
            }
            if (onFrame) onFrame();
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                this.onAnimationEnd = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        if (tileStepX !== 0) this.bumpX(tileStepX, onFrame, onEnd, animationTime);
        else if (tileStepY !== 0) this.bumpY(tileStepY, onFrame, onEnd, animationTime);
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.onAnimationEnd = onEnd;
        this.animationCounter = 0;
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        this.placeOnMap();

        const animation = (delta) => {
            if (Game.paused) return;
            this.position.x += stepX * delta;
            this.position.y += stepY * delta;
            this.animationCounter += delta;
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime / 2) {
                this.correctZIndex();
            }
            if (this.animationCounter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                this.onAnimationEnd = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.onAnimationEnd = onEnd;
        this.animationCounter = 0;
        const time = animationTime - 2 + Math.abs(tileStepX) * 2 + Math.abs(tileStepY) * 2;
        const stepX = Game.TILESIZE * 0.7 * tileStepX / time;
        const stepY = Game.TILESIZE * 0.7 * tileStepY / time;

        const animation = (delta) => {
            if (Game.paused) return;
            if (this.animationCounter < animationTime / 2) {
                this.position.x += stepX * delta;
                this.position.y += stepY * delta;
            } else {
                this.position.x -= stepX * delta;
                this.position.y -= stepY * delta;
            }
            this.animationCounter += delta;
            if (onFrame) onFrame();
            if (this.animationCounter >= time) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
                this.onAnimationEnd = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    rotateByAngle(angle, rotateTime = this.ROTATE_TIME, cancellable = true) {
        this.animationCounter = 0;
        const step = angle / rotateTime;
        if (cancellable) this.cancelAnimation(); //to not reset angle

        const animation = (delta) => {
            if (Game.paused) return;
            this.angle += step * delta;
            this.animationCounter += delta;
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

        const animation = (delta) => {
            if (Game.paused) return;
            if (this.animationCounter < animationTime / 4) {
                this.position.x += step * dirX * delta;
                this.position.y += step * dirY * delta;
            } else if (this.animationCounter < animationTime * 3 / 4) {
                this.position.x -= step * dirX * delta;
                this.position.y -= step * dirY * delta;
            } else if (this.animationCounter < animationTime) {
                this.position.x += step * dirX * delta;
                this.position.y += step * dirY * delta;
            }
            this.animationCounter += delta;
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
        const stepY = Game.TILESIZE * 0.4 / (this.MICRO_JUMP_ANIMATION_TIME / 2);
        let counter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            if (counter < this.MICRO_JUMP_ANIMATION_TIME / 2) {
                this.position.y -= stepY * delta;
            } else {
                this.position.y += stepY * delta;
            }
            counter += delta;
            if (counter >= this.MICRO_JUMP_ANIMATION_TIME) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    microSlide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.MICRO_SLIDE_ANIMATION_TIME, maxDelta = 99) {
        this.animationCounter = 0;
        let stepX;
        let stepY;
        let place = false;
        if (tileStepX === 0 && tileStepY === 0) {
            //slide back
            stepX = (this.getTilePositionX() - this.position.x) / animationTime;
            stepY = (this.getTilePositionY() - this.position.y) / animationTime;
            place = true;
        } else {
            stepX = Game.TILESIZE * 0.4 * tileStepX / animationTime;
            stepY = Game.TILESIZE * 0.4 * tileStepY / animationTime;
        }

        const animation = (delta) => {
            if (Game.paused) return;
            if (delta > maxDelta) delta = maxDelta;
            this.position.x += stepX * delta;
            this.position.y += stepY * delta;
            this.animationCounter += delta;
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime) {
                Game.app.ticker.remove(animation);
                if (place) this.place();
                this.animation = null;
                if (onEnd) onEnd();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    shiftTilePosition(tileStepX, tileStepY) {
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        this.placeOnMap();
        this.position.x += Game.TILESIZE * tileStepX;
        this.position.y += Game.TILESIZE * tileStepY;
        this.correctZIndex();
    }

    setTilePosition(tilePosX, tilePosY) {
        this.removeFromMap();
        this.tilePosition.x = tilePosX;
        this.tilePosition.y = tilePosY;
        this.placeOnMap();
        this.place();
        this.correctZIndex();
    }

    runHitAnimation() {
        this.filters.push(BLACK_INVERT_FILTER);
        this.filters.push(HIT_FILTER);

        const time = 6;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter >= time) {
                removeObjectFromArray(BLACK_INVERT_FILTER, this.filters);
                removeObjectFromArray(HIT_FILTER, this.filters);
                Game.app.ticker.remove(animation);
            }
        };
        Game.app.ticker.add(animation);
    }
}
