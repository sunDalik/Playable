import {Boss} from "./boss";
import {ENEMY_TYPE} from "../../../enums/enums";
import {Game} from "../../../game";
import {tileInsideTheBossRoom} from "../../../map_checks";
import {FCEnemiesSpriteSheet, LunaticLeaderSpriteSheet} from "../../../loader";

export class MarbleChess extends Boss {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spider.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 22;
        this.type = ENEMY_TYPE.MARBLE_CHESS;
    }

    static getBossRoomStats() {
        return {width: 10, height: 10};
    }

    afterMapGen() {
        for (const floorTile of Game.floorTiles) {
            if (tileInsideTheBossRoom(floorTile.tilePosition.x, floorTile.tilePosition.y)) {
                const relativePos = {
                    x: floorTile.tilePosition.x - Game.endRoomBoundaries[0].x + 1,
                    y: floorTile.tilePosition.y - Game.endRoomBoundaries[0].y + 1
                };
                if ((relativePos.x + relativePos.y) % 2 === 1) {
                    floorTile.texture = Game.resources["src/images/tilesets/mm_tileset/black_marble_floor_tile_0.png"].texture;
                }
            }
        }
    }
}