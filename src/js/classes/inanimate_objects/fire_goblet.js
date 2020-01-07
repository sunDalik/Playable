import {Game} from "../../game"
import {TallTileElement} from "../tile_elements/tall_tile_element"
import {INANIMATE_TYPE, ROLE, STAGE} from "../../enums";
import {otherPlayer} from "../../utils/game_utils";

export class FireGoblet extends TallTileElement {
    constructor(tilePositionX, tilePositionY) {
        super(Game.resources["src/images/other/fire_goblet.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.FIRE_GOBLET;
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        this.maskLayers = [];
        this.standing = true;
        this.direction = {x: 0, y: 0};
        this.anchor.set(0.5, 0.8);
        this.place();
    }

    immediateReaction() {
        this.relight();
    }

    push(tileStepX, tileStepY) {
        if (tileStepX === this.direction.x && tileStepY === this.direction.y) {
            this.direction = {x: 0, y: 0};
            this.angle = 0;
            this.standing = true;
            this.zIndex = Game.primaryPlayer.zIndex + 1;
            this.texture = Game.resources["src/images/other/fire_goblet.png"].texture;
        } else {
            this.direction = {x: tileStepX, y: tileStepY};
            this.angle = this.getAngleForDirection(this.direction);
            this.standing = false;
            this.zIndex = otherPlayer(Game.primaryPlayer).zIndex - 1;
            this.texture = Game.resources["src/images/other/fire_goblet_fallen.png"].texture;
        }
        this.relight();
        this.place();
    }

    relight() {
        if (Game.stage === STAGE.DARK_TUNNEL) {
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
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        if (this.standing) {
            this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE +
                (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        } else {
            //no comments..
            this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE +
                (Game.TILESIZE * 1.78 - this.height) + this.height * this.anchor.y;
        }
    }

    getAngleForDirection(direction) {
        if (direction.x === -1) return -90;
        else if (direction.x === 1) return 90;
        else if (direction.y === -1) return 0;
        else if (direction.y === 1) return 180;
    }
}