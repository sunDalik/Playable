import {Game} from "../game";
import {removeObjectFromArray} from "./basic_utils";
import {removeItemFromPool} from "../game_changer";

export function randomShuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function randomArrayIndex(array) {
    return Math.floor(Math.random() * array.length);
}

// random: [min; max)
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function getRandomValue(obj) {
    const keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
}

export function getRandomWeapon() {
    if (Game.weaponPool.length === 0) return null;
    const randomConstructor = randomChoice(Game.weaponPool);
    return new randomConstructor();
}

//todo implement rarity system
export function getRandomSpell() {
    if (Game.magicPool.length === 0) return null;
    const randomConstructor = randomChoice(Game.magicPool);
    return new randomConstructor();
}

//todo implement rarity system
export function getRandomChestDrop() {
    if (Game.chestItemPool.length === 0) return null;
    const randomConstructor = randomChoice(Game.chestItemPool);
    const item = new randomConstructor();
    removeItemFromPool(item, Game.chestItemPool);
    return item;
}