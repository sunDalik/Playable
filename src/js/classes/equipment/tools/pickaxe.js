import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isDiggable, isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub} from "../../../animations";
import {ToolsSpriteSheet} from "../../../loader";

export class Pickaxe {
    constructor() {
        this.texture = ToolsSpriteSheet["pickaxe.png"];
        this.type = WEAPON_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Pickaxe";
        this.description = "Dig walls";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        const attackTile = {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + dirY};
        if (isEnemy(attackTile.x, attackTile.y)) {
            const atk = wielder.getAtkWithWeapon(this);
            createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 3, 90, 1);
            createPlayerAttackTile(attackTile);
            Game.map[attackTile.y][attackTile.x].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else return false;
    }

    use(wielder, dirX, dirY) {
        const digTile = {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + dirY};
        if (isDiggable(digTile.x, digTile.y)) {
            Game.world.removeTile(digTile.x, digTile.y, wielder);
            if (wielder.weapon && wielder.weapon.equipmentType === this.equipmentType && wielder.weapon.type === this.type
                && wielder.secondHand && wielder.secondHand.equipmentType === this.equipmentType && wielder.secondHand.type === this.type) {
                createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 3, 90, 1, 0.5);
                wielder.step(dirX, dirY);
            } else {
                createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 3, 90, 1);
            }
            createPlayerAttackTile(digTile);
            return true;
        } else return false;
    }
}