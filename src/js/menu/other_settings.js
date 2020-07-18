import {Game} from "../game";
import * as PIXI from "pixi.js";
import {createBackButton, createCheckboxSet} from "./menu_common";
import {STORAGE} from "../enums/enums";
import {redrawFps, redrawSpeedRunTime} from "../drawing/draw_hud";
import {HUD} from "../drawing/hud_object";

//todo ADD DISABLE MOUSE OPTION BUT HOW?????
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
    },/* {
        text: "Disable Mouse",
        checked: JSON.parse(window.localStorage[STORAGE.DISABLE_MOUSE])
    },*/ {
        text: "Show FPS",
        checked: JSON.parse(window.localStorage[STORAGE.SHOW_FPS])
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
    /*Game.otherSettingsInterface.buttons[2].clickButton = () => {
        Game.otherSettingsInterface.buttons[2].check();
        window.localStorage[STORAGE.DISABLE_MOUSE] = Game.otherSettingsInterface.buttons[2].checked;
        Game.disableMouse = JSON.parse(window.localStorage[STORAGE.DISABLE_MOUSE]);
    };*/
    Game.otherSettingsInterface.buttons[2].clickButton = () => {
        Game.otherSettingsInterface.buttons[2].check();
        window.localStorage[STORAGE.SHOW_FPS] = Game.otherSettingsInterface.buttons[2].checked;
        Game.showFPS = JSON.parse(window.localStorage[STORAGE.SHOW_FPS]);
        if (HUD.fps) redrawFps();
    };

    for (let i = 1; i < Game.otherSettingsInterface.buttons.length; i++) {
        //todo add check if mouse is disabled
        Game.otherSettingsInterface.buttons[i].on("click", Game.otherSettingsInterface.buttons[i].clickButton);
    }
}
