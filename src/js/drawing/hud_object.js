import * as PIXI from "pixi.js"
import {redrawSlotContents} from "./draw_hud";

export const HUD = new PIXI.Container();
HUD.hearts1 = new PIXI.Container();
HUD.hearts2 = new PIXI.Container();
HUD.slots1 = new PIXI.Container();
HUD.slots2 = new PIXI.Container();
HUD.guide = new PIXI.Container();
HUD.stats1 = new PIXI.Container();
HUD.stats2 = new PIXI.Container();
HUD.slots1Contents = generateSlotsContentsContainer();
HUD.slots2Contents = generateSlotsContentsContainer();
HUD.energy = new PIXI.Container();

HUD.addChild(HUD.hearts1);
HUD.addChild(HUD.hearts2);
HUD.addChild(HUD.slots1);
HUD.addChild(HUD.slots2);
HUD.addChild(HUD.guide);
HUD.addChild(HUD.stats1);
HUD.addChild(HUD.stats2);
HUD.addChild(HUD.energy);

const keys = Object.keys(HUD.slots1Contents);
for (let i = 0; i < keys.length; i++) {
    HUD.addChild(HUD.slots1Contents[keys[i]].meta);
    HUD.addChild(HUD.slots1Contents[keys[i]].sprite);
    HUD.addChild(HUD.slots2Contents[keys[i]].meta);
    HUD.addChild(HUD.slots2Contents[keys[i]].sprite);
}

HUD.sortableChildren = true;

function generateSlotsContentsContainer() {
    const container = {
        weapon: new PIXI.Container(),
        secondHand: new PIXI.Container(),
        headwear: new PIXI.Container(),
        armor: new PIXI.Container(),
        footwear: new PIXI.Container(),
        magic1: new PIXI.Container(),
        magic2: new PIXI.Container(),
        magic3: new PIXI.Container(),
        magic4: new PIXI.Container()
    };
    const keys = Object.keys(container);
    for (let i = 0; i < keys.length; i++) {
        container[keys[i]].meta = new PIXI.Container();
        container[keys[i]].sprite = new PIXI.Container();
        container[keys[i]].sprite.zIndex = -1;
    }

    return container;
}