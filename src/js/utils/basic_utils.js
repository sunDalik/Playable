export function arraySum(array) {
    return array.reduce((a, b) => a + b, 0);
}

export function copy2dArray(array) {
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i].slice();
    }
    return newArray;
}

export function init2dArray(lengthY, lengthX, value = 0) {
    const array = [];
    for (let i = 0; i < lengthY; i++) {
        array[i] = [];
        for (let j = 0; j < lengthX; j++) {
            array[i][j] = value;
        }
    }
    return array;
}

export function removeObjectFromArray(object, array) {
    const index = array.indexOf(object);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

// if there are multiple copies of said object it removes all of them
export function removeAllObjectsFromArray(object, array) {
    while (array.indexOf(object) !== -1) {
        array.splice(array.indexOf(object), 1);
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

export function regexCount(string, pattern) {
    return (string.match(pattern + "/g") || []).length;
}