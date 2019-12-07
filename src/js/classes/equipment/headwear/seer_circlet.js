import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, TILE_TYPE} from "../../../enums";
import {darkenTile, lightTile} from "../../../drawing/lighting";

export class SeerCirclet {
    constructor() {
        this.texture = Game.resources["src/images/headwear/seer_circlet.png"].texture;
        this.type = HEAD_TYPE.SEER_CIRCLET;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
    }

    onWear() {
        for (let i = 0; i < Game.darkTiles.length; i++) {
            for (let j = 0; j < Game.darkTiles[0].length; j++) {
                if (Game.map[i][j].tileType === TILE_TYPE.NONE && !Game.map[i][j].lit) {
                    lightTile(j, i);
                    Game.map[i][j].lit = false;
                }
            }
        }
    }

    onTakeOff() {
        for (let i = 0; i < Game.darkTiles.length; i++) {
            for (let j = 0; j < Game.darkTiles[0].length; j++) {
                if (!Game.map[i][j].lit) {
                    darkenTile(j, i);
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