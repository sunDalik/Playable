import {HUD} from "./hud_object";
import {Game} from "../game";
import * as PIXI from "pixi.js";
import {setTickTimeout} from "../utils/game_utils";
import {GAME_OVER_BLUR_FILTER} from "../filters";
import {SUPER_HUD} from "./super_hud";
import {keyboard} from "../keyboard/keyboard_handler";
import {retry} from "../setup";
import {removeObjectFromArray} from "../utils/basic_utils";

const blackBarLeft = initBlackBar();
const blackBarRight = initBlackBar();
const blackBarMoveAnimationTime = 18;

function initBlackBar() {
    const blackBar = new PIXI.Graphics();
    blackBar.beginFill(0x000000);
    blackBar.drawRect(0, 0, 1, 1);
    blackBar.zIndex = 10;
    blackBar.visible = false;
    HUD.addChild(blackBar);
    return blackBar;
}

export function closeBlackBars(callback) {
    blackBarLeft.height = blackBarRight.height = Game.app.renderer.screen.height;
    blackBarLeft.width = blackBarRight.width = Game.app.renderer.screen.width / 2;
    blackBarLeft.position.y = blackBarRight.position.y = 0;
    blackBarLeft.position.x = -blackBarLeft.width;
    blackBarRight.position.x = Game.app.renderer.screen.width;
    blackBarLeft.visible = blackBarRight.visible = true;
    const step = Game.app.renderer.screen.width / 2 / blackBarMoveAnimationTime;
    let counter = 0;

    const animation = delta => {
        counter += delta;
        blackBarLeft.position.x += step;
        blackBarRight.position.x -= step;
        if (counter >= blackBarMoveAnimationTime) {
            blackBarLeft.position.x = 0;
            blackBarRight.position.x = Game.app.renderer.screen.width / 2;
            Game.player.cancelAnimation();
            Game.player2.cancelAnimation();
            Game.app.ticker.remove(animation);
            setTickTimeout(callback, 0);
        }
    };
    Game.app.ticker.add(animation);
}

export function retreatBlackBars() {
    blackBarLeft.height = blackBarRight.height = Game.app.renderer.screen.height;
    blackBarLeft.width = blackBarRight.width = Game.app.renderer.screen.width / 2;
    blackBarLeft.position.y = blackBarRight.position.y = 0;
    blackBarLeft.position.x = 0;
    blackBarRight.position.x = Game.app.renderer.screen.width / 2;
    blackBarLeft.visible = blackBarRight.visible = true;
    const step = Game.app.renderer.screen.width / 2 / blackBarMoveAnimationTime;
    let counter = 0;

    const animation = delta => {
        counter += delta;
        blackBarLeft.position.x -= step;
        blackBarRight.position.x += step;
        if (counter >= blackBarMoveAnimationTime) {
            blackBarLeft.visible = blackBarRight.visible = false;
            Game.app.ticker.remove(animation);
        }
    };
    Game.app.ticker.add(animation);
}

const retryButton = keyboard("KeyR");

export function pullUpGameOverScreen(deathFilter) {
    Game.world.filters.push(GAME_OVER_BLUR_FILTER);
    HUD.filters.push(GAME_OVER_BLUR_FILTER);
    GAME_OVER_BLUR_FILTER.blur = 0;
    SUPER_HUD.gameOverScreen.position.x = Game.app.renderer.screen.width / 2 - SUPER_HUD.gameOverScreen.width / 2;
    SUPER_HUD.gameOverScreen.position.y = Game.app.renderer.screen.height;
    SUPER_HUD.gameOverScreen.visible = true;
    const time = 10;
    const offset = 60;
    const step = (Game.app.renderer.screen.height / 2 + SUPER_HUD.gameOverScreen.height / 2 + offset) / time;
    const blurStep = GAME_OVER_BLUR_FILTER.maxBlur / time;
    let counter = 0;

    retryButton.press = () => {
        retryButton.press = null;
        SUPER_HUD.gameOverScreen.visible = false;
        removeObjectFromArray(GAME_OVER_BLUR_FILTER, Game.world.filters);
        removeObjectFromArray(GAME_OVER_BLUR_FILTER, HUD.filters);
        retry(deathFilter);
    };

    const animation = delta => {
        counter += delta;
        SUPER_HUD.gameOverScreen.position.y -= step * delta;
        GAME_OVER_BLUR_FILTER.blur += blurStep;
        if (counter >= time) {
            Game.app.ticker.remove(animation);
            GAME_OVER_BLUR_FILTER.blur = GAME_OVER_BLUR_FILTER.maxBlur;
            SUPER_HUD.gameOverScreen.position.y = Game.app.renderer.screen.height / 2 - SUPER_HUD.gameOverScreen.height / 2 - offset;
        }
    };
    Game.app.ticker.add(animation);
}