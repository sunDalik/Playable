import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, TILE_TYPE} from "../../../enums";

export class SeerCirclet {
    constructor() {
        this.texture = Game.resources["src/images/headwear/seer_circlet.png"].texture;
        this.type = HEAD_TYPE.SEER_CIRCLET;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
    }

    onWear() {
        for (let i = 0; i < Game.darkTiles.length; i++) {
            for (let j = 0; j < Game.darkTiles[0].length; j++) {
                if (Game.map[i][j].tileType === TILE_TYPE.NONE) {
                    Game.darkTiles[i][j].visible = false;
                    if (Game.map[i][j].entity) Game.map[i][j].entity.visible = true;
                }
            }
        }
    }

    onTakeOff() {
        for (let i = 0; i < Game.darkTiles.length; i++) {
            for (let j = 0; j < Game.darkTiles[0].length; j++) {
                if (!Game.map[i][j].lit) {
                    Game.darkTiles[i][j].visible = true;
                    if (Game.map[i][j].entity) Game.map[i][j].entity.visible = false;
                }
            }
        }
    }

    onDeath(player) {
        if (player.headwear && player.headwear.type === this.type) this.onTakeOff();
    }

    onRevive(player) {
        if (player.headwear && player.headwear.type === this.type) this.onWear();
    }

    onNextLevel() {
        this.onWear()
    }
}