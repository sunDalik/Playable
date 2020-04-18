import {ACHIEVEMENT_ID, STAGE, STORAGE} from "./enums";
import {Game} from "./game";
import {HUD} from "./drawing/hud_object";
import * as PIXI from "pixi.js";
import {HUDTextStyleTitle, miniMapBottomOffset, slotBorderOffsetX} from "./drawing/draw_constants";
import {easeInQuad, easeOutQuad} from "./utils/math_utils";
import {removeObjectFromArray} from "./utils/basic_utils";
import {AchievementsSpriteSheet} from "./loader";

export const achievements = [
    {
        id: ACHIEVEMENT_ID.BEAT_FC,
        description: "Beat Flooded Caves",
        image: "beat_fc.png"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_DT,
        description: "Beat Dark Tunnel",
        image: "beat_dt.png",
        description_locked: "Beat level 2"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_ANY_BOSS_NO_DAMAGE,
        description: "Beat any boss without taking damage",
        image: "beat_any_boss_no_damage.png"
    }];


export function completeBeatStageAchievements(stage) {
    switch (stage) {
        case STAGE.FLOODED_CAVE:
            completeAchievement(ACHIEVEMENT_ID.BEAT_FC);
            break;
        case STAGE.DARK_TUNNEL:
            completeAchievement(ACHIEVEMENT_ID.BEAT_DT);
            break;
    }
}

export function completeAchievement(achievement_id) {
    const storage = JSON.parse(window.localStorage[STORAGE.ACHIEVEMENTS]);
    if (storage[achievement_id] === 0) {
        storage[achievement_id] = 1;
        showAchievementAnimation(achievements.find(achievement => achievement.id === achievement_id));
        window.localStorage[STORAGE.ACHIEVEMENTS] = JSON.stringify(storage);
    }
}

export function showAchievementAnimation(achievement, fromQueue = false) {
    if (!fromQueue) {
        Game.achievementPopUpQueue.push(achievement);
        if (Game.achievementPopUpQueue.length > 1) return;
    }

    const popUp = new PIXI.Graphics();
    popUp.beginFill(0x000000);
    popUp.lineStyle(3, 0xffffff);
    popUp.drawRoundedRect(0, 0, 350, 100, 5);
    const imageSize = 65;
    const achievementSprite = new PIXI.Sprite(AchievementsSpriteSheet[achievement.image]);
    achievementSprite.width = achievementSprite.height = imageSize;
    const imageOffsetX = 40;
    const imageOffsetY = 15;
    achievementSprite.position.set(40, imageOffsetY);
    popUp.addChild(achievementSprite);
    const textOffsetX = imageOffsetX + achievementSprite.width;
    const textBox = new PIXI.Text(achievement.description, HUDTextStyleTitle);
    if (textBox.width > popUp.width - imageSize - textOffsetX * 2) {
        const textArray = textBox.text.split(" ");
        textArray.splice(Math.floor(textArray.length / 2), 0, "\n");
        textBox.text = textArray.join(" ");
    }
    textBox.position.set(textOffsetX + (popUp.width - textOffsetX) / 2 - textBox.width / 2, imageOffsetY + 6);
    popUp.addChild(textBox);

    HUD.addChild(popUp);
    popUp.position.set(slotBorderOffsetX, Game.app.renderer.screen.height);
    popUp.zIndex = 1;

    const slideTime = 35;
    const startVal = popUp.position.y;
    const endChange = -popUp.height - miniMapBottomOffset;
    const stayTime = 300;
    let placed = false;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (counter < slideTime) {
            popUp.position.y = startVal + easeOutQuad(counter / slideTime) * endChange;
        } else if (counter >= slideTime + stayTime && counter < slideTime + stayTime + slideTime) {
            popUp.position.y = startVal + endChange - easeInQuad((counter - slideTime - stayTime) / slideTime) * endChange;
        }
        if (counter >= slideTime && !placed) {
            placed = true;
            popUp.position.y = startVal + endChange;
        }
        if (counter >= slideTime + stayTime + slideTime) {
            Game.app.ticker.remove(animation);
            HUD.removeChild(popUp);
            removeObjectFromArray(achievement, Game.achievementPopUpQueue);
            if (Game.achievementPopUpQueue.length !== 0) showAchievementAnimation(Game.achievementPopUpQueue[0], true);
        }
    };

    Game.app.ticker.add(animation);
}
