import * as PIXI from "pixi.js"

export const HUD = new PIXI.Container();
HUD.hearts1 = new PIXI.Container();
HUD.hearts2 = new PIXI.Container();
HUD.slots1 = new PIXI.Container();
HUD.slots2 = new PIXI.Container();
HUD.movementGuide = new PIXI.Container();
HUD.interactionGuide = new PIXI.Container();
HUD.stats1 = new PIXI.Container();
HUD.stats2 = new PIXI.Container();
HUD.slots1Contents = generateSlotsContentsContainer();
HUD.slots2Contents = generateSlotsContentsContainer();
HUD.energy = new PIXI.Container();

HUD.minimap = new PIXI.Container();
HUD.minimap.bg = new PIXI.Graphics();
HUD.minimap.bg.beginFill(0x000000, 0.2);
HUD.minimap.bg.drawRect(0, 0, 1, 1);
HUD.minimap.addChild(HUD.minimap.bg);

HUD.addChild(HUD.hearts1);
HUD.addChild(HUD.hearts2);
HUD.addChild(HUD.slots1);
HUD.addChild(HUD.slots2);
HUD.addChild(HUD.movementGuide);
HUD.addChild(HUD.interactionGuide);
HUD.addChild(HUD.stats1);
HUD.addChild(HUD.stats2);
HUD.addChild(HUD.energy);
HUD.addChild(HUD.minimap);

const keys = Object.keys(HUD.slots1Contents);
for (let i = 0; i < keys.length; i++) {
    HUD.addChild(HUD.slots1Contents[keys[i]].meta);
    HUD.addChild(HUD.slots1Contents[keys[i]].sprite);
    HUD.addChild(HUD.slots2Contents[keys[i]].meta);
    HUD.addChild(HUD.slots2Contents[keys[i]].sprite);
}

HUD.sortableChildren = true;
HUD.interactionGuide.sortableChildren = true;

function generateSlotsContentsContainer() {
    const container = {
        weapon: {},
        secondHand: {},
        headwear: {},
        armor: {},
        footwear: {},
        magic1: {},
        magic2: {},
        magic3: {},
        magic4: {}
    };
    const keys = Object.keys(container);
    for (let i = 0; i < keys.length; i++) {
        container[keys[i]].meta = new PIXI.Container();
        container[keys[i]].sprite = new PIXI.Container();
        container[keys[i]].sprite.zIndex = -1;
    }

    return container;
}