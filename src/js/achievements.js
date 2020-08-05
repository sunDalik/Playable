import {ACHIEVEMENT_ID, SLOT, STAGE, STORAGE} from "./enums/enums";
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
        description_locked: "Beat Dark Tunnel"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_RU,
        description: "Beat Ruins",
        image: "beat_ru.png"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_ANY_BOSS_NO_DAMAGE,
        description: "Beat a boss without taking damage",
        image: "beat_any_boss_no_damage.png"
    },
    {
        id: ACHIEVEMENT_ID.EXPLODE_TREASURE_WALL,
        description: "Explode a treasure wall",
        image: "explode_treasure_wall.png"
    },
    {
        id: ACHIEVEMENT_ID.DESTROY_OBELISK,
        description: "Destroy an Obelisk",
        image: "explode_the_obelisk.png"
    },
    {
        id: ACHIEVEMENT_ID.EQUIP_ALL_ITEMS,
        description: "Equip items in all non-magic slots",
        image: "equip_all_items.png"
    },
    {
        id: ACHIEVEMENT_ID.FIND_ENCHANTED_ITEM,
        description: "Find an enchanted item",
        image: "find_enchanted_item.png"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_FC_FAST,
        description: "Beat Flooded Caves in under 2 minutes",
        image: "beat_fc_fast.png"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_ITEMLESS,
        description: "Beat Ruins without ever picking up any item",
        image: "beat_itemless.png",
        description_locked: "Beat Ruins without ever picking up any item (bombs and potions are allowed)"
    }];


export function completeBeatStageAchievements(stage) {
    switch (stage) {
        case STAGE.FLOODED_CAVE:
            completeAchievement(ACHIEVEMENT_ID.BEAT_FC);
            if (Game.time <= 120000) completeAchievement(ACHIEVEMENT_ID.BEAT_FC_FAST);
            break;
        case STAGE.DARK_TUNNEL:
            completeAchievement(ACHIEVEMENT_ID.BEAT_DT);
            break;
        case STAGE.RUINS:
            completeAchievement(ACHIEVEMENT_ID.BEAT_RU);
            break;
    }
}

export function completeAchievementForEquippingAllItems() {
    if (!Game.player || !Game.player2) return false;
    for (const player of [Game.player, Game.player2]) {
        for (const slot of [SLOT.HEADWEAR, SLOT.ARMOR, SLOT.FOOTWEAR, SLOT.ACCESSORY, SLOT.WEAPON, SLOT.EXTRA]) {
            if (!player[slot]) return false;
        }
    }
    completeAchievement(ACHIEVEMENT_ID.EQUIP_ALL_ITEMS);
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
    popUp.lineStyle(3, 0xFFFFFF, 0.8, 0);
    popUp.drawRoundedRect(0, 0, 320, 100, 6);
    const imageSize = 80;
    const achievementSprite = new PIXI.Sprite(AchievementsSpriteSheet[achievement.image]);
    achievementSprite.width = achievementSprite.height = imageSize;
    const imageOffsetX = 10;
    const imageOffsetY = 10;
    achievementSprite.position.set(imageOffsetX, imageOffsetY);
    popUp.addChild(achievementSprite);
    const imageTextOffsetX = 20;
    const textOffsetX = imageOffsetX + imageSize + imageTextOffsetX;
    const textBox = new PIXI.Text(achievement.description, HUDTextStyleTitle);
    const textSpace = popUp.width - textOffsetX - imageTextOffsetX;
    textBox.style.wordWrap = true;
    textBox.style.wordWrapWidth = textSpace;
    textBox.position.set(textOffsetX + textSpace / 2 - textBox.width / 2,
        (popUp.height - textBox.height) / 2 - 4);
    popUp.addChild(textBox);

    HUD.addChild(popUp);
    popUp.position.set(slotBorderOffsetX, Game.app.renderer.screen.height);
    popUp.zIndex = 1;

    const slideTime = 20;
    const startVal = popUp.position.y;
    const endChange = -popUp.height - miniMapBottomOffset;
    const stayTime = 250;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (counter < slideTime) {
            popUp.position.y = startVal + easeOutQuad(counter / slideTime) * endChange;
        } else if (counter >= slideTime + stayTime && counter < slideTime + stayTime + slideTime) {
            popUp.position.y = startVal + endChange - easeInQuad((counter - slideTime - stayTime) / slideTime) * endChange;
        } else {
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
