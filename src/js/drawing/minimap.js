import {Game} from "../game";
import {HUD} from "./hud_object";
import {
    HUDKeyBindSize,
    HUDKeyBindTextStyle,
    miniMapBottomOffset,
    miniMapPixelSize,
    slotBorderOffsetX
} from "./draw_constants";
import * as PIXI from "pixi.js";
import {INANIMATE_TYPE, ROLE, TILE_TYPE} from "../enums";
import {camera} from "../classes/game/camera";

let mapCollapsed = true;
let mapMask = new PIXI.Graphics();
const miniMapCollapsedWidth = 110;
const miniMapCollapsedHeight = 110;
const outlineWidth = 3;
const bottomOffset = miniMapBottomOffset;
let keyBind = null;

export function drawMiniMap() {
    if (keyBind === null) keyBind = initKeyBind();
    cleanMiniMap();
    for (let i = 0; i < Game.map.length; i++) {
        Game.minimap[i] = [];
        for (let j = 0; j < Game.map[0].length; j++) {
            redrawMiniMapPixel(j, i);
        }
    }

    collapseMiniMap();
}

function cleanMiniMap() {
    for (let i = 0; i < Game.minimap.length; i++) {
        for (let j = 0; j < Game.minimap[0].length; j++) {
            HUD.minimap.removeChild(Game.minimap[i][j]);
        }
    }
    Game.minimap = [];
}

export function redrawMiniMapPixel(x, y) {
    if (Game.minimap[y][x]) {
        HUD.minimap.removeChild(Game.minimap[y][x]);
    }
    const pixel = new PIXI.Graphics();
    if (Game.map[y][x].tileType === TILE_TYPE.WALL) {
        pixel.beginFill(0x7a5916);
    } else if (Game.map[y][x].tileType === TILE_TYPE.SUPER_WALL) {
        pixel.beginFill(0x757167);
    } else if (Game.map[y][x].tileType === TILE_TYPE.VOID) {
        pixel.beginFill(0x000000);
    } else if (Game.map[y][x].entity && Game.map[y][x].entity.role === ROLE.INANIMATE
        && Game.map[y][x].entity.type !== INANIMATE_TYPE.GRAIL
        && Game.map[y][x].entity.type !== INANIMATE_TYPE.FIRE_GOBLET) {
        pixel.beginFill(0xffb03b);
    } else if (Game.map[y][x].tileType === TILE_TYPE.EXIT) {
        pixel.beginFill(0xff4adb);
    } else if (Game.map[y][x].entity === Game.player || Game.map[y][x].entity === Game.player2) {
        pixel.beginFill(0x0000ff);
    } else pixel.beginFill(0xffffff);
    pixel.drawRect(miniMapPixelSize * x, miniMapPixelSize * y, miniMapPixelSize, miniMapPixelSize);
    HUD.minimap.addChild(pixel);
    Game.minimap[y][x] = pixel;
    if (!Game.map[y][x].lit) {
        pixel.visible = false;
    }
}

export function toggleMiniMap() {
    if (mapCollapsed) expandMiniMap();
    else collapseMiniMap();
}

export function collapseMiniMap() {
    mapCollapsed = true;
    HUD.minimap.scale.set(1, 1);
    HUD.removeChild(mapMask);
    mapMask = new PIXI.Graphics();
    const mapMaskX = Game.app.renderer.screen.width - miniMapCollapsedWidth - slotBorderOffsetX - outlineWidth / 2;
    const mapMaskY = Game.app.renderer.screen.height - miniMapCollapsedHeight - bottomOffset - outlineWidth / 2;
    mapMask.beginFill(0xFFFFFF);
    mapMask.drawRect(mapMaskX, mapMaskY, miniMapCollapsedWidth, miniMapCollapsedHeight);
    mapMask.endFill();
    HUD.addChild(mapMask);
    HUD.minimap.mask = mapMask;

    redrawMiniMapBG(mapMaskX + outlineWidth / 2, mapMaskY + outlineWidth / 2, miniMapCollapsedWidth, miniMapCollapsedHeight);
    HUD.minimapBG.zIndex = -2;
    HUD.minimap.zIndex = -1;

    keyBind.position.set(Game.app.renderer.screen.width - slotBorderOffsetX - outlineWidth / 2 - keyBind.width,
        Game.app.renderer.screen.height - miniMapCollapsedHeight - bottomOffset);

    centerMiniMap();
}

export function expandMiniMap() {
    mapCollapsed = false;
    HUD.removeChild(mapMask);
    HUD.minimap.mask = null;

    HUD.minimap.scale.set(1.6, 1.6);
    redrawMiniMapBG(Game.app.renderer.screen.width - getMiniMapWidth() - slotBorderOffsetX,
        Game.app.renderer.screen.height - getMiniMapHeight() - bottomOffset, getMiniMapWidth(), getMiniMapHeight());
    HUD.minimapBG.zIndex = 1;
    HUD.minimap.zIndex = 2;
    HUD.minimap.position.set(Game.app.renderer.screen.width - getMiniMapWidth() - slotBorderOffsetX - outlineWidth / 2,
        Game.app.renderer.screen.height - getMiniMapHeight() - bottomOffset - outlineWidth / 2);

    keyBind.position.set(Game.app.renderer.screen.width - slotBorderOffsetX - outlineWidth / 2 - keyBind.width,
        Game.app.renderer.screen.height - getMiniMapHeight() - bottomOffset);
}

function redrawMiniMapBG(x, y, width, height) {
    HUD.removeChild(HUD.minimapBG);
    HUD.minimapBG = new PIXI.Graphics();
    HUD.minimapBG.lineStyle(outlineWidth, 0xffffff, 0.8);
    HUD.minimapBG.beginFill(0x000000, 0.3);
    HUD.minimapBG.drawRect(x - outlineWidth, y - outlineWidth, width + outlineWidth, height + outlineWidth);
    HUD.addChild(HUD.minimapBG);
}

export function centerMiniMap() {
    if (!mapCollapsed) return;
    const scaleDiffX = Game.world.width / getMiniMapWidth();
    const scaleDiffY = Game.world.height / getMiniMapHeight();
    HUD.minimap.position.set(Game.app.renderer.screen.width - miniMapCollapsedWidth - slotBorderOffsetX - outlineWidth / 2 - camera.x / scaleDiffX + miniMapCollapsedWidth / 2,
        Game.app.renderer.screen.height - miniMapCollapsedHeight - bottomOffset - outlineWidth / 2 - camera.y / scaleDiffY + miniMapCollapsedHeight / 2);
}

function getMiniMapWidth() {
    return Game.map[0].length * miniMapPixelSize * HUD.minimap.scale.x;
}

function getMiniMapHeight() {
    return Game.map.length * miniMapPixelSize * HUD.minimap.scale.y;
}

function initKeyBind() {
    const key = new PIXI.Container();
    const text = new PIXI.Text("M", HUDKeyBindTextStyle);
    const rect = new PIXI.Graphics();
    rect.beginFill(0xffffff);
    rect.lineStyle(2, 0x666666, 0.5);
    const rectSize = HUDKeyBindSize;
    rect.drawRect(0, 0, rectSize, rectSize);
    rect.endFill();
    text.position.set((rectSize - text.width) / 2, (rectSize - text.height) / 2);
    key.addChild(rect);
    key.addChild(text);
    key.zIndex = 3;
    key.position.set(Game.app.renderer.screen.width - slotBorderOffsetX - outlineWidth / 2 - key.width,
        Game.app.renderer.screen.height - bottomOffset - outlineWidth / 2 - key.height);
    HUD.addChild(key);
    return key;
}