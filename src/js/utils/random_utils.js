import {Game} from "../game";
import {removeItemFromPool} from "../game_changer";
import {Bomb} from "../classes/equipment/bag/bomb";
import {RARITY} from "../enums";

//modifies the array
export function randomShuffle(array) {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        let temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array;
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function randomChoiceSeveral(array, n) {
    const arrayCopy = array.slice();
    if (n >= array.length) return arrayCopy;
    const choices = [];
    randomShuffle(arrayCopy);
    for (let i = 0; i < n; i++) {
        choices.push(arrayCopy[i]);
    }
    return choices;
}

export function randomArrayIndex(array) {
    return Math.floor(Math.random() * array.length);
}

// random: [min; max]
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function getRandomValue(obj) {
    return obj[randomChoice(Object.keys(obj))];
}

export function getRandomWeapon() {
    if (Game.weaponPool.length === 0) return null;
    const constructor = getItemFromPoolByRarity(Game.weaponPool);
    return new constructor();
}

export function getRandomSpell() {
    if (Game.magicPool.length === 0) return null;
    const constructor = getItemFromPoolByRarity(Game.magicPool);
    return new constructor();
}

export function getRandomChestDrop() {
    if (Game.chestItemPool.length === 0) return new Bomb();
    const constructor = getItemFromPoolByRarity(Game.chestItemPool);
    const item = new constructor();
    removeItemFromPool(item, Game.chestItemPool);
    return item;
}

//pool consists of constructors!
function getItemFromPoolByRarity(pool) {
    if (pool.length === 0) return null;
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