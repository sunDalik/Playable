import * as PIXI from "pixi.js";
import {HUDSpriteSheet} from "../loader";

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
            return HUDSpriteSheet["heart_full.png"];
        case 0.75:
            return HUDSpriteSheet["heart_75.png"];
        case 0.5:
            return HUDSpriteSheet["heart_half.png"];
        case 0.25:
            return HUDSpriteSheet["heart_25.png"];
        case 0:
            return HUDSpriteSheet["heart_empty.png"];
        default:
            return PIXI.Texture.WHITE;
    }
}

export function removeAllChildrenFromContainer(container, destroy = false) {
    for (let i = container.children.length - 1; i >= 0; i--) {
        const child = container.children[i];
        container.removeChild(child);
        if (destroy) child.destroy();
    }
}