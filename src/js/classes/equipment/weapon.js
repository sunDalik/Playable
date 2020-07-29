import {Equipment} from "./equipment";
import {EQUIPMENT_ID, EQUIPMENT_TYPE, SLOT} from "../../enums/enums";
import {DAMAGE_TYPE} from "../../enums/damage_type";
import {ENCHANTMENT_TYPE} from "../../enums/enchantments";
import {get8Directions} from "../../utils/map_utils";
import {isEnemy} from "../../map_checks";
import {Game} from "../../game";
import {createPlayerAttackTile, createSmallOffsetParticle} from "../../animations";
import {EffectsSpriteSheet} from "../../loader";

export class Weapon extends Equipment {
    constructor() {
        super();
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
    }

    attack(wielder, tileDirX, tileDirY) {}

    // atkDict = [{enemy: enemy, atk: atk}]
    damageEnemies(enemies, wielder, atk, dirX, dirY, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON, atkDict = undefined) {
        const enemyTiles = enemies.map(enemy => {
            return {x: enemy.tilePosition.x, y: enemy.tilePosition.y};
        });
        for (const enemy of enemies) {
            let actualAtk = atk;
            if (atkDict) {
                const entry = atkDict.find(entry => entry && entry.enemy === enemy);
                if (entry) actualAtk = entry.atk;
            }
            enemy.damage(wielder, actualAtk, dirX, dirY, damageType);

            // flask of fire damage
            if (wielder[SLOT.ACCESSORY] && wielder[SLOT.ACCESSORY].id === EQUIPMENT_ID.FLASK_OF_FIRE) {
                wielder[SLOT.ACCESSORY].onEnemyDamage(wielder, enemy, damageType);
            }
        }

        // divine damage spread
        if (this.enchantment === ENCHANTMENT_TYPE.DIVINE) {
            const undivineableEnemies = enemies.slice();
            for (const tile of enemyTiles) {
                for (const dir of get8Directions()) {
                    if (isEnemy(tile.x + dir.x, tile.y + dir.y)) {
                        const enemy = Game.map[tile.y + dir.y][tile.x + dir.x].entity;
                        if (undivineableEnemies.includes(enemy)) continue;
                        createPlayerAttackTile(enemy.tilePosition);
                        createSmallOffsetParticle(EffectsSpriteSheet["divine_effect.png"], enemy.tilePosition, -1);
                        createSmallOffsetParticle(EffectsSpriteSheet["divine_effect.png"], enemy.tilePosition, 1);
                        enemy.damage(wielder, 1, 0, 0, DAMAGE_TYPE.DIVINE);
                        undivineableEnemies.push(enemy);
                    }
                }
            }
        }

        if (this.enchantment === ENCHANTMENT_TYPE.NIGHTMARE) {

        }
    }
}