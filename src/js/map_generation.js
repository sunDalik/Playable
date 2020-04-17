import {Game} from "./game";
import {ENEMY_TYPE, ROLE, STAGE} from "./enums";
import {randomInt, randomShuffle} from "./utils/random_utils";
import {Bomb} from "./classes/equipment/bag/bomb";
import {SmallHealingPotion} from "./classes/equipment/bag/small_healing_potion";
import {tileInsideTheBossRoom} from "./map_checks";
import {RustySword} from "./classes/equipment/weapons/rusty_sword";

//todo change purpose of this file
export function assignDrops() {
    distributeDrops(Bomb, randomInt(4, 5));
    distributeDrops(SmallHealingPotion, randomInt(1, 2));

    if (Game.stage === STAGE.RUINS) {
        if (Math.random() < 0.5) {
            distributeDrops(RustySword, 1, ENEMY_TYPE.LIZARD_WARRIOR);
        }
    }
}

function distributeDrops(dropConstructor, amount, enemyType = undefined) {
    randomShuffle(Game.enemies);
    let enemyIndex = 0;
    while (amount > 0) {
        if (enemyIndex >= Game.enemies.length) {
            if (Game.boss) {
                Game.boss.drops.push(new dropConstructor());
                amount--;
            } else break;
        } else {
            const enemy = Game.enemies[enemyIndex];
            if (enemy.drop !== null
                || enemy.boss
                || enemy.role === ROLE.WALL_TRAP
                || enemy.type === ENEMY_TYPE.MUSHROOM
                || enemy.type === ENEMY_TYPE.RABBIT && enemy.predator
                || tileInsideTheBossRoom(enemy.tilePosition.x, enemy.tilePosition.y)
                || (enemyType !== undefined && enemy.type !== enemyType)) {
                enemyIndex++;
            } else {
                enemy.drop = new dropConstructor();
                enemy.energyDrop = 0;
                amount--;
                enemyIndex++;
            }
        }
    }
}