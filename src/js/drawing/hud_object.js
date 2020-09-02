import * as PIXI from "pixi.js";
import {SLOT} from "../enums/enums";

export const HUD = new PIXI.Container();
HUD.interactiveChildren = false;
HUD.filters = [];
HUD.zIndex = 2;
HUD.hearts1 = new PIXI.Container();
HUD.hearts2 = new PIXI.Container();
HUD.movementGuide = new PIXI.Container();
HUD.interactionGuide = new PIXI.Container();
HUD.stats1 = new PIXI.Container();
HUD.stats2 = new PIXI.Container();
HUD.slots1 = generateSlotsContainer();
HUD.slots2 = generateSlotsContainer();
HUD.fps = new PIXI.Container();
HUD.keysAmount = new PIXI.Container();
HUD.speedrunTime = new PIXI.Container();
HUD.other = new PIXI.Container();
HUD.other.zIndex = -1;

HUD.bossHealth = new PIXI.Container();
HUD.bossHealth.zIndex = 1;

HUD.minimap = new PIXI.Container();
HUD.minimapBG = new PIXI.Graphics();
HUD.minimap.zIndex = -1;
HUD.minimapBG.zIndex = -1;
HUD.addChild(HUD.minimapBG);
HUD.minimap.sortableChildren = true;

HUD.addChild(HUD.hearts1);
HUD.addChild(HUD.hearts2);
HUD.addChild(HUD.slots1);
HUD.addChild(HUD.slots2);
HUD.addChild(HUD.movementGuide);
HUD.addChild(HUD.interactionGuide);
HUD.addChild(HUD.stats1);
HUD.addChild(HUD.stats2);
HUD.addChild(HUD.fps);
HUD.addChild(HUD.minimap);
HUD.addChild(HUD.other);
HUD.addChild(HUD.bossHealth);
HUD.addChild(HUD.speedrunTime);
HUD.addChild(HUD.keysAmount);

HUD.sortableChildren = true;
HUD.interactionGuide.sortableChildren = true;

function generateSlotsContainer() {
    const container = new PIXI.Container();
    for (const slot of Object.values(SLOT)) {
        container[slot] = {}; //maybe should make it container too? dunno
        container[slot].invisible = slot === SLOT.BAG; //invisible slots don't appear on screen if there is no item
        // should it be changed to PIXI.Sprite?
        container[slot].sprite = new PIXI.Container();
        container[slot].slot = new PIXI.Container();
        container[slot].meta = new PIXI.Container();
        container.addChild(container[slot].sprite, container[slot].slot, container[slot].meta);
        container[slot].cancelAnimation = () => {};
    }
    return container;
}

export function movePlayerHudToContainer(container) {
    container.addChild(HUD.other);
    container.addChild(HUD.hearts1);
    container.addChild(HUD.slots1);
    container.addChild(HUD.hearts2);
    container.addChild(HUD.slots2);
    container.addChild(HUD.stats1);
    container.addChild(HUD.stats2);
    //container.addChild(HUD.speedrunTime);
    //container.addChild(HUD.keysAmount);
}