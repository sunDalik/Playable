import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY, TILE_TYPE} from "../../../enums";
import {darkenTile, lightTile} from "../../../drawing/lighting";
import {otherPlayer} from "../../../utils/game_utils";
import {tileInsideTheBossRoom} from "../../../map_checks";
import {HeadWearSpriteSheet} from "../../../loader";

export class SeerCirclet {
    constructor() {
        this.texture = HeadWearSpriteSheet["seer_circlet.png"];
        this.type = HEAD_TYPE.SEER_CIRCLET;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.name = "Seer Circlet";
        this.description = "See your future";
        this.rarity = RARITY.A;
    }

    onWear() {
        for (let i = 0; i < Game.darkTiles.length; i++) {
            for (let j = 0; j < Game.darkTiles[0].length; j++) {
                if (Game.map[i][j].tileType === TILE_TYPE.NONE && !Game.map[i][j].lit && !tileInsideTheBossRoom(j, i)) {
                    lightTile(j, i);
                    Game.map[i][j].lit = false;
                }
            }
        }
    }

    onTakeOff(wielder) {
        if (otherPlayer(wielder).headwear && otherPlayer(wielder).headwear.type === this.type && !otherPlayer(wielder).dead) {
            return false;
        } else {
            for (let i = 0; i < Game.darkTiles.length; i++) {
                for (let j = 0; j < Game.darkTiles[0].length; j++) {
                    if (!Game.map[i][j].lit) {
                        darkenTile(j, i);
                    }
                }
            }
        }
    }

    onDeath(wielder) {
        this.onTakeOff(wielder);
    }

    onRevive(wielder) {
        this.onWear();
    }

    onNextLevel(wielder) {
        if (!wielder.dead) {
            this.onWear()
        }
    }
}