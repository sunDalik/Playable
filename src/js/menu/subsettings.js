import {Game} from "../game";
import * as PIXI from "pixi.js";
import {changeBGColor, menuBgColor} from "./main_menu";
import {setupControlSettings} from "./controls";
import {createBackButton, createSimpleButtonSet} from "./menu_common";
import {setupOtherSettings} from "./other_settings";
import {GAME_STATE} from "../enums/enums";
import {SUPER_HUD} from "../drawing/super_hud";

export function setupSubSettings() {
    Game.subSettingsInterface = new PIXI.Container();
    setupControlSettings();
    setupOtherSettings();
    Game.subSettingsInterface.sortableChildren = true;
    Game.subSettingsInterface.visible = false;
    Game.subSettingsInterface.zIndex = 4;
    Game.subSettingsInterface.choosable = true;
    Game.app.stage.addChild(Game.subSettingsInterface);
    Game.subSettingsInterface.buttons = createSimpleButtonSet(["CONTROLS", "HUD"], Game.subSettingsInterface, 200).slice();
    setButtonClickHandlers();
    const backButton = createBackButton(Game.subSettingsInterface);
    Game.subSettingsInterface.buttons.unshift(backButton);
    backButton.clickButton = () => {
        Game.subSettingsInterface.visible = false;
        if (Game.state === GAME_STATE.MENU) {
            Game.mainMenu.visible = true;
            Game.mainMenu.buttons[0].chooseButton();
            changeBGColor(menuBgColor);
        } else if (Game.state === GAME_STATE.PLAYING) {
            SUPER_HUD.pauseScreen.visible = true;
            SUPER_HUD.pauseScreen.buttons[0].chooseButton();
        }
    };
    backButton.on("click", backButton.clickButton);
    backButton.downButton = backButton.rightButton = Game.subSettingsInterface.buttons[1];
    Game.subSettingsInterface.buttons[1].leftButton = Game.subSettingsInterface.buttons[1].upButton = backButton;
}

function setButtonClickHandlers() {
    Game.subSettingsInterface.buttons[0].clickButton = () => {
        Game.subSettingsInterface.visible = false;
        Game.controlsInterface.visible = true;
        Game.controlsInterface.buttons[1].chooseButton();
    };
    Game.subSettingsInterface.buttons[1].clickButton = () => {
        Game.subSettingsInterface.visible = false;
        Game.otherSettingsInterface.visible = true;
        Game.otherSettingsInterface.buttons[1].chooseButton();
    };

    for (let i = 0; i < Game.subSettingsInterface.buttons.length; i++) {
        Game.subSettingsInterface.buttons[i].on("click", Game.subSettingsInterface.buttons[i].clickButton);
    }
}
