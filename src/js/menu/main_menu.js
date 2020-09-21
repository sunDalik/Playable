import {Game} from "../game";
import * as PIXI from "pixi.js";
import {easeInQuad, easeOutQuad} from "../utils/math_utils";
import {randomChoice} from "../utils/random_utils";
import {setTickTimeout} from "../utils/game_utils";
import {createLoadingText, retry, setupGame, stageBeaten} from "../setup";
import {closeBlackBars} from "../drawing/hud_animations";
import {keyboard, keyboardS} from "../keyboard/keyboard_handler";
import {GAME_STATE, PLAY_MODE, STAGE, STORAGE} from "../enums/enums";
import {setupSubSettings} from "./subsettings";
import {createDiscordButton, createSimpleButtonSet, createVersionNumber} from "./menu_common";
import {redrawPauseBG, SUPER_HUD} from "../drawing/super_hud";
import {setupAchievementsScreen, updateAchievementsScreen} from "./achievements_screen";
import {CommonSpriteSheet} from "../loader";
import {isAltStageUnlocked} from "../game_changer";

const ppAnimationTime1 = 35;
const ppAnimationTime2 = 35;
const ppUpAnimationTime = 25;

const playerSize = 270;
const playerOffset = 70;
let player1, player2;

export let menuBgColor = 0x7eb5a6;
export const settingsMenuColor = 0x2c293d;
export const achievementsMenuColor = 0xcfc1a5;
export let currentMenuBgColor = menuBgColor;
let stopTilingAnimation = false;

export function setupMenu() {
    assignRandomMenuColor();
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    Game.state = GAME_STATE.MENU;
    Game.mainMenu = new PIXI.Container();
    Game.menuCommon = new PIXI.Container();
    Game.menuCommon.sortableChildren = true;
    Game.mainMenu.sortableChildren = true;
    Game.mainMenu.choosable = true;
    Game.mainMenu.zIndex = 1;
    Game.app.stage.addChild(Game.mainMenu);
    Game.app.stage.addChild(Game.menuCommon);
    Game.menuCommon.bg = createMenuBG(menuBgColor, -10);
    Game.menuCommon.blackBG = createMenuBG(0x000000, -8);
    Game.menuCommon.tilingBG = createTilingBG();
    animateMenuTilingBG();
    window.addEventListener("resize", () => {
        Game.menuCommon.removeChild(Game.menuCommon.bg);
        Game.menuCommon.bg = createMenuBG(currentMenuBgColor, -10);
        Game.menuCommon.removeChild(Game.menuCommon.tilingBG);
        Game.menuCommon.tilingBG = createTilingBG();
    });
    setupSubSettings();
    setupAchievementsScreen();

    [player1, player2] = createMenuTrianglesAnimation();
    setTickTimeout(() => {
        movePlayersUp([player1, player2]);
        setTickTimeout(() => {
            Game.mainMenu.buttons = createSimpleButtonSet(["PLAY", "TUTORIAL", "SETTINGS", "ACHIEVEMENTS"], Game.mainMenu, playerOffset + playerSize + playerOffset + 20);
            setButtonClickHandlers();
            initMenuKeyBinding();
            const discordButton = createDiscordButton(16);
            Game.mainMenu.buttons.push(discordButton);
            discordButton.leftButton = Game.mainMenu.buttons[0];
            for (const button of Game.mainMenu.buttons) {
                if (button !== discordButton) {
                    button.rightButton = discordButton;
                }
            }
            discordButton.clickButton = () => {
                if (!Game.mainMenu.choosable) return;
                window.open("https://discord.com/invite/KBjcrR6");
            };
            discordButton.on("click", discordButton.clickButton);
            createVersionNumber("v0.34+", 16);
        }, ppUpAnimationTime * 2 / 3);
    }, ppAnimationTime1 + ppAnimationTime2 * 2 / 3);
}

function assignRandomMenuColor() {
    const possibleColors = [0x7eb5a6];
    if (stageBeaten(STAGE.FLOODED_CAVE) >= 1) possibleColors.push(0x727579); // dt color
    if (stageBeaten(STAGE.DARK_TUNNEL) >= 1) possibleColors.push(0xcdccc1); // ru color
    if (isAltStageUnlocked(STAGE.DRY_CAVE)) possibleColors.push(0xf2d16b); // dc color
    menuBgColor = randomChoice(possibleColors);
    currentMenuBgColor = menuBgColor;
}

export function changeBGColor(color) {
    currentMenuBgColor = color;
    createMenuBG(color, -10);
}

export function createMenuBG(color = 0x666666, zIndex = -10) {
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = zIndex;
    Game.menuCommon.addChild(bg);
    return bg;
}

function createTilingBG() {
    const tempContainer = new PIXI.Container();
    const p1 = new PIXI.Sprite(CommonSpriteSheet["player.png"]);
    const p2 = new PIXI.Sprite(CommonSpriteSheet["player2.png"]);
    const pSize = 20;
    p1.scale.x = p1.scale.y = p2.scale.x = p2.scale.y = pSize / p1.width;
    p1.alpha = p2.alpha = 0.08;
    p2.position.set(pSize * 2 / 3, -pSize / 2);
    tempContainer.addChild(p1);
    tempContainer.addChild(p2);
    const offsetX = 0;
    const offsetY = 12;
    const transparency = new PIXI.Graphics();
    transparency.beginFill(0x000000, 0);
    transparency.drawRect(0, 0, p2.position.x + pSize + offsetX, p1.position.y + pSize + offsetY);
    transparency.position.set(p1.position.x - offsetX / 2, p2.position.y - offsetY / 2);
    tempContainer.addChild(transparency);
    const bg = new PIXI.TilingSprite(Game.app.renderer.generateTexture(tempContainer), Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = -9;
    Game.menuCommon.addChild(bg);
    return bg;
}

function animateMenuTilingBG() {
    const stepX = 0.5;
    const stepY = 0.2;
    const animation = delta => {
        Game.menuCommon.tilingBG.tilePosition.x += stepX * delta;
        Game.menuCommon.tilingBG.tilePosition.y -= stepY * delta;
        if (stopTilingAnimation) Game.app.ticker.remove(animation);
    };
    Game.app.ticker.add(animation);
}

export function bringMenuBackToLife() {
    stopTilingAnimation = false;
    animateMenuTilingBG();
}

function createMenuTrianglesAnimation() {
    const p1 = new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture);
    const p2 = new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture);
    p1.anchor.set(0.5, 0.5);
    p2.anchor.set(0.5, 0.5);
    if (Math.random() < 0.5) {
        p1.zIndex = -1;
        p2.zIndex = -2;
    } else {
        p1.zIndex = -2;
        p2.zIndex = -1;
    }
    p1.width = p1.height = p2.width = p2.height = playerSize;
    p1.position.x = p2.position.x = Game.app.renderer.screen.width / 2;
    let p1MoveSign;
    if (Math.random() < 0.5) {
        p1.position.y = -p1.height / 2;
        p1MoveSign = 1;
        p2.position.y = Game.app.renderer.screen.height + p1.height / 2;
    } else {
        p1.position.y = Game.app.renderer.screen.height + p1.height / 2;
        p1MoveSign = -1;
        p2.position.y = -p1.height / 2;
    }
    Game.mainMenu.addChild(p1);
    Game.mainMenu.addChild(p2);

    const p1A = new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture);
    const p2A = new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture);
    p1A.alpha = p2A.alpha = 0.6;
    p1A.zIndex = p1.zIndex - 2;
    p2A.zIndex = p2.zIndex - 2;
    p1A.width = p1A.height = p2A.width = p2A.height = p1.width;
    p1A.anchor.set(0.5, 0.5);
    p2A.anchor.set(0.5, 0.5);
    p1A.visible = p2A.visible = false;
    Game.mainMenu.addChild(p1A);
    Game.mainMenu.addChild(p2A);

    const animationTime = ppAnimationTime1;
    const animationTime2 = ppAnimationTime2;
    const p1StartVal = p1.position.y;
    const p2StartVal = p2.position.y;
    const alphaStartVal = p1A.alpha;
    const sizeStartVal = p1.width;
    const sizeEndChange = p1.width * 1.5;
    const moveEndChange = Game.app.renderer.screen.height - (Game.app.renderer.screen.height - p1.height) / 2;
    let halfChange = false;
    let counter = 0;

    const animation = delta => {
        counter += delta;
        if (counter < animationTime) {
            p1.position.y = p1StartVal + p1MoveSign * moveEndChange * easeInQuad(counter / animationTime);
            p2.position.y = p2StartVal - p1MoveSign * moveEndChange * easeInQuad(counter / animationTime);
        }
        if (counter >= animationTime) {
            if (!halfChange) {
                halfChange = true;
                p1.position.y = p1StartVal + p1MoveSign * moveEndChange;
                p2.position.y = p2StartVal - p1MoveSign * moveEndChange;
                p1A.visible = p2A.visible = true;
                p1A.position.x = p2A.position.x = p1.position.x;
                p1A.position.y = p1.position.y;
                p2A.position.y = p2.position.y;
            }
            Game.menuCommon.blackBG.alpha = 1 - (counter - animationTime) / animationTime2 * 3;
            p1A.alpha = p2A.alpha = alphaStartVal - alphaStartVal * easeOutQuad((counter - animationTime) / animationTime2);
            p1A.width = p2A.width = p1A.height = p2A.height = sizeStartVal + sizeEndChange * easeOutQuad((counter - animationTime) / animationTime2);
        }
        if (counter >= animationTime + animationTime2) {
            Game.mainMenu.removeChild(p1A);
            Game.mainMenu.removeChild(p2A);
            Game.menuCommon.removeChild(Game.menuCommon.blackBG);
            Game.app.ticker.remove(animation);
        }
    };
    Game.app.ticker.add(animation);
    return [p1, p2];
}

function movePlayersUp(players) {
    const animationTime = ppUpAnimationTime;
    const endChange = -players[0].position.y + players[0].height / 2 + playerOffset;
    const startValues = players.map(player => player.position.y);
    let counter = 0;
    const animation = delta => {
        counter += delta;
        for (let i = 0; i < players.length; i++) {
            players[i].position.y = startValues[i] + endChange * easeInQuad(counter / animationTime);
        }
        if (counter >= animationTime) {
            for (let i = 0; i < players.length; i++) {
                players[i].position.y = startValues[i] + endChange;
            }
            Game.app.ticker.remove(animation);
        }
    };
    Game.app.ticker.add(animation);
}

function setButtonClickHandlers() {
    Game.mainMenu.buttons[0].clickButton = () => {
        if (!Game.mainMenu.choosable) return;
        Game.mainMenu.choosable = false;
        closeBlackBars(() => {
            stopTilingAnimation = true;
            Game.mainMenu.visible = false;
            Game.menuCommon.visible = false;
            createLoadingText();
            Game.playMode = PLAY_MODE.NORMAL;
            if (Game.world) retry();
            else setupGame();
        });
    };
    Game.mainMenu.buttons[1].clickButton = () => {
        if (!Game.mainMenu.choosable) return;
        Game.mainMenu.choosable = false;
        closeBlackBars(() => {
            stopTilingAnimation = true;
            Game.mainMenu.visible = false;
            Game.menuCommon.visible = false;
            createLoadingText();
            Game.playMode = PLAY_MODE.TUTORIAL;
            if (Game.world) retry();
            else setupGame();
        });
    };
    Game.mainMenu.buttons[2].clickButton = () => {
        if (!Game.mainMenu.choosable) return;
        Game.mainMenu.visible = false;
        Game.subSettingsInterface.visible = true;
        Game.subSettingsInterface.buttons[1].chooseButton();
        changeBGColor(settingsMenuColor);
    };
    Game.mainMenu.buttons[3].clickButton = () => {
        if (!Game.mainMenu.choosable) return;
        Game.mainMenu.visible = false;
        Game.achievementsInterface.visible = true;
        Game.achievementsInterface.buttons[0].chooseButton();
        changeBGColor(achievementsMenuColor);
        updateAchievementsScreen();
    };

    const spinPlayers = () => {
        if (!Game.mainMenu.choosable) return;
        let sign = randomChoice([-1, 1]);
        for (const player of [player1, player2]) {
            let counter = 0;
            const spinSign = sign;
            sign *= -1;
            const animationTime = 30;

            const animation = delta => {
                counter += delta;
                player.angle = easeOutQuad(counter / animationTime) * 360 * spinSign;
                if (counter >= animationTime) {
                    player.angle = 0;
                    Game.app.ticker.remove(animation);
                }
            };
            Game.app.ticker.add(animation);
        }
    };

    player1.interactive = true;
    player1.on("click", spinPlayers);

    for (let i = 0; i < Game.mainMenu.buttons.length; i++) {
        Game.mainMenu.buttons[i].on("click", Game.mainMenu.buttons[i].clickButton);
    }
}

function initMenuKeyBinding() {
    const getActiveButtonSet = () => {
        if (Game.mainMenu.visible && Game.mainMenu.choosable) return Game.mainMenu.buttons;
        else if (Game.subSettingsInterface.visible) return Game.subSettingsInterface.buttons;
        else if (Game.controlsInterface.visible && Game.controlsInterface.choosable) return Game.controlsInterface.buttons;
        else if (Game.otherSettingsInterface.visible) return Game.otherSettingsInterface.buttons;
        else if (SUPER_HUD.pauseScreen && SUPER_HUD.pauseScreen.visible) return SUPER_HUD.pauseScreen.buttons;
        else if (Game.achievementsInterface.visible) return Game.achievementsInterface.buttons;
        else return null;
    };

    const keyboardClickButton = () => {
        const activeButtons = getActiveButtonSet();
        if (activeButtons === null) return;
        for (const button of activeButtons) {
            if (button.chosen && button.clickButton) {
                button.clickButton();
                break;
            }
        }
    };

    const moveButton = (nextButton) => {
        const activeButtons = getActiveButtonSet();
        if (activeButtons === null) return;
        for (let i = 0; i < activeButtons.length; i++) {
            if (activeButtons[i].chosen && activeButtons[i][nextButton] && activeButtons[i][nextButton].chooseButton) {
                activeButtons[i][nextButton].chooseButton();
                break;
            }
        }
    };

    const moveDownButton = () => moveButton("downButton");
    const moveUpButton = () => moveButton("upButton");
    const moveLeftButton = () => moveButton("leftButton");
    const moveRightButton = () => moveButton("rightButton");

    keyboardS(STORAGE.KEY_MOVE_UP_1P).press = moveUpButton;
    keyboardS(STORAGE.KEY_MOVE_UP_2P).press = moveUpButton;
    keyboardS(STORAGE.KEY_MOVE_LEFT_1P).press = moveLeftButton;
    keyboardS(STORAGE.KEY_MOVE_LEFT_2P).press = moveLeftButton;
    keyboardS(STORAGE.KEY_MOVE_DOWN_1P).press = moveDownButton;
    keyboardS(STORAGE.KEY_MOVE_DOWN_2P).press = moveDownButton;
    keyboardS(STORAGE.KEY_MOVE_RIGHT_1P).press = moveRightButton;
    keyboardS(STORAGE.KEY_MOVE_RIGHT_2P).press = moveRightButton;

    keyboard("Space").press = keyboardClickButton;
    keyboard("Enter").press = keyboardClickButton;
    keyboardS(STORAGE.KEY_PAUSE).press = escapeHandler;
}


function escapeHandler() {
    if (Game.state === GAME_STATE.PLAYING) {
        if (SUPER_HUD.pauseScreen.visible) {
            Game.paused = false;
            SUPER_HUD.pauseScreen.visible = false;
        } else {
            if (Game.subSettingsInterface.visible) {
                Game.subSettingsInterface.buttons[0].clickButton();
            } else if (Game.otherSettingsInterface.visible) {
                Game.otherSettingsInterface.buttons[0].clickButton();
            } else if (Game.controlsInterface.visible) {
                Game.controlsInterface.buttons[0].clickButton();
            } else if (Game.achievementsInterface.visible) {
                Game.achievementsInterface.buttons[0].clickButton();
            } else {
                Game.paused = true;
                SUPER_HUD.pauseScreen.buttons[0].chooseButton();
                SUPER_HUD.pauseScreen.visible = true;
            }
        }
        redrawPauseBG();
    } else if (Game.state === GAME_STATE.MENU) {
        if (Game.subSettingsInterface.visible) {
            Game.subSettingsInterface.buttons[0].clickButton();
        } else if (Game.otherSettingsInterface.visible) {
            Game.otherSettingsInterface.buttons[0].clickButton();
        } else if (Game.controlsInterface.visible) {
            Game.controlsInterface.buttons[0].clickButton();
        } else if (Game.achievementsInterface.visible) {
            Game.achievementsInterface.buttons[0].clickButton();
        }
    }
}