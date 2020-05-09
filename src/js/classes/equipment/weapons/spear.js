import {Game} from "../../../game";
import {RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";
import {Weapon} from "../weapon";

export class Spear extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["spear.png"];
        this.type = WEAPON_TYPE.SPEAR;
        this.atk = 0.75;
        this.name = "Spear";
        this.description = "It isn't well suitable for a close-range combat...";
        this.rarity = RARITY.UNIQUE;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX1 = wielder.tilePosition.x + dirX;
        const attackTileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            createWeaponAnimationStab(wielder, this, dirX * 2, dirY * 2, 8, 4, 1.1, true);
            createPlayerAttackTile({x: attackTileX2, y: attackTileY2});
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else if (isEnemy(attackTileX1, attackTileY1)) {
            createWeaponAnimationStab(wielder, this, dirX, dirY, 10, 5, 1.1, true);
            createPlayerAttackTile({x: attackTileX1, y: attackTileY1});
            Game.map[attackTileY1][attackTileX1].entity.damage(wielder, 0.25, dirX, dirY, false);
            return true;
        }

        return false;
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x - 55,
            y: statueLeftHandPoint.y + 40,
            angle: -70,
            scaleModifier: 0.85,
            mirrorX: true
        };
    }
}