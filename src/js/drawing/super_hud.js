import * as PIXI from "pixi.js";
import {HUD} from "./hud_object";
import {HUDTextStyleGameOver} from "./draw_constants";
import {Game} from "../game";
import {createSimpleButtonSet} from "../menu/menu_common";
import {keyboardS} from "../keyboard/keyboard_handler";
import {GAME_STATE, STORAGE} from "../enums";
import {retry} from "../setup";
import {bringMenuBackToLife} from "../menu/main_menu";

export const SUPER_HUD = new PIXI.Container();
SUPER_HUD.sortableChildren = true;
SUPER_HUD.filters = [];
SUPER_HUD.zIndex = HUD.zIndex + 1;

SUPER_HUD.gameOverScreen = new PIXI.Container();
const text = new PIXI.Text("You were lost\nWanna try again?\nPress R to retry", HUDTextStyleGameOver);
SUPER_HUD.gameOverScreen.addChild(text);
SUPER_HUD.gameOverScreen.visible = false;
SUPER_HUD.addChild(SUPER_HUD.gameOverScreen);

export function setupSuperHud() {
    setupPauseScreen();
    keyboardS(STORAGE.KEY_PAUSE).press = escapeHandler;
}

function setupPauseScreen() {
    SUPER_HUD.pauseScreen = new PIXI.Container();
    SUPER_HUD.pauseScreen.sortableChildren = true;
    SUPER_HUD.pauseScreen.visible = false;
    SUPER_HUD.pauseScreen.choosable = true;
    SUPER_HUD.pauseScreen.zIndex = 11;
    SUPER_HUD.pauseScreen.buttons = createSimpleButtonSet(["RESUME", "RETRY", "SETTINGS", "EXIT"], SUPER_HUD.pauseScreen, 200).slice();
    window.addEventListener("resize", () => {
        redrawPauseBG();
    });

    SUPER_HUD.pauseScreen.buttons[0].clickButton = () => {
        SUPER_HUD.pauseScreen.visible = false;
        Game.paused = false;
        redrawPauseBG();
    };
    SUPER_HUD.pauseScreen.buttons[1].clickButton = () => {
        SUPER_HUD.pauseScreen.visible = false;
        Game.paused = false;
        redrawPauseBG();
        retry();
    };
    SUPER_HUD.pauseScreen.buttons[2].clickButton = () => {
        SUPER_HUD.pauseScreen.visible = false;
        Game.subSettingsInterface.visible = true;
        Game.subSettingsInterface.buttons[1].chooseButton();
    };
    SUPER_HUD.pauseScreen.buttons[3].clickButton = () => {
        SUPER_HUD.pauseScreen.visible = false;
        Game.unplayable = true;
        Game.paused = false;
        Game.world.visible = false;
        HUD.visible = false;

        Game.mainMenu.visible = true;
        Game.mainMenu.choosable = true;
        Game.menuCommon.visible = true;
        bringMenuBackToLife();
        redrawPauseBG();
        Game.state = GAME_STATE.MENU;
    };
    for (let i = 0; i < SUPER_HUD.pauseScreen.buttons.length; i++) {
        SUPER_HUD.pauseScreen.buttons[i].on("click", SUPER_HUD.pauseScreen.buttons[i].clickButton);
    }
    SUPER_HUD.addChild(SUPER_HUD.pauseScreen);
}

function redrawPauseBG() {
    if (SUPER_HUD.blackBg) SUPER_HUD.removeChild(SUPER_HUD.blackBg);

    if (SUPER_HUD.pauseScreen.visible
        || Game.state === GAME_STATE.PLAYING && (Game.subSettingsInterface.visible || Game.otherSettingsInterface.visible || Game.controlsInterface.visible)) {
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.6);
        bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
        bg.zIndex = -10;
        SUPER_HUD.blackBg = bg;
        SUPER_HUD.addChild(bg);
    }
}

function escapeHandler() {
    if (Game.state !== GAME_STATE.PLAYING) return;
    if (SUPER_HUD.pauseScreen.visible) {
        Game.paused = false;
        SUPER_HUD.pauseScreen.visible = false;
    } else {
        if (Game.subSettingsInterface.visible) {
            SUPER_HUD.pauseScreen.visible = true;
            Game.subSettingsInterface.visible = false;
        } else if (Game.otherSettingsInterface.visible) {
            Game.otherSettingsInterface.visible = false;
            Game.subSettingsInterface.visible = true;
        } else if (Game.controlsInterface.visible) {
            Game.controlsInterface.visible = false;
            Game.subSettingsInterface.visible = true;
        } else {
            Game.paused = true;
            SUPER_HUD.pauseScreen.buttons[0].chooseButton();
            SUPER_HUD.pauseScreen.visible = true;
        }
    }
    redrawPauseBG();
}