import {Game} from "../game";

export function getHealthArray(entity) {
    const health = [];
    for (let i = 0; i < entity.maxHealth; ++i) {
        if (i === Math.trunc(entity.health) && entity.health > 0) {
            health[i] = Number((entity.health - Math.trunc(entity.health)).toFixed(2));
        } else {
            if (i + 1 <= entity.health) {
                health[i] = 1;
            } else {
                health[i] = 0;
            }
        }
    }
    return health;
}

export function getHeartTexture(heartValue) {
    switch (heartValue) {
        case 1:
            return Game.resources["src/images/HUD/heart_full.png"].texture;
        case 0.75:
            return Game.resources["src/images/HUD/heart_75.png"].texture;
        case 0.5:
            return Game.resources["src/images/HUD/heart_half.png"].texture;
        case 0.25:
            return Game.resources["src/images/HUD/heart_25.png"].texture;
        case 0:
            return Game.resources["src/images/HUD/heart_empty.png"].texture;
        default:
            return Game.resources["src/images/void.png"].texture;
    }
}

export function removeAllChildrenFromContainer(container) {
    for (let i = container.children.length - 1; i >= 0; i--) {
        container.removeChild(container.children[i]);
    }
}