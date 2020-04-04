import {Game} from "../../../game"
import {ENEMY_TYPE, EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint, statueRightHandPoint} from "../../inanimate_objects/statue";

export class Spear {
    constructor() {
        this.texture = WeaponsSpriteSheet["spear.png"];
        this.type = WEAPON_TYPE.SPEAR;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Spear";
        this.description = "It isn't well suitable for a close-range combat...";
        this.rarity = RARITY.UNIQUE;
    }

    attack(wielder, dirX, dirY) {
        const tileX1 = wielder.tilePosition.x + dirX;
        const tileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(tileX1, tileY1) && isLit(attackTileX2, attackTileY2)) {
            createWeaponAnimationStab(wielder, this, dirX * 2, dirY * 2, 8, 4, 1.1, true);
            createPlayerAttackTile({x: attackTileX2, y: attackTileY2});
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else if (isEnemy(tileX1, tileY1)) {
            const enemy = Game.map[tileY1][tileX1].entity;
            if (enemy.type === ENEMY_TYPE.SPIDER || enemy.type === ENEMY_TYPE.SPIDER_GRAY
                || enemy.type === ENEMY_TYPE.SPIDER_GREEN || enemy.type === ENEMY_TYPE.SPIDER_RED
                || enemy.type === ENEMY_TYPE.ROLLER_RED && dirX !== 0) {
                if (enemy.stun < 2) {
                    createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 4, 60, 1.1, 0, true);
                    createPlayerAttackTile({x: tileX1, y: tileY1}, 8, 0.25);
                    enemy.stun = 2;
                    return true
                }
            }
        }
        return false;
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x + 25,
            y: statueLeftHandPoint.y - 40,
            angle: -70,
            scaleModifier: 0.7,
            mirrorX: true
        };
    }
}