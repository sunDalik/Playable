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

    use(wielder, tileDirX, tileDirY) {
        if (isAWall(wielder.tilePosition.x + tileDirX, wielder.tilePosition.y + tileDirY)) {
            Game.world.removeTile(Game.map[wielder.tilePosition.y + tileDirY][wielder.tilePosition.x + tileDirX].tile);
            Game.map[wielder.tilePosition.y + tileDirY][wielder.tilePosition.x + tileDirX].tileType = TILE_TYPE.NONE;
            if (Game.stage === STAGE.DARK_TUNNEL) {
                if (wielder.secondHand && wielder.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && wielder.secondHand.type === TOOL_TYPE.TORCH) {
                    lightPlayerPosition(wielder);
                } else if (!otherPlayer(wielder).dead && otherPlayer(wielder).secondHand && otherPlayer(wielder).secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && otherPlayer(wielder).secondHand.type === TOOL_TYPE.TORCH) {
                    lightPlayerPosition(otherPlayer(wielder));
                } else lightPlayerPosition(wielder)
            } else lightPlayerPosition(wielder);
            recalculateTileInDetectionGraph(wielder.tilePosition.x + tileDirX, wielder.tilePosition.y + tileDirY);
            wielder.bump(tileDirX, tileDirY);
            return true;
        } else return false;
    }
}