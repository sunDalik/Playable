import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {roundToQuarter} from "../../../utils/math_utils";

export class Spear extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["spear.png"];
        this.id = EQUIPMENT_ID.SPEAR;
        this.atk = 0.75;
        this.name = "Spear";
        this.description = "Range 2\nAttack 0.75 at full range\nAttack 0.25 in close combat";
        this.rarity = RARITY.UNIQUE;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX1 = wielder.tilePosition.x + dirX;
        const attackTileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            const atk = wielder.getAtk(this);
            createWeaponAnimationStab(wielder, this, dirX * 2, dirY * 2, 8, 4, 1.1, true);
            createPlayerAttackTile({x: attackTileX2, y: attackTileY2});
            this.damageEnemies([Game.map[attackTileY2][attackTileX2].entity], wielder, atk, dirX, dirY);
            return true;
        } else if (isEnemy(attackTileX1, attackTileY1)) {
            const atk = roundToQuarter(wielder.getAtk(this) / 2);
            createWeaponAnimationStab(wielder, this, dirX, dirY, 10, 5, 1.1, true);
            createPlayerAttackTile({x: attackTileX1, y: attackTileY1});
            this.damageEnemies([Game.map[attackTileY1][attackTileX1].entity], wielder, atk, dirX, dirY);
            return true;
        }

        return false;
    }
}