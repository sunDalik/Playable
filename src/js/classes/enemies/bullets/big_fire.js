import {Bullet} from "./bullet";
import {FireHazard} from "../../hazards/fire";
import {Game} from "../../../game";
import {ROLE} from "../../../enums";
import {getPlayerOnTile, isNotAWall} from "../../../map_checks";


//this.tilePosition refers to bottom right position
export class BigFireBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = Game.resources["src/images/bullets/fire_bullet.png"].texture) {
        super(texture, tilePositionX, tilePositionY, pattern);
        this.scaleModifier = 2.8;
        this.fitToTile();
        this.place();
        this.intentIcon.width = this.intentIcon.height = 25;
    }

    die(toRemove = true, fire = true) {
        super.die(toRemove);
        if (fire) Game.world.addHazard(new FireHazard(this.tilePosition.x, this.tilePosition.y));
    }

    place() {
        this.position.x = this.getTilePositionX() - Game.TILESIZE / 2;
        this.position.y = this.getTilePositionY() - Game.TILESIZE / 2;
        if (this.intentIcon) {
            this.moveIntentIcon();
        }
    }

    move() {
        if (this.dead) return false;
        if (this.delay <= 0) {
            const newX = this.tilePosition.x + this.pattern[this.patternIndex].x;
            const newY = this.tilePosition.y + this.pattern[this.patternIndex].y;
            if (isNotAWall(newX, newY)) {
                this.fly(this.pattern[this.patternIndex].x, this.pattern[this.patternIndex].y);
                this.patternIndex++;
                if (this.patternIndex >= this.pattern.length) this.patternIndex = 0;

                for (const tile of [{x: newX, y: newY}, {x: newX - 1, y: newY},
                    {x: newX, y: newY - 1}, {x: newX - 1, y: newY - 1}]) {
                    if (/*isEnemy(newX, newY) || */getPlayerOnTile(tile.x, tile.y) !== null) {
                        this.attack(Game.map[tile.y][tile.x].entity);
                    }
                }

            } else {
                this.die(false);
                this.dieFly(this.pattern[this.patternIndex].x, this.pattern[this.patternIndex].y, this.ANIMATION_TIME, 0.5);
            }
        } else this.delay--;
        this.updateIntentIcon();
    }

    attack(entity) {
        if (entity.role === ROLE.ENEMY) {
            entity.damage(this, this.atk, 0, 0, false, true);
        } else if (entity.role === ROLE.PLAYER) {
            entity.damage(this.atk, this, false, true);
        }
    }

    removeFromMap() {
    }

    placeOnMap() {
    }
}