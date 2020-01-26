import {Game} from "../game";
import {Bomb} from "../classes/equipment/bag/bomb";
import {removeItemFromPool} from "../game_changer";
import {RARITY} from "../enums";
import {randomChoice, randomShuffle} from "./random_utils";

export function getRandomWeapon() {
    if (Game.weaponPool.length === 0) return null;
    const constructor = getItemFromPool(Game.weaponPool);
    return new constructor();
}

export function getRandomSpell() {
    if (Game.magicPool.length === 0) return null;
    const constructor = getItemFromPool(Game.magicPool);
    return new constructor();
}

export function getRandomChestDrop() {
    if (Game.chestItemPool.length === 0) return new Bomb();
    const constructor = getItemFromPool(Game.chestItemPool);
    const item = new constructor();
    removeItemFromPool(item, Game.chestItemPool);
    return item;
}

/**
 * Returns random item from the pool considering current rarity distribution
 * @param pool {Class[]}
 * @returns {null|Class}
 */
function getItemFromPool(pool) {
    if (pool.length === 0) return null;
    randomShuffle(pool);
    let attempt = 0;
    let item = null;
    while (attempt++ < 200 && item === null) {
        const rand = Math.random() * 100;
        for (const rarity of [RARITY.C, RARITY.B, RARITY.A, RARITY.S]) {
            if (rand >= rarity.chanceFrom && rand <= rarity.chanceTo) {
                const filteredPool = pool.filter(item => (new item()).rarity === rarity);
                if (filteredPool.length !== 0) item = randomChoice(filteredPool);
                break;
            }
        }
    }
    if (item === null) return randomChoice(pool);
    else return item;
}