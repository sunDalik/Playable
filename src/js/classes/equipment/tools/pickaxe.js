import {Game} from "../../../game"
import {EQUIPMENT_TYPE, STAGE, TILE_TYPE, TOOL_TYPE} from "../../../enums";
import {isAWall} from "../../../map_checks";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {recalculateTileInDetectionGraph} from "../../../map_generation";
import {otherPlayer} from "../../../utils/basic_utils";

export class Pickaxe {
    constructor() {
        this.texture = Game.resources["src/images/tools/pickaxe.png"].texture;
        this.type = TOOL_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
    }

    use(player, tileDirX, tileDirY) {
        if (isAWall(player.tilePosition.x + tileDirX, player.tilePosition.y + tileDirY)) {
            Game.world.removeTile(Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX].tile);
            Game.map[player.tilePosition.y + tileDirY][player.tilePosition.x + tileDirX].tileType = TILE_TYPE.NONE;
            if (Game.stage === STAGE.DARK_TUNNEL) {
                lightPlayerPosition(player);
                lightPlayerPosition(otherPlayer(player));
            } else lightPlayerPosition(player);
            recalculateTileInDetectionGraph(player.tilePosition.x + tileDirX, player.tilePosition.y + tileDirY);
            player.bump(tileDirX, tileDirY);
            return true;
        } else return false;
    }
}