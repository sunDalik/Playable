import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isDiggable, isEnemy} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Pickaxe {
    constructor() {
        this.texture = Game.resources["src/images/tools/pickaxe.png"].texture;
        this.type = WEAPON_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Pickaxe";
        this.description = "Dig walls";
        this.rarity = RARITY.B;
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
        if (isDiggable(wielder.tilePosition.x + tileDirX, wielder.tilePosition.y + tileDirY)) {
            Game.world.removeTile(wielder.tilePosition.x + tileDirX, wielder.tilePosition.y + tileDirY, wielder);
            if (wielder.weapon && wielder.weapon.equipmentType === this.equipmentType && wielder.weapon.type === this.type
                && wielder.secondHand && wielder.secondHand.equipmentType === this.equipmentType && wielder.secondHand.type === this.type) {
                wielder.step(tileDirX, tileDirY);
            } else wielder.bump(tileDirX, tileDirY);
            return true;
        } else return false;
    }
}