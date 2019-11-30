import {Game} from "../game"

export function arraySum(array) {
    return array.reduce((a, b) => a + b, 0)
}

export function copy2dArray(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i].slice();
    }
    return newArray;
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

export function otherPlayer(player) {
    if (player === Game.player) return Game.player2;
    else if (player === Game.player2) return Game.player;
}

export function setTickTimeout(callback, tickTimeout) {
    let counter = 0;
    const timeout = () => {
        counter++;
        if (counter >= tickTimeout) {
            callback();
            Game.APP.ticker.remove(timeout);
        }
    };
    Game.APP.ticker.add(timeout);
    return timeout;
}