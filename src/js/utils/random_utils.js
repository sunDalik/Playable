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
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

// random: [min; max)
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function getRandomValue(obj) {
    return obj[randomChoice(Object.keys(obj))];
}

// list = [{weight: n, item: x}...]
// weights are positive integers
export function weightedRandomChoice(list) {
    let weightSum = 0;
    for (let i = 0; i < list.length; i++) {
        weightSum += list[i].weight;
    }
    let random = randomInt(0, weightSum - 1);
    for (let i = 0; i < list.length; i++) {
        if (random < list[i].weight)
            return list[i].item;
        random -= list[i].weight;
    }
}