import {HUD, movePlayerHudToContainer} from "./hud_object";
import {Game} from "../game";
import * as PIXI from "pixi.js";
import {getTimeFromMs, setTickTimeout} from "../utils/game_utils";
import {DEATH_FILTER} from "../filters";
import {redrawPauseBG, SUPER_HUD} from "./super_hud";
import {keyboard} from "../keyboard/keyboard_handler";
import {retry} from "../setup";
import {
    BigHUDKeyBindSize,
    HUDTextStyleGameOver,
    HUDTextStyleTitle,
    slotBorderOffsetX,
    slotsColOffset
} from "./draw_constants";
import {SLOT} from "../enums/enums";
import {getKeyBindSymbol, padTime} from "./draw_hud";
import {getRandomTip} from "../menu/tips";
import {removeAllObjectsFromArray} from "../utils/basic_utils";
import {easeInQuad, easeOutQuad} from "../utils/math_utils";
import {CommonSpriteSheet} from "../loader";
import {fadeOutAndDie} from "../animations";
import {removeAllChildrenFromContainer} from "./draw_utils";

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
            removeStageTitle();
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
    getKilledByText(Game.player);
    const killedBys = [getKilledByText(Game.player), getKilledByText(Game.player2)];
    for (const killedBy of killedBys) {
        SUPER_HUD.addChild(killedBy);
    }
    SUPER_HUD.killedBys.map(k => SUPER_HUD.removeChild(k));
    SUPER_HUD.killedBys = killedBys;
    SUPER_HUD.gameOverScreen = gameOverScreen;
    SUPER_HUD.addChild(SUPER_HUD.gameOverScreen);
    SUPER_HUD.gameOverScreen.position.x = Game.app.renderer.screen.width / 2 - SUPER_HUD.gameOverScreen.width / 2;
    SUPER_HUD.gameOverScreen.position.y = Game.app.renderer.screen.height;
    const time = 12;
    const step = (Game.app.renderer.screen.height / 2 + SUPER_HUD.gameOverScreen.height / 2 + 20) / time;
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

    // general game over text
    const topText = victory ? "You won!" : "Game Over";
    const topTextObject = new PIXI.Text(topText, HUDTextStyleGameOver);
    topTextObject.position.x = containerWidth / 2 - topTextObject.width / 2;
    topTextObject.position.y = 0;
    container.addChild(topTextObject);

    // stats
    const time = getTimeFromMs(Game.time);
    const timeString = `${padTime(time.minutes, 1)}:${padTime(time.seconds, 2)}`;
    const entries = [["Level", Game.stage.name],
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
    tip.style.padding = 4;
    tip.position.set(containerWidth / 2 - tip.width / 2, bottomPos + 60);
    container.addChild(tip);

    // key binds
    const keyBind = getBigKey(getKeyBindSymbol(retryButton.code), victory ? "Play again" : "Retry");
    keyBind.position.set(containerWidth - keyBind.width, tip.position.y + tip.height + 65);
    container.addChild(keyBind);

    return container;
}

function getKilledByText(player) {
    const container = new PIXI.Container();
    if (!player.dead) return container;
    let killedByText = "Killed by\n";
    if (player.killedBy && player.killedBy.name) killedByText += player.killedBy.name;
    else killedByText += "Unknown";
    const textObj = new PIXI.Text(killedByText, HUDTextStyleTitle);
    if (player === Game.player) {
        textObj.position.x = slotBorderOffsetX;
        textObj.style.align = "left";
    } else {
        textObj.position.x = Game.app.renderer.screen.width - slotBorderOffsetX - textObj.width;
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

// call it AFTER swapping out weapon and extra slots internally
export function animateHUDWeaponSwapOut(player) {
    const slotsContainer = player === Game.player ? HUD.slots1 : HUD.slots2;
    const containerWeapon = slotsContainer[SLOT.WEAPON];
    const containerExtra = slotsContainer[SLOT.EXTRA];
    containerWeapon.cancelAnimation();
    containerExtra.cancelAnimation();
    for (const cont of [containerWeapon, containerExtra]) {
        const initPositionX = cont === containerWeapon ? containerExtra.sprite.position.x : containerWeapon.sprite.position.x;
        const newPositionX = cont.sprite.position.x;

        let counter = 0;
        const animationTime = 7;

        const animation = delta => {
            counter += delta;
            cont.sprite.position.x = initPositionX + easeOutQuad(counter / animationTime) * (newPositionX - initPositionX);
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                cont.sprite.position.x = newPositionX;
            }
        };
        Game.app.ticker.add(animation);

        cont.cancelAnimation = () => {
            Game.app.ticker.remove(animation);
            cont.sprite.position.x = newPositionX;
        };
    }
}

export function animateHUDBump(player, slot) {
    const container = player === Game.player ? HUD.slots1[slot] : HUD.slots2[slot];
    const sprite = container.sprite.children[0];
    if (!sprite) return;
    container.cancelAnimation();
    const initScale = {x: sprite.scale.x, y: sprite.scale.y};
    const animation = getHUDBumpAnimation(sprite);
    Game.app.ticker.add(animation);

    container.cancelAnimation = () => {
        Game.app.ticker.remove(animation);
        if (!sprite._destroyed) sprite.scale.set(initScale.x, initScale.y);
    };
}

export function animateHUDWeaponLink(player) {
    const slotsContainer = player === Game.player ? HUD.slots1 : HUD.slots2;
    const weaponContainer = slotsContainer[SLOT.WEAPON];
    const chain = new PIXI.Sprite(CommonSpriteSheet["follow_chain.png"]);
    const slot = weaponContainer.slot;
    if (!slot) return;
    chain.anchor.set(0.5, 0.5);
    chain.width = chain.height = slot.width * 0.8;
    chain.angle = 45;
    chain.position.set(slot.position.x + slot.width + slotsColOffset / 2 - 3, slot.position.y + slot.height / 2 - 2);
    setTickTimeout(() => {
        HUD.addChild(chain);
        Game.app.ticker.add(getHUDBumpAnimation(chain, 1.15));
        setTickTimeout(() => {
            fadeOutAndDie(chain, false, 10, HUD);
        }, 6, 99, false);
    }, 4);
}

export function getHUDBumpAnimation(sprite, scaleMul = 1.2) {
    const initScale = sprite.scale.x; //assuming sprite is not distorted lol
    const bigScale = initScale * scaleMul;
    const halfAnimationTime = 4;
    const stayTime = 4;
    let counter = 0;
    const animation = delta => {
        counter += delta;
        if (counter >= halfAnimationTime * 2 + stayTime || sprite._destroyed) {
            Game.app.ticker.remove(animation);
            if (!sprite._destroyed) sprite.scale.set(initScale, initScale);
        } else {
            let newScale;
            if (counter < halfAnimationTime) {
                newScale = initScale + easeInQuad(counter / halfAnimationTime) * (bigScale - initScale);
            } else if (counter < halfAnimationTime + stayTime) {
                newScale = bigScale;
            } else {
                newScale = bigScale - easeInQuad((counter - halfAnimationTime - stayTime) / halfAnimationTime) * (bigScale - initScale);
            }

            sprite.scale.set(newScale, newScale);
        }
    };

    return animation;
}

export function showStageTitle() {
    const container = HUD.stageTitle;
    removeStageTitle();

    const stageName = Game.stage.tier + ". " + Game.stage.name;
    const text = new PIXI.Text(stageName, Object.assign({}, HUDTextStyleTitle, {fontSize: 34, strokeThickness: 3}));
    container.addChild(text);
    text.alpha = 0;
    text.position.set(Game.app.renderer.screen.width / 2 - text.width / 2, Game.app.renderer.screen.height / 5);
    let counter = 0;
    const animationTime = 15;
    const stayTime = 120;

    const initTurns = Game.turns;
    const stayTurns = 2;

    const animation = delta => {
        counter += delta;

        if ((Game.turns >= initTurns + stayTurns || Game.turns < initTurns)
            && counter < animationTime + stayTime) {
            counter = animationTime + stayTime;
        }

        if (counter < animationTime) {
            text.alpha = easeInQuad(counter / animationTime);
        } else if (counter < animationTime + stayTime) {
            text.alpha = 1;
        } else if (counter < animationTime + stayTime + animationTime) {
            text.alpha = 1 - easeInQuad((counter - animationTime - stayTime) / animationTime);
        } else {
            Game.app.ticker.remove(animation);
            text.alpha = 0;
        }
    };

    container.animation = animation;
    Game.app.ticker.add(animation);
}

export function removeStageTitle() {
    const container = HUD.stageTitle;
    if (container.animation) Game.app.ticker.remove(container.animation);
    removeAllChildrenFromContainer(container, true);
}