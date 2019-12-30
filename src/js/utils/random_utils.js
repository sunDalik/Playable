import {Game} from "../game";
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

// random: [min; max)
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function getRandomValue(obj) {
    return obj[randomChoice(Object.keys(obj))];
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