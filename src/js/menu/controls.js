import {Game} from "../game";
import * as PIXI from "pixi.js";
import {menuBgColor} from "./menu";

export function setupControlSettings() {
    Game.controlsInterface = new PIXI.Container();
    Game.controlsInterface.sortableChildren = true;
    Game.controlsInterface.visible = false;
    Game.controlsInterface.zIndex = 4;
    Game.app.stage.addChild(Game.controlsInterface);
    createBG(menuBgColor);
    Game.controlsInterface.buttons = [];
    window.addEventListener("resize", () => {
        createBG(menuBgColor);
    });
    return;
    setButtonChooseHandlers();
    setButtonClickHandlers();
}

function createBG(color = 0x444444) {
    if (Game.controlsInterface.bg) Game.controlsInterface.removeChild(Game.controlsInterface.bg);
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = -1;
    Game.controlsInterface.addChild(bg);
    Game.controlsInterface.bg = bg;
}

function setButtonClickHandlers() {
    Game.controlsInterface.buttons[0].clickButton = () => {
        Game.controlsInterface.visible = false;
    };

    for (let i = 0; i < Game.controlsInterface.buttons.length; i++) {
        Game.controlsInterface.buttons[i].on("click", Game.controlsInterface.buttons[i].clickButton);
    }
}

function setButtonChooseHandlers() {
    Game.controlsInterface.buttons[0].chooseButton = () => {
        Game.controlsInterface.visible = false;
    };

    for (let i = 0; i < Game.controlsInterface.buttons.length; i++) {
        Game.controlsInterface.buttons[i].on("mouseover", Game.controlsInterface.buttons[i].chooseButton);
    }
}
