import {Game} from "../game";
import * as PIXI from "pixi.js";
import {createBackButton, createCheckboxSet} from "./menu_common";
import {STORAGE} from "../enums";
import {redrawSpeedRunTime} from "../drawing/draw_hud";
import {HUD} from "../drawing/hud_object";

export function setupOtherSettings() {
    Game.otherSettingsInterface = new PIXI.Container();
    Game.otherSettingsInterface.sortableChildren = true;
    Game.otherSettingsInterface.visible = false;
    Game.otherSettingsInterface.zIndex = 4;
    Game.otherSettingsInterface.choosable = true;
    Game.app.stage.addChild(Game.otherSettingsInterface);
    Game.otherSettingsInterface.buttons = createCheckboxSet([{
        text: "Show time",
        checked: JSON.parse(window.localStorage[STORAGE.SHOW_TIME])
    }], Game.otherSettingsInterface, 200).slice();
    const backButton = createBackButton(Game.otherSettingsInterface);
    Game.otherSettingsInterface.buttons.unshift(backButton);
    setButtonClickHandlers();
    backButton.clickButton = () => {
        Game.subSettingsInterface.visible = true;
        Game.otherSettingsInterface.visible = false;
        Game.subSettingsInterface.buttons[1].chooseButton();
    };
    backButton.on("click", backButton.clickButton);
    backButton.downButton = backButton.rightButton = Game.otherSettingsInterface.buttons[1];
    Game.otherSettingsInterface.buttons[1].leftButton = Game.otherSettingsInterface.buttons[1].upButton = backButton;
}

function setButtonClickHandlers() {
    Game.otherSettingsInterface.buttons[1].clickButton = () => {
        Game.otherSettingsInterface.buttons[1].check();
        window.localStorage[STORAGE.SHOW_TIME] = Game.otherSettingsInterface.buttons[1].checked;
        Game.showTime = JSON.parse(window.localStorage[STORAGE.SHOW_TIME]);
        if (HUD.speedrunTime) redrawSpeedRunTime();
    };

    for (let i = 1; i < Game.otherSettingsInterface.buttons.length; i++) {
        Game.otherSettingsInterface.buttons[i].on("click", Game.otherSettingsInterface.buttons[i].clickButton);
    }
}
