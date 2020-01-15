import {Game} from "../../../game"
import {ENEMY_TYPE, EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class Spear {
    constructor() {
        this.texture = Game.resources["src/images/weapons/spear.png"].texture;
        this.type = WEAPON_TYPE.SPEAR;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Spear";
        this.description = "It isn't well suitable for a close-range combat...";
    }

    attack(wielder, dirX, dirY) {
        const tileX1 = wielder.tilePosition.x + dirX;
        const tileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(tileX1, tileY1) && isLit(attackTileX2, attackTileY2)) {
            createPlayerWeaponAnimation(wielder, attackTileX2, attackTileY2, Game.TILESIZE / 4);
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else if (isEnemy(tileX1, tileY1)) {
            const enemy = Game.map[tileY1][tileX1].entity;
            if (enemy.type === ENEMY_TYPE.SPIDER || enemy.type === ENEMY_TYPE.SPIDER_GRAY
                || enemy.type === ENEMY_TYPE.SPIDER_GREEN || enemy.type === ENEMY_TYPE.SPIDER_RED
                || enemy.type === ENEMY_TYPE.ROLLER_RED && dirX !== 0) {
                if (enemy.stun < 2) {
                    createPlayerWeaponAnimation(wielder, tileX1, tileY1, Game.TILESIZE / 3);
                    enemy.stun = 2;
                    return true
                }
            }
        }
        return false;
    }
}