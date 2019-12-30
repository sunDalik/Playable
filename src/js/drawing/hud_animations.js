import {HUD} from "./hud_object";
import {Game} from "../game";
import * as PIXI from "pixi.js";
import {gotoNextLevel} from "../game_logic";
import {setTickTimeout} from "../utils/game_utils";

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

export function closeBlackBarsAndGotoNextLevel() {
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
            setTickTimeout(gotoNextLevel, 0);
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