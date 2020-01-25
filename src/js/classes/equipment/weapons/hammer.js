import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub} from "../../../animations";

export class Hammer {
    constructor() {
        this.texture = Game.resources["src/images/weapons/hammer.png"].texture;
        this.type = WEAPON_TYPE.HAMMER;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Hammer";
        this.description = "Stuns enemies";
        this.rarity = RARITY.C;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX = wielder.tilePosition.x + dirX;
        const attackTileY = wielder.tilePosition.y + dirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createWeaponAnimationClub(wielder, this, dirX, dirY, 6, 5, 90, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            const enemy = Game.map[attackTileY][attackTileX].entity;
            enemy.damage(wielder, atk, dirX, dirY, false);
            enemy.stun++;
            return true;
        } else return false;
    }
}