import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";

export class Hammer extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["hammer.png"];
        this.id = EQUIPMENT_ID.HAMMER;
        this.atk = 0.75;
        this.name = "Hammer";
        this.description = "Attack 0.75\nApplies stun";
        this.rarity = RARITY.C;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX = wielder.tilePosition.x + dirX;
        const attackTileY = wielder.tilePosition.y + dirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtk(this);
            createWeaponAnimationClub(wielder, this, dirX, dirY, 6, 5, 90, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            const enemy = Game.map[attackTileY][attackTileX].entity;
            enemy.addStun(1);
            enemy.damage(wielder, atk, dirX, dirY);
            return true;
        } else return false;
    }
}