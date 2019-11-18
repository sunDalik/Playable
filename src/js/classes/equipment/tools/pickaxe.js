import {Game} from "../../../game"
import {EQUIPMENT_TYPE, TILE_TYPE, TOOL_TYPE} from "../../../enums";
import {isAWall} from "../../../map_checks";
import {removeTileFromWorld} from "../../../game_logic";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {calculateDetectionGraph} from "../../../map_generation";

export class Pickaxe {
    constructor() {
        this.texture = Game.resources["src/images/tools/pickaxe.png"].texture;
        this.type = TOOL_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
    }

    use(player, tileDirX, tileDirY) {
        if (isAWall(player.tilePosition.x + tileDirX, player.tilePosition.y + tileDirY)) {
            removeTileFromWorld(Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX].tile);
            if (Game.map[player.tilePosition.y + tileDirY + 1][player.tilePosition.x + tileDirX].tileType === TILE_TYPE.ENTRY
                || Game.map[player.tilePosition.y + tileDirY - 1][player.tilePosition.x + tileDirX].tileType === TILE_TYPE.ENTRY
                || Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX + 1].tileType === TILE_TYPE.ENTRY
                || Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX - 1].tileType === TILE_TYPE.ENTRY) {
                Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX].tileType = TILE_TYPE.ENTRY;
            } else {
                Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX].tileType = Game.map[player.tilePosition.y][player.tilePosition.x].tileType;
            }
            lightPlayerPosition(player);
            calculateDetectionGraph(Game.map);
            if (tileDirX !== 0) player.bumpX(tileDirX);
            else player.bumpY(tileDirY);
            return true;
        } else return false;
    }
}