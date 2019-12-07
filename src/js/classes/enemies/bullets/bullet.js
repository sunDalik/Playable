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
        this.ANIMATION_TIME = 6;
        this.delay = 1;
        this.atk = 0.5;
        Game.tiles.push(this);
        Game.bullets.push(this);
    }

    move() {
        if (this.dead) return false;
        if (this.delay <= 0) {
            const newX = this.tilePosition.x + this.pattern[this.patternIndex].x;
            const newY = this.tilePosition.y + this.pattern[this.patternIndex].y;
            if (isEnemy(newX, newY) || getPlayerOnTile(newX, newY) !== null) {
                this.attack(Game.map[newY][newX].entity);
            } else if (isRelativelyEmpty(newX, newY)) {
                this.fly(newX, newY);
                this.patternIndex++;
                if (this.patternIndex >= this.pattern.length) this.patternIndex = 0;
            } else this.die();
        } else this.delay--;
    }

    die() {
        this.dead = true;
        this.removeFromMap();
        this.visible = false;
        removeObjectFromArray(this, Game.tiles);
        removeObjectFromArray(this, Game.bullets);
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
        this.die();
    }

    removeFromMap() {
        if (this === Game.map[this.tilePosition.y][this.tilePosition.x].entity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        } else if (this === Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        }
    }

    placeOnMap() {
        if (!this.dead) {
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
        let animationCounter = 0;

        const animation = () => {
            this.position.x += stepX;
            this.position.y += stepY;
            animationCounter++;
            if (animationCounter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }
}