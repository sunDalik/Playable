import {Game} from "../game";
import * as PIXI from "pixi.js";
import {changeBGColor, menuBgColor} from "./main_menu";
import {createBackButton} from "./menu_common";
import {GAME_STATE, STORAGE} from "../enums/enums";
import {SUPER_HUD} from "../drawing/super_hud";
import {achievements} from "../achievements";
import {HUDTextStyleTitle} from "../drawing/draw_constants";
import {AchievementsSpriteSheet} from "../loader";

export function setupAchievementsScreen() {
    Game.achievementsInterface = new PIXI.Container();
    Game.achievementsInterface.sortableChildren = true;
    Game.achievementsInterface.visible = false;
    Game.achievementsInterface.zIndex = 4;
    Game.achievementsInterface.choosable = true;
    Game.app.stage.addChild(Game.achievementsInterface);
    const backButton = createBackButton(Game.achievementsInterface);
    Game.achievementsInterface.buttons = [backButton];
    Game.achievementsInterface.achievements = [];
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

//todo make it flexible
function displayAchievements() {
    const rowLength = 5;
    const colLength = 3;
    const imageSize = 120;
    const textOffset = 15;
    const textBoxHeight = 50;
    const initOffsetY = Game.achievementsInterface.buttons[0].height + Game.achievementsInterface.buttons[0].position.y;
    const rowOffset = (Game.app.renderer.screen.height - (imageSize + textOffset + textBoxHeight) * colLength - initOffsetY) / (colLength + 1);
    const colOffset = (Game.app.renderer.screen.width - imageSize * rowLength) / (rowLength + 1);
    const storage = JSON.parse(window.localStorage[STORAGE.ACHIEVEMENTS]);
    for (let i = 0; i < achievements.length; i++) {
        const col = i % rowLength;
        const row = Math.floor(i / rowLength);
        const achievementSprite = new PIXI.Sprite(AchievementsSpriteSheet["locked.png"]);
        if (storage[achievements[i].id] === 1) achievementSprite.texture = AchievementsSpriteSheet[achievements[i].image];
        achievementSprite.width = achievementSprite.height = imageSize;
        achievementSprite.position.set(col * (imageSize + colOffset) + colOffset, row * (imageSize + textBoxHeight + textOffset + rowOffset) + rowOffset + initOffsetY);
        Game.achievementsInterface.addChild(achievementSprite);

        const textBox = new PIXI.Text(achievements[i].description, HUDTextStyleTitle);
        if (storage[achievements[i].id] === 0 && achievements[i].description_locked) textBox.text = achievements[i].description_locked;
        textBox.style.wordWrap = true;
        textBox.style.wordWrapWidth = imageSize + colOffset * 2 / 3;
        textBox.position.set(achievementSprite.position.x + imageSize / 2 - textBox.width / 2, achievementSprite.position.y + imageSize + textOffset);

        Game.achievementsInterface.addChild(textBox);
        Game.achievementsInterface.achievements.push(achievementSprite);
        Game.achievementsInterface.achievements.push(textBox);
    }
}

export function updateAchievementsScreen() {
    for (let i = Game.achievementsInterface.achievements.length - 1; i >= 0; i--) {
        Game.achievementsInterface.removeChild(Game.achievementsInterface.achievements[i]);
    }
    Game.achievementsInterface.achievements = [];
    displayAchievements();
}