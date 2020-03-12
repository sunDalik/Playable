import {Game} from "../game";
import * as PIXI from "pixi.js";
import {changeBGColor, menuBgColor} from "./main_menu";
import {createBackButton} from "./menu_common";
import {GAME_STATE, STORAGE} from "../enums";
import {SUPER_HUD} from "../drawing/super_hud";
import {achievements} from "../achievements";
import {randomChoice} from "../utils/random_utils";

export function setupAchievementsScreen() {
    Game.achievementsInterface = new PIXI.Container();
    Game.achievementsInterface.sortableChildren = true;
    Game.achievementsInterface.visible = false;
    Game.achievementsInterface.zIndex = 4;
    Game.achievementsInterface.choosable = true;
    Game.app.stage.addChild(Game.achievementsInterface);
    const backButton = createBackButton(Game.achievementsInterface);
    Game.achievementsInterface.buttons = [backButton];
    backButton.clickButton = () => {
        Game.achievementsInterface.visible = false;
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
    displayAchievements();
}

function displayAchievements() {
    const rowLength = 5;
    const size = 150;
    const rowOffset = 40;
    const colOffset = 100;
    const storage = window.localStorage[STORAGE.ACHIEVEMENTS];
    for (let i = 0; i < achievements.length; i++) {
        const col = i % rowLength;
        const row = Math.floor(i / rowLength);
        const achievementSprite = new PIXI.Sprite(Game.resources["src/images/achievements/locked.png"].texture);
        if (storage[achievements[i].id] === 1) achievementSprite.texture = Game.resources[achievements[i].image].texture;
        achievementSprite.width = achievementSprite.height = size;
        achievementSprite.position.set(col * (size + colOffset) + colOffset, row * (size + rowOffset) + rowOffset + Game.achievementsInterface.buttons[0].height + Game.achievementsInterface.buttons[0].position.y);
        Game.achievementsInterface.addChild(achievementSprite);
    }
}