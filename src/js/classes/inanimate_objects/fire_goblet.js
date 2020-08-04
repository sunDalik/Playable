import {Game} from "../../game";
import {INANIMATE_TYPE, ROLE} from "../../enums/enums";
import {otherPlayer} from "../../utils/game_utils";
import {isBullet} from "../../map_checks";
import {AnimatedTileElement} from "../tile_elements/animated_tile_element";
import {randomChoice} from "../../utils/random_utils";
import {FireHazard} from "../hazards/fire";
import {InanimatesSpriteSheet} from "../../loader";
import {Z_INDEXES} from "../../z_indexing";

export class FireGoblet extends AnimatedTileElement {
    constructor(tilePositionX, tilePositionY) {
        super(InanimatesSpriteSheet["fire_goblet.png"], tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.FIRE_GOBLET;
        this.maskLayers = [];
        this.standing = true;
        this.toBeShattered = false;
        this.shattered = false;
        this.shatterDelay = 0;
        this.direction = {x: 0, y: 0};
        this.anchor.set(0.5, 0.8);
        this.place();
        this.scaleModifier = 1;
        this.fitToTile();
        this.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY + 1);
        this.removeShadow();
    }

    immediateReaction() {
        this.relight();
    }

    interact(player, tileStepX, tileStepY) {
        if (tileStepX === this.direction.x && tileStepY === this.direction.y
            || isBullet(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)
            || isBullet(this.tilePosition.x, this.tilePosition.y)) {
            this.direction = {x: 0, y: 0};
            this.angle = 0;
            this.standing = true;
            this.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY + 1);
            this.texture = InanimatesSpriteSheet["fire_goblet.png"];
            for (let i = Game.bullets.length - 1; i >= 0; i--) {
                if (Game.bullets[i].tilePosition.x === this.tilePosition.x && Game.bullets[i].tilePosition.y === this.tilePosition.y) {
                    Game.bullets[i].die();
                }
            }
        } else {
            this.direction = {x: tileStepX, y: tileStepY};
            this.angle = this.getAngleForDirection(this.direction);
            this.standing = false;
            this.setOwnZIndex(Z_INDEXES.PLAYER - 1);
            this.texture = InanimatesSpriteSheet["fire_goblet_fallen.png"];
        }
        this.relight();
        this.place();
    }

    relight() {
        for (const mask of this.maskLayers) {
            Game.darkTiles[mask.y][mask.x].removeLightSource(mask);
        }
        if (this.direction.x === 0 && this.direction.y === 0) {
            let i = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (Math.abs(x) + Math.abs(y) <= 1) {
                        this.maskLayers[i] = {x: this.tilePosition.x + x, y: this.tilePosition.y + y};
                        i++;
                    }
                }
            }
        } else {
            this.maskLayers[0] = {x: this.tilePosition.x, y: this.tilePosition.y};
            this.maskLayers[1] = {
                x: this.tilePosition.x + this.direction.y,
                y: this.tilePosition.y + this.direction.x
            };
            this.maskLayers[2] = {
                x: this.tilePosition.x - this.direction.y,
                y: this.tilePosition.y - this.direction.x
            };
            this.maskLayers[3] = {
                x: this.tilePosition.x + this.direction.x,
                y: this.tilePosition.y + this.direction.y
            };
            this.maskLayers[4] = {
                x: this.tilePosition.x + this.direction.x * 2,
                y: this.tilePosition.y + this.direction.y * 2
            };
        }
        for (const mask of this.maskLayers) {
            Game.darkTiles[mask.y][mask.x].addLightSource(mask);
        }
    }

    getAngleForDirection(direction) {
        if (direction.x === -1) return -90;
        else if (direction.x === 1) return 90;
        else if (direction.y === -1) return 0;
        else if (direction.y === 1) return 180;
    }

    shatter() {
        this.shatterShake();
        this.toBeShattered = true;
        this.shatterDelay = 2;
    }

    onUpdate() {
        if (this.toBeShattered && this.shatterDelay <= 0) {
            this.toBeShattered = false;
            this.shattered = true;
            for (const mask of this.maskLayers) {
                Game.darkTiles[mask.y][mask.x].removeLightSource(mask);
            }
            this.cancelAnimation();
            this.texture = InanimatesSpriteSheet["fire_goblet_shattered.png"];
            this.direction = {x: randomChoice([-1, 1]), y: 0};
            this.angle = this.getAngleForDirection(this.direction);
            this.standing = false;
            this.zIndex = 0;
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
            const newFire = new FireHazard(this.tilePosition.x, this.tilePosition.y);
            newFire.currentSpreadDelay = 0;
            newFire.tileSpread = 2;
            newFire.spreadTimes = 3;
            Game.world.addHazard(newFire);
        }
        if (this.shattered) {
            this.filters = [];
        }
        if (this.shatterDelay > 0) {
            this.shatterDelay--;
            this.cancelAnimation();
            this.place();
            this.shatterShake();
        }
    }

    shatterShake() {
        if (this.angle === 90 || this.angle === -90) {
            this.shake(0, 0.5);
        } else {
            this.shake(0.5, 0);
        }
    }
}