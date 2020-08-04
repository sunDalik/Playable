import {Game} from "./game";
import {ENEMY_QUIRK, ENEMY_TYPE, ROLE, STAGE} from "./enums/enums";
import {randomChoice, randomInt, randomShuffle} from "./utils/random_utils";
import {Bomb} from "./classes/equipment/bag/bomb";
import {HealingPotion} from "./classes/equipment/bag/healing_potion";
import {tileInsideTheBossRoom} from "./map_checks";
import {RustySword} from "./classes/equipment/weapons/rusty_sword";
import {Key} from "./classes/equipment/key";
import {keysOnEnemies} from "./level_generation/standard_generation";
import {RerollPotion} from "./classes/equipment/bag/reroll_potion";

//todo change purpose of this file
export function assignDrops() {
    distributeDrops(Key, keysOnEnemies);
    distributeDrops(Bomb, randomInt(4, 5));
    distributeDrops(HealingPotion, randomInt(2, 3));
    if (Math.random() < 0.15) distributeDrops(RerollPotion, 1);

    if (Game.stage === STAGE.RUINS) {
        if (Math.random() < 0.5) {
            distributeDrops(RustySword, 1, ENEMY_TYPE.LIZARD_WARRIOR);
        }
    }

    // assign quirks
    for (const enemy of Game.enemies) {
        if (Math.random() < 0.009 && !enemy.boss && enemy.role === ROLE.ENEMY) {
            enemy.setQuirk(randomChoice([ENEMY_QUIRK.TINY, ENEMY_QUIRK.GIANT]));
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
                || enemy.type === ENEMY_TYPE.RABBIT && enemy.predator
                || tileInsideTheBossRoom(enemy.tilePosition.x, enemy.tilePosition.y)
                || (enemyType !== undefined && enemy.type !== enemyType)) {
                enemyIndex++;
            } else {
                enemy.drop = new dropConstructor();
                amount--;
                enemyIndex++;
            }
        }
    }
}