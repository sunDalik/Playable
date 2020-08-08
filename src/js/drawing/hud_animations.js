import {HUD, movePlayerHudToContainer} from "./hud_object";
import {Game} from "../game";
import * as PIXI from "pixi.js";
import {getTimeFromMs, setTickTimeout} from "../utils/game_utils";
import {DEATH_FILTER} from "../filters";
import {redrawPauseBG, SUPER_HUD} from "./super_hud";
import {keyboard} from "../keyboard/keyboard_handler";
import {retry} from "../setup";
import {BigHUDKeyBindSize, HUDTextStyleGameOver, HUDTextStyleTitle, slotBorderOffsetX} from "./draw_constants";
import {CommonSpriteSheet} from "../loader";
import {EQUIPMENT_TYPE} from "../enums/enums";
import {getKeyBindSymbol, padTime} from "./draw_hud";
import {ENCHANTMENT_TYPE} from "../enums/enchantments";
import {getEnchantmentFilters} from "../game_logic";
import {getRandomTip} from "../menu/tips";
import {removeAllObjectsFromArray} from "../utils/basic_utils";

const blackBarLeft = initBlackBar();
const blackBarRight = initBlackBar();
const blackBarMoveAnimationTime = 18;

function initBlackBar() {
    const blackBar = new PIXI.Graphics();
    blackBar.beginFill(0x000000);
    blackBar.drawRect(0, 0, 1, 1);
    blackBar.zIndex = 10;
    blackBar.visible = false;
    SUPER_HUD.addChild(blackBar);
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
            if (Game.player) {
                Game.player.cancelAnimation();
                Game.player2.cancelAnimation();
            }
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

export function pullUpGameOverScreen(victory = false) {
    Game.gameOver = true;
    removeAllObjectsFromArray(DEATH_FILTER, Game.world.filters);
    removeAllObjectsFromArray(DEATH_FILTER, HUD.filters);
    redrawPauseBG();
    SUPER_HUD.removeChild(SUPER_HUD.gameOverScreen);
    const gameOverScreen = createGameOverScreen(victory);
    movePlayerHudToContainer(SUPER_HUD);
    SUPER_HUD.gameOverScreen = gameOverScreen;
    SUPER_HUD.addChild(SUPER_HUD.gameOverScreen);
    SUPER_HUD.gameOverScreen.position.x = Game.app.renderer.screen.width / 2 - SUPER_HUD.gameOverScreen.width / 2;
    SUPER_HUD.gameOverScreen.position.y = Game.app.renderer.screen.height;
    const time = 14;
    const step = (Game.app.renderer.screen.height / 2 + SUPER_HUD.gameOverScreen.height / 2) / time;
    let counter = 0;

    retryButton.press = () => {
        retryButton.press = null;
        retry();
    };

    const animation = delta => {
        counter += delta;
        gameOverScreen.position.y -= step * delta;

        if (gameOverScreen !== SUPER_HUD.gameOverScreen) {
            Game.app.ticker.remove(animation);
        }
        if (counter >= time) {
            Game.app.ticker.remove(animation);
            gameOverScreen.position.y = Game.app.renderer.screen.height - step * time;
        }
    };
    Game.app.ticker.add(animation);
}

function createGameOverScreen(victory = false) {
    const container = new PIXI.Container();
    const containerWidth = Game.app.renderer.screen.width / 3;

    // killed by
    for (const player of [Game.player, Game.player2]) {
        if (!player.dead) continue;
        let killedByText = "Killed by\n";
        if (player.killedBy && player.killedBy.name) killedByText += player.killedBy.name;
        else killedByText += "Unknown";
        const textObj = new PIXI.Text(killedByText, HUDTextStyleTitle);
        if (player === Game.player) {
            textObj.position.x = slotBorderOffsetX;
            textObj.style.align = "left";
        } else {
            textObj.position.x = screen.width - slotBorderOffsetX - textObj.width;
            textObj.style.align = "right";
        }
        textObj.position.y = HUD.slots1.position.y + HUD.slots1.height + 35 + 70;
        container.addChild(textObj);

        if (player.killedBy && player.killedBy.texture && player.killedBy.texture !== PIXI.Texture.WHITE) {
            const killedBySprite = new PIXI.Sprite(player.killedBy.texture);
            const spriteHeight = 65;
            killedBySprite.scale.y = spriteHeight / killedBySprite.height;
            killedBySprite.scale.x = killedBySprite.scale.y;
            killedBySprite.position.y = textObj.position.y + textObj.height + 10;
            if (player === Game.player) {
                killedBySprite.position.x = textObj.position.x;
            } else {
                killedBySprite.position.x = textObj.position.x + textObj.width - killedBySprite.width;
            }
            container.addChild(killedBySprite);
        }
    }


    // general game over text
    const topText = victory ? "You won!" : "Game Over";
    const topTextObject = new PIXI.Text(topText, HUDTextStyleGameOver);
    topTextObject.position.x = containerWidth / 2 - topTextObject.width / 2;
    topTextObject.position.y = 0;
    container.addChild(topTextObject);

    // stats
    const time = getTimeFromMs(Game.time);
    const timeString = `${padTime(time.minutes, 1)}:${padTime(time.seconds, 2)}`;
    const entries = [["Level", Game.stage],
        ["Time", timeString],
        ["Creatures Slain", Game.enemiesKilled]];
    const initPosY = topTextObject.position.y + topTextObject.height + 40;
    let bottomPos = 0;
    for (let i = 0; i < entries.length; i++) {
        const leftText = new PIXI.Text(entries[i][0], HUDTextStyleGameOver);
        const rightText = new PIXI.Text(entries[i][1], HUDTextStyleGameOver);
        leftText.position.x = 0;
        rightText.position.x = containerWidth - rightText.width;
        leftText.position.y = rightText.position.y = initPosY + 40 * (i + 1);
        container.addChild(leftText);
        container.addChild(rightText);

        bottomPos = leftText.position.y + leftText.height;
    }

    // random tip
    const tip = new PIXI.Text(getRandomTip(), HUDTextStyleTitle);
    tip.style.fontStyle = "italic";
    tip.style.wordWrap = true;
    tip.style.wordWrapWidth = containerWidth;
    tip.position.set(containerWidth / 2 - tip.width / 2, bottomPos + 60);
    container.addChild(tip);

    // key binds
    const keyBind = getBigKey(getKeyBindSymbol(retryButton.code), victory ? "Play again" : "Retry");
    keyBind.position.set(containerWidth - keyBind.width, tip.position.y + tip.height + 70);
    container.addChild(keyBind);

    return container;
}

function getBigKey(keyBind, label) {
    const key = new PIXI.Container();
    const text = new PIXI.Text(keyBind, HUDTextStyleTitle);
    const rect = new PIXI.Graphics();
    rect.beginFill(0xffffff);
    rect.lineStyle(3, 0xaaaaaa, 1, 1);
    const rectHeight = BigHUDKeyBindSize;
    let rectWidth = rectHeight;
    if (keyBind.length > 1) rectWidth = text.width + 10;
    rect.drawRect(0, 0, rectWidth, rectHeight);
    rect.endFill();
    text.position.set((rectWidth - text.width) / 2, (rectHeight - text.height) / 2);
    key.addChild(rect);
    key.addChild(text);
    const labelObject = new PIXI.Text(label, HUDTextStyleTitle);
    labelObject.position.x = rect.position.x + rect.width + 10;
    labelObject.position.y = rectHeight / 2 - labelObject.height / 2;
    key.addChild(labelObject);
    return key;
}