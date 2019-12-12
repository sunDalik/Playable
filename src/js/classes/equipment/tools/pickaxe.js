import {Game} from "../../../game"
import {EQUIPMENT_TYPE, STAGE, TILE_TYPE, TOOL_TYPE, WEAPON_TYPE} from "../../../enums";
import {isAWall, isEnemy} from "../../../map_checks";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {recalculateTileInDetectionGraph} from "../../../map_generation";
import {otherPlayer} from "../../../utils/basic_utils";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Pickaxe {
    constructor() {
        this.texture = Game.resources["src/images/tools/pickaxe.png"].texture;
        this.type = WEAPON_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Pickaxe";
        this.description = "Dig walls";
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createPlayerWeaponAnimation(wielder, attackTileX, attackTileY);
            Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
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
            if (wielder.weapon && wielder.weapon.equipmentType === this.equipmentType && wielder.weapon.type === this.type
                && wielder.secondHand && wielder.secondHand.equipmentType === this.equipmentType && wielder.secondHand.type === this.type) {
                wielder.step(tileDirX, tileDirY);
            } else wielder.bump(tileDirX, tileDirY);
            return true;
        } else return false;
    }
}