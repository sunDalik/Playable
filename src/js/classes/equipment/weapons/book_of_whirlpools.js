import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {EffectsSpriteSheet, WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isEnemy, isNotAWall} from "../../../map_checks";
import {Game} from "../../../game";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {randomInt} from "../../../utils/random_utils";
import {AnimatedTileElement} from "../../tile_elements/animated_tile_element";
import {Z_INDEXES} from "../../../z_indexing";
import {removeObjectFromArray} from "../../../utils/basic_utils";

export class BookOfWhirlPools extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_whirlpools.png"]);
        this.id = EQUIPMENT_ID.BOOK_OF_WHIRLPOOLS;
        this.atk = 1;
        this.uses = this.maxUses = 3;
        this.focusTime = 3;
        this.primaryColor = 0x495aa2;
        this.name = "Book of Whirlpools";
        this.description = "Range 1\nShoot a whirlpool that lasts for 50 turns\nIt will travel and damage all enemies it touches";
        this.rarity = RARITY.C;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        if (isEnemy(wielder.tilePosition.x + dirX, wielder.tilePosition.y + dirY)) {
            this.shootWhirlpool(wielder, dirX, dirY);
            this.uses--;
            this.updateTexture(wielder);
            this.holdBookAnimation(wielder, dirX, dirY);
            return true;
        }
        return false;
    }

    shootWhirlpool(wielder, dirX, dirY) {
        const whirlPool = new Whirlpool(wielder.tilePosition.x, wielder.tilePosition.y,
            {x: dirX, y: dirY}, this, wielder);
        Game.world.addChild(whirlPool);
        whirlPool.update();
        whirlPool.pause();
    }
}

class Whirlpool extends AnimatedTileElement {

    constructor(tilePositionX, tilePositionY, direction, weapon, wielder) {
        super(EffectsSpriteSheet["whirlpool_effect.png"], tilePositionX, tilePositionY);
        this.angle = randomInt(0, 360);
        this.setOwnZIndex(Z_INDEXES.ENEMY + 1);
        this.removeShadow();
        Game.updateList.push(this);
        this.lifeTime = 50;
        this.currentLifeTime = 0;
        this.noMove = false;
        this.direction = direction;
        this.weapon = weapon;
        this.wielder = wielder;
        this.SLIDE_ANIMATION_TIME = 7;
        this.previouslyDamagedEnemies = [];
    }

    update() {
        if (this.noMove) {
            this.noMove = false;
            return;
        }
        const damagedEnemies = [];
        if (isEnemy(this.tilePosition.x, this.tilePosition.y)) {
            const enemy = Game.map[this.tilePosition.y][this.tilePosition.x].entity;
            if (!this.previouslyDamagedEnemies.includes(enemy)) {
                this.weapon.damageEnemies([enemy], this.wielder, this.wielder.getAtk(this.weapon), this.direction.x, this.direction.y, DAMAGE_TYPE.MAGICAL_WEAPON);
                damagedEnemies.push(enemy);
            }
        }

        //change direction if needed
        if (!isNotAWall(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y)) {
            const newDirections = [{x: this.direction.y, y: this.direction.x},
                {x: -this.direction.y, y: -this.direction.x},
                {x: -this.direction.x, y: -this.direction.y}];
            if (Math.random() < 0.5) {
                const temp = newDirections[0];
                newDirections[0] = newDirections[1];
                newDirections[1] = temp;
            }
            for (const dir of newDirections) {
                if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                    this.direction = dir;
                    break;
                }
            }
        }

        //attack enemy at direction and slide
        if (isEnemy(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y)) {
            const enemy = Game.map[this.tilePosition.y + this.direction.y][this.tilePosition.x + this.direction.x].entity;
            if (!damagedEnemies.includes(enemy) && !this.previouslyDamagedEnemies.includes(enemy)) {
                this.weapon.damageEnemies([enemy], this.wielder, this.wielder.getAtk(this.weapon), this.direction.x, this.direction.y, DAMAGE_TYPE.MAGICAL_WEAPON);
                damagedEnemies.push(enemy);
            }
        }
        this.slide(this.direction.x, this.direction.y);

        this.currentLifeTime++;
        if (this.currentLifeTime >= this.lifeTime) {
            removeObjectFromArray(this, Game.updateList);
            Game.world.removeChild(this);
        }
        this.previouslyDamagedEnemies = damagedEnemies;
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        const angleStep = 10;
        return super.slide(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            if (tileStepX > 0) this.angle += angleStep;
            else if (tileStepX < 0) this.angle -= angleStep;
            else this.angle += angleStep;
        }, onEnd, animationTime);
    }

    pause() {
        this.noMove = true;
    }
}
