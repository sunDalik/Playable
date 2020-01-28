import {Game} from "../game";
import * as PIXI from "pixi.js";
import {createSimpleButtonSet} from "./menu";
import {setupControlSettings} from "./controls";

export function setupSubSettings() {
    Game.subSettingsInterface = new PIXI.Container();
    setupControlSettings();
    Game.subSettingsInterface.sortableChildren = true;
    Game.subSettingsInterface.visible = false;
    Game.subSettingsInterface.zIndex = 4;
    Game.app.stage.addChild(Game.subSettingsInterface);
    Game.subSettingsInterface.buttons = createSimpleButtonSet(["CONTROLS(wip)", "OTHER(wip)"], Game.subSettingsInterface, 200);
    setButtonClickHandlers();
}

function setButtonClickHandlers() {
    Game.subSettingsInterface.buttons[0].clickButton = () => {
        Game.subSettingsInterface.visible = false;
        Game.controlsInterface.visible = true;
    };
    Game.subSettingsInterface.buttons[1].clickButton = () => {
        //Game.subSettingsInterface.visible = false;
    };

    for (let i = 0; i < Game.subSettingsInterface.buttons.length; i++) {
        Game.subSettingsInterface.buttons[i].on("click", Game.subSettingsInterface.buttons[i].clickButton);
    }
}
