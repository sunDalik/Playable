import {Game} from "../../../game"
import {ROLE, STAGE} from "../../../enums";
import {TileElement} from "../../tile_elements/tile_element";
import {canBeFliedOverByBullet, getPlayerOnTile, isEnemy} from "../../../map_checks";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import * as PIXI from "pixi.js";

export class Bullet extends TileElement {
    constructor(texture, tilePositionX, tilePositionY, pattern) {
        super(texture, tilePositionX, tilePositionY);
        this.pattern = pattern;
        this.patternIndex = 0;
        this.dead = false;
        this.role = ROLE.BULLET;
        this.ANIMATION_TIME = 8;
        this.delay = 1;
        this.atk = 1;
        this.zIndex = Game.primaryPlayer.zIndex + 1;

        this.intentIcon = new PIXI.Sprite(PIXI.Texture.WHITE);
        Game.world.addChild(this.intentIcon);
        this.intentIcon.visible = false;
        this.intentIcon.zIndex = this.zIndex + 1;
        this.intentIcon.width = this.intentIcon.height = 14;
        this.intentIcon.alpha = 0.8;
        this.intentIcon.anchor.set(0.5, 0.5);
        this.updateIntentIcon();
        this.place();
    }

    place() {
        super.place();
        if (this.intentIcon) {
            this.moveIntentIcon();
        }
    }

    move() {
        if (this.dead) return false;
        if (this.delay <= 0) {
            const newX = this.tilePosition.x + this.pattern[this.patternIndex].x;
            const newY = this.tilePosition.y + this.pattern[this.patternIndex].y;
            if (isEnemy(newX, newY) || getPlayerOnTile(newX, newY) !== null) {
                this.attack(Game.map[newY][newX].entity);
            } else if (canBeFliedOverByBullet(newX, newY)) {
                this.fly(this.pattern[this.patternIndex].x, this.pattern[this.patternIndex].y);
                this.patternIndex++;
                if (this.patternIndex >= this.pattern.length) this.patternIndex = 0;
            } else {
                this.die(false);
                this.dieFly(this.pattern[this.patternIndex].x, this.pattern[this.patternIndex].y, this.ANIMATION_TIME, 0.5);
            }
        } else this.delay--;
        this.updateIntentIcon();
    }

    die(toRemove = true) {
        this.dead = true;
        this.intentIcon.visible = false;
        this.removeFromMap();
        removeObjectFromArray(this, Game.bullets);
        if (toRemove) this.removeFromWorld();
    }

    moveIntentIcon() {
        this.intentIcon.position.x = this.position.x;
        this.intentIcon.position.y = this.position.y;
    }

    removeFromWorld() {
        Game.world.removeChild(this);
        if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
    }

    attack(entity) {
        if (entity.role === ROLE.ENEMY) {
            entity.damage(this, this.atk, 0, 0, false, true);
        } else if (entity.role === ROLE.PLAYER) {
            entity.damage(this.atk, this, false, true);
        }
        this.die(false);
        this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
    }

    removeFromMap() {
        if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
        if (this === Game.map[this.tilePosition.y][this.tilePosition.x].entity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        } else if (this === Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        }
    }

    placeOnMap() {
        if (!this.dead) {
            if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
                Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
            }
            if (Game.map[this.tilePosition.y][this.tilePosition.x].entity === null) {
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else if (Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity === null) {
                Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = this;
            }
        }
    }

    fly(tileStepX, tileStepY, animationTime = this.ANIMATION_TIME) {
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;
        this.removeFromMap();
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        this.placeOnMap();
        let counter = 0;

        Game.app.ticker.remove(this.animation);
        const animation = (delta) => {
            this.position.x += stepX * delta;
            this.position.y += stepY * delta;
            counter += delta;
            this.moveIntentIcon();
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.place();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    dieFly(tileStepX, tileStepY, animationTime = this.ANIMATION_TIME, animationTimeMul = 0.8) {
        const stepX = Game.TILESIZE * tileStepX / animationTime;
        const stepY = Game.TILESIZE * tileStepY / animationTime;
        let counter = 0;
        Game.app.ticker.remove(this.animation);
        const animation = (delta) => {
            this.position.x += stepX * delta;
            this.position.y += stepY * delta;
            counter += delta;
            if (counter >= animationTime * animationTimeMul) {
                Game.app.ticker.remove(animation);
                this.removeFromWorld();
            }
        };
        Game.app.ticker.add(animation);
    }

    updateIntentIcon() {
        this.intentIcon.visible = !this.dead;
        this.intentIcon.angle = 0;
        if (this.delay > 0) {
            this.intentIcon.visible = false;
        } else if (this.pattern[this.patternIndex].x === 0 && this.pattern[this.patternIndex].y === 0) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/arrow_right.png"].texture;
            this.intentIcon.angle = this.getArrowRightAngle();
        }
    }

    getArrowRightAngle() {
        const dir = this.pattern[this.patternIndex];
        if (dir.x === -1 && dir.y === 0) return 180;
        else if (dir.x === 1 && dir.y === 0) return 0;
        else if (dir.x === 0 && dir.y === -1) return -90;
        else if (dir.x === 0 && dir.y === 1) return 90;
        else if (dir.x === 1 && dir.y === 1) return 45;
        else if (dir.x === 1 && dir.y === -1) return -45;
        else if (dir.x === -1 && dir.y === 1) return 135;
        else if (dir.x === -1 && dir.y === -1) return -135;
    }
}