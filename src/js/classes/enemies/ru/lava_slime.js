import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums";
import {isEmpty, isRelativelyEmpty} from "../../../map_checks";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {WallSlime} from "./wall_slime";
import {FireHazard} from "../../hazards/fire";

// ords are
// 0 1
// 2 3
export class LavaSlime extends WallSlime {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["lava_slime_single.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 4;
        this.type = ENEMY_TYPE.LAVA_SLIME;
        this.atk = 1.25;
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth() * 1.01;
        const scaleY = Math.abs(scaleX);
        this.scale.set(scaleX, scaleY);
    }

    afterMapGen() {
        if (this.canPlace()) {
            this.createSubSlimes(4);
        } else {
            this.createSubSlimes(1);
        }
    }

    createSubSlimes(size) {
        if (size === 4) {
            this.subSlimes = [new LavaSlime(this.tilePosition.x - 1, this.tilePosition.y - 1),
                new LavaSlime(this.tilePosition.x, this.tilePosition.y - 1),
                new LavaSlime(this.tilePosition.x - 1, this.tilePosition.y)];
        } else {
            this.subSlimes = [];
        }
        this.baseSlime = null;
        const sortedSlime = this.getSortedSlime();
        for (let i = 0; i < sortedSlime.length; i++) {
            const slime = sortedSlime[i];
            slime.setTexture(size, null, i);
            slime.setParameters(size);
            slime.place();
            if (slime !== this) {
                slime.baseSlime = this;
                slime.subSlimes = this.subSlimes.slice();
                Game.world.addChild(slime);
                Game.enemies.push(slime);
                slime.placeOnMap();
            }
        }
    }

    canPlace() {
        return isEmpty(this.tilePosition.x - 1, this.tilePosition.y - 1)
            && isEmpty(this.tilePosition.x, this.tilePosition.y - 1)
            && isEmpty(this.tilePosition.x - 1, this.tilePosition.y);
    }

    setParameters(size) {
        this.STEP_ANIMATION_TIME = size === 4 ? 9 : 6;
        this.currentTurnDelay = this.turnDelay = 1;
        if (size === 4) this.maxHealth = 3;
        else this.maxHealth = 2;
        this.health = this.maxHealth;
    }

    setTexture(size, plane, pos) {
        this.ord = pos;
        this.scale.x = Math.abs(this.scale.x);
        if (size === 1) this.texture = RUEnemiesSpriteSheet["lava_slime_single.png"];
        else {
            if (pos === 0) {
                this.texture = RUEnemiesSpriteSheet["lava_slime_top.png"];
            } else if (pos === 1) {
                this.texture = RUEnemiesSpriteSheet["lava_slime_top.png"];
                this.scale.x *= -1;
            } else if (pos === 2) {
                this.texture = RUEnemiesSpriteSheet["lava_slime_bottom.png"];
            } else if (pos === 3) {
                this.texture = RUEnemiesSpriteSheet["lava_slime_bottom.png"];
                this.scale.x *= -1;
            }
        }
    }

    reformIfSeparated() {
        let orderedSlime = [];
        const baseSlime = this.baseSlime ? this.baseSlime : this;
        orderedSlime.push(baseSlime);
        orderedSlime = orderedSlime.concat(this.subSlimes);
        orderedSlime.sort((a, b) => a.ord - b.ord);
        if (orderedSlime.length === 1) return;
        if (orderedSlime.length < 4) {
            this.reform([this]);
            return;
        }

        let broken = true;
        if (orderedSlime[1].tilePosition.y === orderedSlime[0].tilePosition.y && orderedSlime[1].tilePosition.x - orderedSlime[0].tilePosition.x === 1
            && orderedSlime[3].tilePosition.y === orderedSlime[2].tilePosition.y && orderedSlime[3].tilePosition.x - orderedSlime[2].tilePosition.x === 1
            && orderedSlime[3].tilePosition.y - orderedSlime[1].tilePosition.y === 1 && orderedSlime[3].tilePosition.x === orderedSlime[1].tilePosition.x) {
            broken = false;
        }

        if (broken) {
            this.reform([this]);
        }
    }

    getSortedSlime() {
        const slime = this.subSlimes.concat([this]);
        return slime.sort((a, b) => {
            if (a.tilePosition.y === b.tilePosition.y) return a.tilePosition.x === b.tilePosition.x;
            else return a.tilePosition.y - b.tilePosition.y;
        });
    }

    divide(divider) {
        this.healthContainer.visible = false;
        this.intentIcon.visible = false;

        for (const slime of this.getSortedSlime()) {
            if (slime !== divider) this.reform([slime]);
        }
    }

    onMoveFrame() {
        if (!this.subSlimes || this.baseSlime) {
            if (this.healthContainer) this.healthContainer.visible = false;
            if (this.intentIcon) this.intentIcon.visible = false;
            return;
        }
        super.onMoveFrame();

        if (this.subSlimes.length === 3) {
            this.intentIcon.position.x -= this.width / 2;
            this.healthContainer.position.x -= this.width / 2;
            this.intentIcon.position.y -= this.height / 2;
        }
    }

    isDirectionRelativelyEmpty(dir) {
        const slimes = this.baseSlime ? this.baseSlime.subSlimes.concat([this.baseSlime]) : this.subSlimes.concat([this]);
        if (slimes.length === 1) return isRelativelyEmpty(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
        if (dir.y === -1) {
            return slimes.every(slime => slime.ord === 2 || slime.ord === 3 || isRelativelyEmpty(slime.tilePosition.x, slime.tilePosition.y - 1));
        } else if (dir.y === 1) {
            return slimes.every(slime => slime.ord === 0 || slime.ord === 1 || isRelativelyEmpty(slime.tilePosition.x, slime.tilePosition.y + 1));
        } else if (dir.x === -1) {
            return slimes.every(slime => slime.ord === 1 || slime.ord === 3 || isRelativelyEmpty(slime.tilePosition.x - 1, slime.tilePosition.y));
        } else if (dir.x === 1) {
            return slimes.every(slime => slime.ord === 0 || slime.ord === 2 || isRelativelyEmpty(slime.tilePosition.x + 1, slime.tilePosition.y));
        }
        return false;
    }

    die(source) {
        super.die(source);
        Game.world.addHazard(new FireHazard(this.tilePosition.x, this.tilePosition.y));
    }
}