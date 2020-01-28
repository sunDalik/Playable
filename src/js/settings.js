import {Game} from "./game";
import * as PIXI from "pixi.js";

export function setupSettings() {
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    Game.settingsInterface = new PIXI.Container();
    Game.settingsInterface.sortableChildren = true;
    Game.settingsInterface.visible = false;
    Game.settingsInterface.zIndex = 4;
    Game.app.stage.addChild(Game.settingsInterface);
    createSettingsBG(0x444444);
}

function createSettingsBG(color = 0x444444) {
    if (Game.settingsInterface.bg) Game.settingsInterface.removeChild(Game.settingsInterface.bg);
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = -1;
    Game.settingsInterface.addChild(bg);
    Game.settingsInterface.bg = bg;
}