import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";

export class Rapier {
    constructor() {
        this.texture = Game.resources["src/images/weapons/sword.png"].texture; //todo: rename to rapier :^)
        this.type = WEAPON_TYPE.RAPIER;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
        this.name = "Rapier";
        this.description = "2-range weapon";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX1 = wielder.tilePosition.x + dirX;
        const attackTileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX1, attackTileY1)) {
            createWeaponAnimationStab(wielder, this, dirX, dirY, 6, 5, 1.2);
            createPlayerAttackTile({x: attackTileX1, y: attackTileY1});
            Game.map[attackTileY1][attackTileX1].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else if (isEnemy(attackTileX2, attackTileY2) && isNotAWall(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            createWeaponAnimationStab(wielder, this, dirX * 2, dirY * 2, 6, 5, 1.2);
            createPlayerAttackTile({x: attackTileX2, y: attackTileY2});
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else return false;
    }
}