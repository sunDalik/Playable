import {Game} from "../game";
import * as PIXI from "pixi.js";
import {changeBGColor, createBackButton, createSimpleButtonSet, menuBgColor} from "./menu";
import {setupControlSettings} from "./controls";

export function setupSubSettings() {
    Game.subSettingsInterface = new PIXI.Container();
    setupControlSettings();
    Game.subSettingsInterface.sortableChildren = true;
    Game.subSettingsInterface.visible = false;
    Game.subSettingsInterface.zIndex = 4;
    Game.subSettingsInterface.choosable = true;
    Game.app.stage.addChild(Game.subSettingsInterface);
    Game.subSettingsInterface.buttons = createSimpleButtonSet(["CONTROLS", "OTHER(wip)"], Game.subSettingsInterface, 200).slice();
    setButtonClickHandlers();
    const backButton = createBackButton(Game.subSettingsInterface);
    Game.subSettingsInterface.buttons.push(backButton);
    backButton.clickButton = () => {
        Game.mainMenu.visible = true;
        Game.subSettingsInterface.visible = false;
        changeBGColor(menuBgColor);
    };
    backButton.on("click", backButton.clickButton);
    backButton.downButton = backButton.rightButton = Game.subSettingsInterface.buttons[0];
    Game.subSettingsInterface.buttons[0].leftButton = Game.subSettingsInterface.buttons[0].upButton = backButton;
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
