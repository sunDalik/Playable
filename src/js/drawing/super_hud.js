import * as PIXI from "pixi.js";
import {HUD} from "./hud_object";
import {Game} from "../game";
import {createSimpleButtonSet, menuButtonOffsetY} from "../menu/menu_common";
import {GAME_STATE} from "../enums/enums";
import {retry} from "../setup";
import {bringMenuBackToLife} from "../menu/main_menu";
import {updateAchievementsScreen} from "../menu/achievements_screen";

export const SUPER_HUD = new PIXI.Container();
SUPER_HUD.sortableChildren = true;
SUPER_HUD.filters = [];
SUPER_HUD.zIndex = HUD.zIndex + 1;

SUPER_HUD.gameOverScreen = new PIXI.Container();
SUPER_HUD.killedBys = [];

export function setupSuperHud() {
    setupPauseScreen();
}

function setupPauseScreen() {
    SUPER_HUD.pauseScreen = new PIXI.Container();
    SUPER_HUD.pauseScreen.sortableChildren = true;
    SUPER_HUD.pauseScreen.visible = false;
    SUPER_HUD.pauseScreen.choosable = true;
    SUPER_HUD.pauseScreen.zIndex = 11;
    const buttons = ["RESUME", "RETRY", "SETTINGS", "ACHIEVEMENTS", "EXIT"];
    SUPER_HUD.pauseScreen.buttons = createSimpleButtonSet(buttons, SUPER_HUD.pauseScreen,
        (Game.app.renderer.screen.height - menuButtonOffsetY * (buttons.length - 1)) / 2 - 30).slice();
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
        retry();
    };
    SUPER_HUD.pauseScreen.buttons[2].clickButton = () => {
        SUPER_HUD.pauseScreen.visible = false;
        Game.subSettingsInterface.visible = true;
        Game.subSettingsInterface.buttons[1].chooseButton();
    };
    SUPER_HUD.pauseScreen.buttons[3].clickButton = () => {
        SUPER_HUD.pauseScreen.visible = false;
        Game.achievementsInterface.visible = true;
        Game.achievementsInterface.buttons[0].chooseButton();
        updateAchievementsScreen();
    };
    SUPER_HUD.pauseScreen.buttons[4].clickButton = () => {
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
        Game.mainMenu.buttons[0].chooseButton();
    };
    for (let i = 0; i < SUPER_HUD.pauseScreen.buttons.length; i++) {
        SUPER_HUD.pauseScreen.buttons[i].on("click", SUPER_HUD.pauseScreen.buttons[i].clickButton);
    }
    SUPER_HUD.addChild(SUPER_HUD.pauseScreen);
}

export function redrawPauseBG() {
    if (SUPER_HUD.blackBg) SUPER_HUD.removeChild(SUPER_HUD.blackBg);

    if (SUPER_HUD.pauseScreen.visible
        || Game.state === GAME_STATE.PLAYING && (Game.subSettingsInterface.visible || Game.otherSettingsInterface.visible || Game.controlsInterface.visible
            || Game.gameOver)) {
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000);
        bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
        bg.zIndex = -10;
        SUPER_HUD.blackBg = bg;
        SUPER_HUD.addChild(bg);

        const endAlpha = 0.8;
        const animationTime = 4;
        let counter = 0;

        bg.alpha = endAlpha;
        /*
        bg.alpha = 0;
        const animation = delta => {
            counter += delta;
            bg.alpha = counter / animationTime * endAlpha;
            if (counter >= animationTime || SUPER_HUD.blackBg !== bg) {
                Game.app.ticker.remove(animation);
                bg.alpha = endAlpha;
            }
        };
        Game.app.ticker.add(animation);
         */
    }
}