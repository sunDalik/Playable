import {Game} from "./game"

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

export function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

export function arraySum(array) {
    return array.reduce((a, b) => a + b, 0)
}

export function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

}

//stolen
export function randomShuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export function copy2dArray(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i].slice();
    }
    return newArray;
}

export function getRandomValue(obj) {
    const keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
}

export function getRandomWeapon() {
    if (Game.weaponPool.length === 0) return null;
    return randomChoice(Game.weaponPool);
}

//todo implement rarity system
export function getRandomSpell() {
    if (Game.magicPool.length === 0) return null;
    return randomChoice(Game.magicPool);
}

//todo implement rarity system
export function getRandomChestDrop() {
    if (Game.chestItemPool.length === 0) return null;
    const item = randomChoice(Game.chestItemPool);
    removeObjectFromArray(item, Game.chestItemPool);
    return item;
}

export function removeAllChildrenFromContainer(container) {
    for (let i = container.children.length - 1; i >= 0; i--) {
        container.removeChild(container.children[i]);
    }
}

export function removeObjectFromArray(object, array) {
    const index = array.indexOf(object);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

export function decrementEachDigitInHex(hex) {
    const hexString = hex.toString(16);
    let newHex = "";
    for (let i = 0; i < hexString.length; i++) {
        if (hexString[i] === "0") newHex += "0";
        else newHex += (parseInt(hexString[i], 16) - 1).toString(16);
    }
    return parseInt(newHex, 16);
}