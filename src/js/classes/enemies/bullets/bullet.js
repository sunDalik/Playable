import {Game} from "../../../game"
import {ROLE, STAGE} from "../../../enums";
import {TileElement} from "../../tile_elements/tile_element";
import {getPlayerOnTile, isEnemy, isRelativelyEmpty} from "../../../map_checks";
import {removeObjectFromArray} from "../../../utils/basic_utils";

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
    }

    move() {
        if (this.dead) return false;
        if (this.delay <= 0) {
            const newX = this.tilePosition.x + this.pattern[this.patternIndex].x;
            const newY = this.tilePosition.y + this.pattern[this.patternIndex].y;
            if (isEnemy(newX, newY) || getPlayerOnTile(newX, newY) !== null) {
                this.attack(Game.map[newY][newX].entity);
            } else if (isRelativelyEmpty(newX, newY)) {
                this.fly(this.pattern[this.patternIndex].x, this.pattern[this.patternIndex].y);
                this.patternIndex++;
                if (this.patternIndex >= this.pattern.length) this.patternIndex = 0;
            } else {
                this.die(false);
                this.dieFly(this.pattern[this.patternIndex].x, this.pattern[this.patternIndex].y, this.ANIMATION_TIME, 0.5);
            }
        } else this.delay--;
    }

    die(toRemove = true) {
        this.dead = true;
        this.removeFromMap();
        removeObjectFromArray(this, Game.bullets);
        if (toRemove) this.removeFromWorld();
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
            entity.damage(this.atk, this, false, false);
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
}