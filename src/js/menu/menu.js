import {Game} from "../game";
import * as PIXI from "pixi.js";
import {easeInQuad, easeOutQuad} from "../utils/math_utils";
import {randomChoice} from "../utils/random_utils";
import {BG_COLORS} from "../game_changer";
import {setTickTimeout} from "../utils/game_utils";
import {createLoadingText, setupGame} from "../setup";
import {closeBlackBars} from "../drawing/hud_animations";
import {keyboard} from "../keyboard/keyboard_handler";
import {GAME_STATE, STORAGE} from "../enums";
import {setupSubSettings} from "./subsettings";

const ppAnimationTime1 = 35;
const ppAnimationTime2 = 35;
const ppUpAnimationTime = 25;

const playerSize = 300;
const playerOffset = 75;
let topColor = 0x000000;
let bottomColor = 0xffffff;
let player1, player2;

export const menuBgColor = randomChoice([BG_COLORS.FLOODED_CAVE, BG_COLORS.DARK_TUNNEL]);
export const settingsMenuColor = 0x2c293d;
export let currentMenuBgColor = menuBgColor;
let stopTilingAnimation = false;

const buttonWidth = 250;
const buttonHeight = 70;
const buttonOffset = 25;
const playerSelectorOffsetX = 20;
const buttonLineWidth = 4;
const buttonAnimationTime = 20;

export function setupMenu() {
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
    animateTilingBG();
    window.addEventListener("resize", () => {
        Game.menuCommon.removeChild(Game.menuCommon.bg);
        Game.menuCommon.bg = createMenuBG(currentMenuBgColor, -10);
        Game.menuCommon.removeChild(Game.menuCommon.tilingBG);
        Game.menuCommon.tilingBG = createTilingBG();
    });
    setupSubSettings();

    [player1, player2] = createMenuTrianglesAnimation();
    setTickTimeout(() => {
        movePlayersUp([player1, player2]);
        setTickTimeout(() => {
            Game.mainMenu.buttons = createSimpleButtonSet(["PLAY", "SETTINGS(wip)", "SPIN"], Game.mainMenu, playerOffset + playerSize + playerOffset);
            setButtonClickHandlers();
            initMenuKeyBinding();
        }, ppUpAnimationTime * 2 / 3);
    }, ppAnimationTime1 + ppAnimationTime2 * 2 / 3);
}

function createMenuBG(color = 0x666666, zIndex = -10) {
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = zIndex;
    Game.menuCommon.addChild(bg);
    return bg;
}

function createTilingBG() {
    const tempContainer = new PIXI.Container();
    const p1 = new PIXI.Sprite(Game.resources["src/images/player.png"].texture);
    const p2 = new PIXI.Sprite(Game.resources["src/images/player2.png"].texture);
    const pSize = 20;
    p1.width = p1.height = p2.width = p2.height = pSize;
    p1.alpha = p2.alpha = 0.08;
    p2.position.set(pSize * 2 / 3, -pSize * 2 / 3);
    tempContainer.addChild(p1);
    tempContainer.addChild(p2);
    const bg = new PIXI.TilingSprite(Game.app.renderer.generateTexture(tempContainer), Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = -9;
    Game.menuCommon.addChild(bg);
    return bg;
}

function animateTilingBG() {
    const stepX = 0.5;
    const stepY = 0.2;
    const animation = delta => {
        Game.menuCommon.tilingBG.tilePosition.x += stepX * delta;
        Game.menuCommon.tilingBG.tilePosition.y -= stepY * delta;
        if (stopTilingAnimation) Game.app.ticker.remove(animation);
    };
    Game.app.ticker.add(animation);
}

function createMenuTrianglesAnimation() {
    const p1 = new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture);
    const p2 = new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture);
    p1.anchor.set(0.5, 0.5);
    p2.anchor.set(0.5, 0.5);
    if (Math.random() < 0.5) {
        p1.zIndex = -1;
        p2.zIndex = -2;
        topColor = 0xffffff;
        bottomColor = 0x000000;
    } else {
        p1.zIndex = -2;
        p2.zIndex = -1;
        topColor = 0x000000;
        bottomColor = 0xffffff;
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

export function createSimpleButtonSet(buttonTexts, container, startOffsetY) {
    const buttons = [];
    const playerSelectors = [new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture)];
    playerSelectors[0].angle = 90;
    playerSelectors[1].angle = 90;
    playerSelectors[0].anchor.set(0.5, 0.5);
    playerSelectors[1].anchor.set(0.5, 0.5);
    playerSelectors[0].scale.set(1, 1);
    playerSelectors[0].width = playerSelectors[0].height = playerSelectors[1].width = playerSelectors[1].height = buttonHeight;

    const redrawSelection = () => {
        for (const button of buttons) {
            if (button.chosen) {
                playerSelectors[0].position.y = playerSelectors[1].position.y = button.position.y + (buttonHeight + buttonLineWidth / 2) / 2;
                playerSelectors[0].position.x = button.position.x - playerSelectorOffsetX - playerSelectors[0].width / 2;
                playerSelectors[1].position.x = button.position.x + buttonWidth + playerSelectorOffsetX + playerSelectors[1].width / 2;
                break;
            }
        }
    };

    for (let i = 0; i < buttonTexts.length; i++) {
        const button = new PIXI.Container();
        buttons.push(button);

        setTickTimeout(() => {
            button.interactive = true;
            button.buttonMode = true;

            button.redrawRect = (color1, color2) => {
                if (button.rect) button.removeChild(button.rect);
                const rect = new PIXI.Graphics();
                rect.lineStyle(buttonLineWidth, color2);
                rect.beginFill(color1);
                rect.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
                button.addChild(rect);
                return rect;
            };

            button.redrawText = color => {
                if (button.text) button.removeChild(button.text);
                const text = new PIXI.Text(buttonTexts[i], {fontSize: 30, fill: color, fontWeight: "bold"});
                text.position.set(button.rect.width / 2 - text.width / 2 - buttonLineWidth / 2, button.rect.height / 2 - text.height / 2 - buttonLineWidth / 2);
                button.addChild(text);
                return text;
            };

            button.rect = button.redrawRect(topColor, bottomColor);
            button.text = button.redrawText(bottomColor);

            container.addChild(button);

            const unchooseAll = () => {
                for (const bt of buttons) {
                    if (!bt.redrawRect) continue;
                    bt.rect = bt.redrawRect(topColor, bottomColor);
                    bt.text = bt.redrawText(bottomColor);
                    bt.chosen = false;
                }
            };

            button.chooseButton = () => {
                unchooseAll();
                button.rect = button.redrawRect(bottomColor, topColor);
                button.text = button.redrawText(topColor);
                button.chosen = true;
                redrawSelection();
            };

            button.on("mouseover", button.chooseButton);

            button.scale.x = button.scale.y = 0;
            button.position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
            button.position.y = startOffsetY + (buttonHeight + buttonOffset) * i;

            const startScale = playerSelectors[0].scale.x;
            if (i === 0) {
                playerSelectors[0].scale.x = playerSelectors[0].scale.y = playerSelectors[1].scale.x = playerSelectors[1].scale.y = 0;
                playerSelectors[0].position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                playerSelectors[1].position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                playerSelectors[0].position.y = playerSelectors[1].position.y = startOffsetY + (buttonHeight + buttonOffset) * i;
                container.addChild(playerSelectors[0]);
                container.addChild(playerSelectors[1]);
                button.chooseButton();
            }

            let counter = 0;
            const animation = delta => {
                counter += delta;
                button.scale.x = button.scale.y = easeOutQuad(counter / buttonAnimationTime);
                button.position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                button.position.y = startOffsetY + (buttonHeight + buttonOffset) * i;
                if (i === 0) {
                    playerSelectors[0].scale.x = playerSelectors[0].scale.y = playerSelectors[1].scale.x = playerSelectors[1].scale.y = startScale * easeOutQuad(counter / buttonAnimationTime);
                    redrawSelection();
                }
                if (counter >= buttonAnimationTime) {
                    button.scale.x = button.scale.y = 1;
                    if (i === 0) {
                        playerSelectors[0].scale.x = playerSelectors[0].scale.y = playerSelectors[1].scale.x = playerSelectors[1].scale.y = startScale;
                    }
                    Game.app.ticker.remove(animation);
                }
            };
            Game.app.ticker.add(animation);
        }, i * 5);
    }
    return buttons;
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
            setupGame();
        });
    };
    Game.mainMenu.buttons[1].clickButton = () => {
        if (!Game.mainMenu.choosable) return;
        Game.mainMenu.visible = false;
        Game.subSettingsInterface.visible = true;
        currentMenuBgColor = settingsMenuColor;
        createMenuBG(settingsMenuColor, -10);
    };
    Game.mainMenu.buttons[2].clickButton = () => {
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

    for (let i = 0; i < Game.mainMenu.buttons.length; i++) {
        Game.mainMenu.buttons[i].on("click", Game.mainMenu.buttons[i].clickButton);
    }
}

function initMenuKeyBinding() {
    const keyboardClickButton = () => {
        let activeButtons;
        if (Game.mainMenu.visible && Game.mainMenu.choosable) activeButtons = Game.mainMenu.buttons;
        else if (Game.subSettingsInterface.visible) activeButtons = Game.subSettingsInterface.buttons;
        else return;
        for (const button of activeButtons) {
            if (button.chosen && button.clickButton) {
                button.clickButton();
                break;
            }
        }
    };

    const moveDownButton = () => {
        let activeButtons;
        if (Game.mainMenu.visible && Game.mainMenu.choosable) activeButtons = Game.mainMenu.buttons;
        else if (Game.subSettingsInterface.visible) activeButtons = Game.subSettingsInterface.buttons;
        else return;
        for (let i = 0; i < activeButtons.length; i++) {
            if (activeButtons[i].chosen) {
                activeButtons[(i + 1) % activeButtons.length].chooseButton();
                break;
            }
        }
    };

    const moveUpButton = () => {
        let activeButtons;
        if (Game.mainMenu.visible && Game.mainMenu.choosable) activeButtons = Game.mainMenu.buttons;
        else if (Game.subSettingsInterface.visible) activeButtons = Game.subSettingsInterface.buttons;
        else return;
        for (let i = 0; i < activeButtons.length; i++) {
            if (activeButtons[i].chosen) {
                if (i - 1 < 0) i = activeButtons.length;
                activeButtons[i - 1].chooseButton();
                break;
            }
        }
    };

    keyboard(window.localStorage[STORAGE.KEY_MOVE_DOWN_1P]).press = moveDownButton;
    keyboard(window.localStorage[STORAGE.KEY_MOVE_DOWN_2P]).press = moveDownButton;
    keyboard(window.localStorage[STORAGE.KEY_MOVE_UP_1P]).press = moveUpButton;
    keyboard(window.localStorage[STORAGE.KEY_MOVE_UP_2P]).press = moveUpButton;

    keyboard("Space").press = keyboardClickButton;
    keyboard("Enter").press = keyboardClickButton;
}