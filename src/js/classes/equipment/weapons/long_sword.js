import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";

export class LongSword extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["long_sword.png"];
        this.id = EQUIPMENT_ID.LONG_SWORD;
        this.atk = 1;
        this.name = "Long Sword";
        this.description = "Range 2\nAttack 1";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX1 = wielder.tilePosition.x + dirX;
        const attackTileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        const atk = wielder.getAtk(this);
        if (isEnemy(attackTileX1, attackTileY1)) {
            createWeaponAnimationStab(wielder, this, dirX, dirY, 6, 5, 1.2);
            createPlayerAttackTile({x: attackTileX1, y: attackTileY1});
            this.damageEnemies([Game.map[attackTileY1][attackTileX1].entity], wielder, atk, dirX, dirY);
            return true;
        } else if (isEnemy(attackTileX2, attackTileY2) && isNotAWall(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            createWeaponAnimationStab(wielder, this, dirX * 2, dirY * 2, 6, 5, 1.2);
            createPlayerAttackTile({x: attackTileX2, y: attackTileY2});
            this.damageEnemies([Game.map[attackTileY2][attackTileX2].entity], wielder, atk, dirX, dirY);
            return true;
        } else return false;
    }
}