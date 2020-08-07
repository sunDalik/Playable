import {HUD} from "./hud_object";
import {Game} from "../game";
import * as PIXI from "pixi.js";
import {getTimeFromMs, setTickTimeout} from "../utils/game_utils";
import {GAME_OVER_BLUR_FILTER} from "../filters";
import {SUPER_HUD} from "./super_hud";
import {keyboard} from "../keyboard/keyboard_handler";
import {retry} from "../setup";
import {BigHUDKeyBindSize, HUDTextStyleGameOver, HUDTextStyleTitle} from "./draw_constants";
import {CommonSpriteSheet} from "../loader";
import {EQUIPMENT_TYPE} from "../enums/enums";
import {getKeyBindSymbol, padTime} from "./draw_hud";
import {ENCHANTMENT_TYPE} from "../enums/enchantments";
import {getEnchantmentFilters} from "../game_logic";

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
    SUPER_HUD.removeChild(SUPER_HUD.gameOverScreen);
    const gameOverScreen = createGameOverScreen(victory);
    SUPER_HUD.gameOverScreen = gameOverScreen;
    SUPER_HUD.addChild(SUPER_HUD.gameOverScreen);

    Game.world.filters.push(GAME_OVER_BLUR_FILTER);
    HUD.filters.push(GAME_OVER_BLUR_FILTER);
    GAME_OVER_BLUR_FILTER.blur = 0;
    SUPER_HUD.gameOverScreen.position.x = Game.app.renderer.screen.width / 2 - SUPER_HUD.gameOverScreen.width / 2;
    SUPER_HUD.gameOverScreen.position.y = Game.app.renderer.screen.height;
    const time = 10;
    const step = (Game.app.renderer.screen.height / 2 + SUPER_HUD.gameOverScreen.height / 2) / time;
    const blurStep = GAME_OVER_BLUR_FILTER.maxBlur / time;
    let counter = 0;

    retryButton.press = () => {
        retryButton.press = null;
        retry();
    };

    const animation = delta => {
        counter += delta;
        gameOverScreen.position.y -= step * delta;
        GAME_OVER_BLUR_FILTER.blur += blurStep;

        if (gameOverScreen !== SUPER_HUD.gameOverScreen) {
            Game.app.ticker.remove(animation);
        }
        if (counter >= time) {
            Game.app.ticker.remove(animation);
            GAME_OVER_BLUR_FILTER.blur = GAME_OVER_BLUR_FILTER.maxBlur;
            gameOverScreen.position.y = Game.app.renderer.screen.height / 2 - gameOverScreen.height / 2;
        }
    };
    Game.app.ticker.add(animation);
}

function createGameOverScreen(victory = false) {
    // todo tip

    const container = new PIXI.Container();

    // fix container size
    const screen = {width: Game.app.renderer.screen.width, height: Game.app.renderer.screen.height};
    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.alpha = 0.0001;
    bg.tint = 0x00000;
    bg.width = screen.width;
    bg.height = screen.height;
    container.addChild(bg);

    // triangles
    const triangleOffsetY = 50;
    const triangleOffsetX = 100;
    const triangleWhite = new PIXI.Sprite(CommonSpriteSheet["player.png"]);
    const triangleBlack = new PIXI.Sprite(CommonSpriteSheet["player2.png"]);
    for (const triangle of [triangleWhite, triangleBlack]) {
        triangle.scale.set(0.3, 0.3);
        triangle.position.x = triangleOffsetX;
        triangle.position.y = triangleOffsetY;
        container.addChild(triangle);
    }
    triangleBlack.position.x = screen.width - triangleBlack.width - triangleOffsetX;

    // equipment lists
    let triangleWhiteBottomPos = triangleWhite.position.y + triangleWhite.height;
    let triangleBlackBottomPos = triangleBlack.position.y + triangleBlack.height;
    for (const player of [Game.player, Game.player2]) {
        const triangleSprite = player === Game.player ? triangleWhite : triangleBlack;
        let itemsPerRow = 2;
        let itemSize = 60;
        const equipmentList = player.getEquipment().concat(player.consumedItems).filter(eq => eq !== null && eq.equipmentType !== EQUIPMENT_TYPE.BAG_ITEM);
        if (Math.ceil(equipmentList.length / itemsPerRow) * itemSize > screen.height * 2 / 3) {
            itemsPerRow = 3;
            itemSize = 50;
        }
        let row = 0;
        let col = 0;
        for (const eq of equipmentList) {
            const equipmentSprite = new PIXI.Sprite(eq.texture);
            if (eq.enchantment && eq.enchantment !== ENCHANTMENT_TYPE.NONE) {
                equipmentSprite.filters = getEnchantmentFilters(eq.enchantment);
            }
            equipmentSprite.width = equipmentSprite.height = itemSize;
            equipmentSprite.position.y = triangleSprite.position.y + triangleSprite.height + 15 + itemSize * row;
            equipmentSprite.position.x = triangleSprite.position.x + triangleSprite.width / 2 - itemsPerRow / 2 * itemSize + itemSize * col;
            col++;
            if (col + 1 > itemsPerRow) {
                col = 0;
                row++;
            }
            container.addChild(equipmentSprite);
            if (triangleSprite === triangleWhite) triangleWhiteBottomPos = equipmentSprite.position.y + equipmentSprite.height;
            else if (triangleSprite === triangleBlack) triangleBlackBottomPos = equipmentSprite.position.y + equipmentSprite.height;
        }
    }

    // killed by
    for (const player of [Game.player, Game.player2]) {
        if (!player.dead) continue;
        const bottomPos = player === Game.player ? triangleWhiteBottomPos : triangleBlackBottomPos;
        const playerSprite = player === Game.player ? triangleWhite : triangleBlack;
        let killedByText = "Killed by\n";
        if (player.killedBy && player.killedBy.name) killedByText += player.killedBy.name;
        else killedByText += "Unknown";
        const textObj = new PIXI.Text(killedByText, HUDTextStyleTitle);
        textObj.position.x = playerSprite.position.x + playerSprite.width / 2 - textObj.width / 2;
        textObj.position.y = bottomPos + 20;
        container.addChild(textObj);
    }


    // general game over text
    const topText = victory ? "You won!" : "Game Over";
    const topTextObject = new PIXI.Text(topText, HUDTextStyleGameOver);
    topTextObject.position.x = container.width / 2 - topTextObject.width / 2;
    topTextObject.position.y = 60;
    container.addChild(topTextObject);

    // stats
    const centralWidth = screen.width / 3;
    const time = getTimeFromMs(Game.time);
    const timeString = `${padTime(time.minutes, 1)}:${padTime(time.seconds, 2)}`;
    const entries = [["Level", Game.stage],
        ["Time", timeString],
        ["Creatures Slain", Game.enemiesKilled]];
    const initPosY = topTextObject.position.y + topTextObject.height + 100;
    let bottomPos = 0;
    for (let i = 0; i < entries.length; i++) {
        const leftText = new PIXI.Text(entries[i][0], HUDTextStyleGameOver);
        const rightText = new PIXI.Text(entries[i][1], HUDTextStyleGameOver);
        leftText.position.x = screen.width / 2 - centralWidth / 2;
        rightText.position.x = screen.width / 2 + centralWidth / 2 - rightText.width;
        leftText.position.y = rightText.position.y = initPosY + 40 * (i + 1);
        container.addChild(leftText);
        container.addChild(rightText);

        bottomPos = leftText.position.y + leftText.height;
    }

    // key binds
    const keyBind = getBigKey(getKeyBindSymbol(retryButton.code), "Retry");
    keyBind.position.set(screen.width / 2 + centralWidth / 2 - keyBind.width, bottomPos + 100);
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