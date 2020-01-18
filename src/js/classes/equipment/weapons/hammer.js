import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Hammer {
    constructor() {
        this.texture = Game.resources["src/images/weapons/hammer.png"].texture;
        this.type = WEAPON_TYPE.HAMMER;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
        this.name = "Hammer";
        this.description = "Stuns enemies";
        this.rarity = RARITY.C;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createHammerAnimation();
            const enemy = Game.map[attackTileY][attackTileX].entity;
            enemy.damage(wielder, atk, tileDirX, tileDirY, false);
            enemy.stun += 1;
            return true;
        } else return false;

        function createHammerAnimation() {
            createPlayerWeaponAnimation(wielder, attackTileX, attackTileY);
        }
    }
}