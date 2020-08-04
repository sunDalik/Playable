import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE, PLANE} from "../../../enums/enums";
import {randomChoice, randomShuffle} from "../../../utils/random_utils";
import {getPlayerOnTile, isEmpty, isNotOutOfMap, isRelativelyEmpty} from "../../../map_checks";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {getCardinalDirections, getChasingDirections} from "../../../utils/map_utils";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {wallTallness} from "../../draw/wall";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {updateIntent} from "../../../game_logic";

export class WallSlime extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["wall_slime_single.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 4;
        this.type = ENEMY_TYPE.WALL_SLIME;
        this.atk = 1;
        this.baseSlime = null;
        this.subSlimes = [];
        //default parameters
        this.currentTurnDelay = this.turnDelay = 4;
        this.plane = PLANE.HORIZONTAL;
        this.ord = 0;
        this.removeShadow();
    }

    setStun(stun) {
        super.setStun(stun);
        if (this.baseSlime && this.baseSlime.baseSlime === null) this.baseSlime.setStun(stun);
    }

    fitToTile() {
        if (this.plane === PLANE.HORIZONTAL) {
            const scaleY = (Game.TILESIZE + wallTallness) / this.getUnscaledHeight() * this.scaleModifier;
            const scaleX = Math.abs(scaleY);
            this.scale.set(scaleX, scaleY);
        } else {
            const scaleX = Game.TILESIZE / this.getUnscaledWidth() * this.scaleModifier;
            const scaleY = Math.abs(scaleX) * 1.01; // without "*1.01" there would be micro gaps between subslimes
            this.scale.set(scaleX, scaleY);
        }
    }

    getTilePositionY() {
        return Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
    }

    afterMapGen() {
        for (const plane of randomShuffle([PLANE.VERTICAL, PLANE.HORIZONTAL])) {
            for (const size of [5, 4, 3, 2, 1]) {
                if (this.canPlace(size, plane)) {
                    this.plane = plane;
                    this.createSubSlimes(size, plane);
                    return;
                }
            }
        }
    }

    createSubSlimes(size, plane) {
        this.subSlimes = [];
        const offset = Math.ceil((size - 1) / 2);
        for (let i = 0; i < size; i++) {
            if (i === Math.floor(size / 2)) continue;

            if (plane === PLANE.HORIZONTAL) this.subSlimes.push(new WallSlime(this.tilePosition.x - offset + i, this.tilePosition.y));
            else this.subSlimes.push(new WallSlime(this.tilePosition.x, this.tilePosition.y - offset + i));
        }
        this.baseSlime = null;
        const sortedSlime = this.getSortedSlime();
        for (let i = 0; i < sortedSlime.length; i++) {
            const slime = sortedSlime[i];
            slime.setTexture(size, plane, i);
            slime.setParameters(size);
            slime.place();
            if (slime !== this) {
                slime.baseSlime = this;
                slime.subSlimes = this.subSlimes.slice();
                slime.plane = this.plane;
                Game.world.addChild(slime);
                Game.enemies.push(slime);
                slime.placeOnMap();
            }
        }
    }

    canPlace(size, plane) {
        const offset = Math.ceil((size - 1) / 2);
        for (let i = 0; i < size; i++) {
            // don't check center tile for emptiness
            if (i === Math.floor(size / 2)) continue;

            if ((plane === PLANE.VERTICAL && !isEmpty(this.tilePosition.x, this.tilePosition.y - offset + i))
                || (plane === PLANE.HORIZONTAL) && !isEmpty(this.tilePosition.x - offset + i, this.tilePosition.y)) {
                return false;
            }
        }
        return true;
    }

    setParameters(size) {
        this.STEP_ANIMATION_TIME = Math.ceil(size * 1.3 + 5);
        this.currentTurnDelay = this.turnDelay = Math.ceil(size * 0.8);
        if (size === 5 || size === 4) this.maxHealth = 4;
        else if (size === 3 || size === 2) this.maxHealth = 3;
        else if (size === 1) this.maxHealth = 2;
        this.health = this.maxHealth;
    }

    setTexture(size, plane, pos) {
        this.ord = pos;
        this.scale.x = Math.abs(this.scale.x);
        if (size === 1) this.texture = RUEnemiesSpriteSheet["wall_slime_single.png"];
        else if (plane === PLANE.HORIZONTAL) {
            if (pos === 0) this.texture = RUEnemiesSpriteSheet["wall_slime_h_edge.png"];
            else if (pos === size - 1) {
                this.texture = RUEnemiesSpriteSheet["wall_slime_h_edge.png"];
                this.scale.x *= -1;
            } else this.texture = RUEnemiesSpriteSheet["wall_slime_h_middle.png"];
        } else {
            if (pos === 0) this.texture = RUEnemiesSpriteSheet["wall_slime_v_top_edge.png"];
            else if (pos === size - 1) this.texture = RUEnemiesSpriteSheet["wall_slime_v_bottom_edge.png"];
            else this.texture = RUEnemiesSpriteSheet["wall_slime_v_middle.png"];
        }
    }

    move() {
        this.reformIfSeparated();
        if (this.baseSlime) return;
        if (this.currentTurnDelay <= 0) {
            let movementOptions = this.closestSlimeToPlayer().getChasingOptionsForSlime(closestPlayer(this));
            if (movementOptions.length === 0) movementOptions = this.getRelativelyEmptyCardinalDirectionsForSlime();
            if (movementOptions.length !== 0) {
                const dir = randomChoice(movementOptions);
                const players = [];
                for (const slime of this.subSlimes.concat([this])) {
                    const player = getPlayerOnTile(slime.tilePosition.x + dir.x, slime.tilePosition.y + dir.y);
                    if (player) players.push(player);
                }
                if (players.length > 0) {
                    for (const player of players) {
                        player.damage(this.atk, this, true);
                    }
                    for (const slime of this.subSlimes.concat([this])) {
                        slime.bump(dir.x, dir.y);
                        if (Game.enemies.indexOf(slime) < Game.enemies.indexOf(this)) slime.cancellable = false;
                    }
                } else {
                    for (const slime of this.subSlimes.concat([this])) {
                        slime.step(dir.x, dir.y);
                        //assuming we iterate through Game.enemies from end to start
                        if (Game.enemies.indexOf(slime) < Game.enemies.indexOf(this)) slime.cancellable = false;
                    }
                }
            }
            this.currentTurnDelay = this.turnDelay;
        } else {
            this.currentTurnDelay--;
        }
    }

    reformIfSeparated() {
        const coord = this.plane === PLANE.HORIZONTAL ? "x" : "y";
        const antiCoord = this.plane === PLANE.HORIZONTAL ? "y" : "x";
        let orderedSlime = [];
        const baseSlime = this.baseSlime ? this.baseSlime : this;
        orderedSlime.push(baseSlime);
        orderedSlime = orderedSlime.concat(this.subSlimes);
        orderedSlime.sort((a, b) => a.ord - b.ord);

        let broken = false;
        for (let i = 0; i < orderedSlime.length; i++) {
            if (i !== 0 && (orderedSlime[i].tilePosition[coord] - orderedSlime[i - 1].tilePosition[coord] !== 1
                || orderedSlime[i].tilePosition[antiCoord] !== orderedSlime[i - 1].tilePosition[antiCoord])) {
                broken = true;
                break;
            }
            if ((orderedSlime[i].baseSlime === null && orderedSlime[i] !== baseSlime)
                || (orderedSlime[i].baseSlime !== null && orderedSlime[i].baseSlime !== baseSlime)) {
                broken = true;
                break;
            }
        }

        if (broken) {
            const newSlimeArray = [this];
            if (this.plane === PLANE.HORIZONTAL) {
                for (let x = this.tilePosition.x + 1; ; x++) {
                    if (isNotOutOfMap(x, this.tilePosition.y) && orderedSlime.includes(Game.map[this.tilePosition.y][x].entity)) {
                        newSlimeArray.push(Game.map[this.tilePosition.y][x].entity);
                    } else break;
                }
                for (let x = this.tilePosition.x - 1; ; x--) {
                    if (isNotOutOfMap(x, this.tilePosition.y) && orderedSlime.includes(Game.map[this.tilePosition.y][x].entity)) {
                        newSlimeArray.unshift(Game.map[this.tilePosition.y][x].entity);
                    } else break;
                }
            } else {
                for (let y = this.tilePosition.y + 1; ; y++) {
                    if (isNotOutOfMap(this.tilePosition.x, y) && orderedSlime.includes(Game.map[y][this.tilePosition.x].entity)) {
                        newSlimeArray.push(Game.map[y][this.tilePosition.x].entity);
                    } else break;
                }
                for (let y = this.tilePosition.y - 1; ; y--) {
                    if (isNotOutOfMap(this.tilePosition.x, y) && orderedSlime.includes(Game.map[y][this.tilePosition.x].entity)) {
                        newSlimeArray.unshift(Game.map[y][this.tilePosition.x].entity);
                    } else break;
                }
            }
            this.reform(newSlimeArray);
        }
    }

    reform(slimeArray) {
        const size = slimeArray.length;
        let subSlimes = [];
        for (let i = 0; i < slimeArray.length; i++) {
            const slime = slimeArray[i];
            if (i === Math.floor(size / 2)) {
                slime.baseSlime = null;
                subSlimes = slimeArray.filter(s => s !== slime);
            } else {
                slime.baseSlime = slimeArray[Math.floor(size / 2)];
            }

            slime.setTexture(size, this.plane, i);
            slime.setParameters(size);
            slime.place();
            slime.healthContainer.visible = false;
        }

        for (const slime of slimeArray) {
            slime.subSlimes = subSlimes.slice();
            slime.onMoveFrame();
        }
    }

    //assuming it is always called on the base slime
    getChasingOptionsForSlime(runner) {
        const directions = getChasingDirections(this, runner);
        for (let i = directions.length - 1; i >= 0; i--) {
            if (!this.isDirectionRelativelyEmpty(directions[i])) {
                removeObjectFromArray(directions[i], directions);
            }
        }
        return directions;
    }

    getRelativelyEmptyCardinalDirectionsForSlime() {
        const directions = getCardinalDirections();
        for (let i = directions.length - 1; i >= 0; i--) {
            if (!this.isDirectionRelativelyEmpty(directions[i])) {
                removeObjectFromArray(directions[i], directions);
            }
        }
        return directions;
    }

    closestSlimeToPlayer() {
        let closestSlime = this;
        for (const slime of this.subSlimes.concat([this])) {
            if (tileDistance(slime, closestPlayer(slime)) < tileDistance(closestSlime, closestPlayer(closestSlime))) {
                closestSlime = slime;
            }
        }
        return closestSlime;
    }

    isDirectionRelativelyEmpty(dir) {
        const slimes = this.baseSlime ? this.baseSlime.subSlimes.concat([this.baseSlime]) : this.subSlimes.concat([this]);
        if (dir.y !== 0) {
            if (this.plane === PLANE.VERTICAL) {
                if (dir.y === 1) {
                    if (!isRelativelyEmpty(this.getLowestSlime().tilePosition.x, this.getLowestSlime().tilePosition.y + 1)) {
                        return false;
                    }
                } else if (dir.y === -1) {
                    if (!isRelativelyEmpty(this.getHighestSlime().tilePosition.x, this.getHighestSlime().tilePosition.y - 1)) {
                        return false;

                    }
                }
            } else {
                for (const slime of slimes) {
                    if (!isRelativelyEmpty(slime.tilePosition.x, slime.tilePosition.y + dir.y)) {
                        return false;
                    }
                }
            }
        } else if (dir.x !== 0) {
            if (this.plane === PLANE.HORIZONTAL) {
                if (dir.x === 1) {
                    if (!isRelativelyEmpty(this.getRightmostSlime().tilePosition.x + 1, this.getRightmostSlime().tilePosition.y)) {
                        return false;
                    }
                } else if (dir.x === -1) {
                    if (!isRelativelyEmpty(this.getLeftmostSlime().tilePosition.x - 1, this.getLeftmostSlime().tilePosition.y)) {
                        return false;
                    }
                }
            } else {
                for (const slime of slimes) {
                    if (!isRelativelyEmpty(slime.tilePosition.x + dir.x, slime.tilePosition.y)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        if (this.baseSlime) {
            if (dmg >= this.baseSlime.health) {
                super.damage(source, this.health, inputX, inputY, damageType);
                this.baseSlime.divide(this);
            } else {
                this.baseSlime.damage(source, dmg, inputX, inputY, damageType);
            }
        } else {
            super.damage(source, dmg, inputX, inputY, damageType);
            for (const slime of this.subSlimes) {
                slime.runHitAnimation();
            }
            if (this.dead) this.divide(this);
        }
    }

    getSortedSlime() {
        const slime = this.subSlimes.concat([this]);
        return slime.sort((a, b) => a.tilePosition.x - b.tilePosition.x + a.tilePosition.y - b.tilePosition.y);
    }

    //assuming this method is always called on the base slime
    //new base slime will be either at the center or at BOTTOM/RIGHT
    divide(divider) {
        this.healthContainer.visible = false;
        this.intentIcon.visible = false;

        const sortedSlime = this.getSortedSlime();
        const firstHalf = sortedSlime.slice(0, sortedSlime.indexOf(divider));
        const secondHalf = sortedSlime.slice(sortedSlime.indexOf(divider) + 1);

        for (const newSlimeArray of [firstHalf, secondHalf]) {
            this.reform(newSlimeArray);
            for (const slime of newSlimeArray) {
                updateIntent(slime);
            }
        }
    }

    setStunIcon() {
        if (this.baseSlime) {
            this.intentIcon.visible = false;
            return;
        }

        super.setStunIcon();
    }

    updateIntentIcon() {
        if (this.baseSlime) {
            this.intentIcon.visible = false;
            return;
        }
        super.updateIntentIcon();
        if (this.currentTurnDelay <= 0) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }

    onMoveFrame() {
        if (!this.subSlimes || this.baseSlime) {
            if (this.healthContainer) this.healthContainer.visible = false;
            if (this.intentIcon) this.intentIcon.visible = false;
            return;
        }
        super.onMoveFrame();

        if (this.type === ENEMY_TYPE.WALL_SLIME) {
            if (this.subSlimes.length % 2 === 1 && this.plane === PLANE.HORIZONTAL) {
                this.intentIcon.position.x -= this.width / 2;
                this.healthContainer.position.x -= this.width / 2;
            } else if (this.subSlimes.length % 2 === 1 && this.plane === PLANE.VERTICAL) {
                this.intentIcon.position.y -= this.height / 2;
            }
            if (this.plane === PLANE.VERTICAL) {
                this.healthContainer.position.y = this.getLowestSlime().position.y + this.getLowestSlime().height / 2;
            }
        }
    }

    getLowestSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.y > prev.tilePosition.y ? val : prev, this.subSlimes[0]);
    }

    getHighestSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.y < prev.tilePosition.y ? val : prev, this.subSlimes[0]);
    }

    getLeftmostSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.x < prev.tilePosition.x ? val : prev, this.subSlimes[0]);
    }

    getRightmostSlime() {
        if (this.subSlimes.length === 0) return this;
        return this.subSlimes.concat([this]).reduce((prev, val) => val.tilePosition.x > prev.tilePosition.x ? val : prev, this.subSlimes[0]);
    }

    setQuirk(quirk) {
    }
}