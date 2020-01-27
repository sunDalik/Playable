import {Game} from "./game";
import * as PIXI from "pixi.js";
import {easeInQuad, easeOutQuad} from "./utils/math_utils";
import {randomChoice} from "./utils/random_utils";
import {BG_COLORS} from "./game_changer";
import {setTickTimeout} from "./utils/game_utils";
import {createLoadingText, setupGame} from "./setup";
import {closeBlackBars} from "./drawing/hud_animations";
import {keyboard} from "./keyboard/keyboard_handler";
import {STORAGE} from "./enums";

const ppAnimationTime1 = 35;
const ppAnimationTime2 = 35;
const ppUpAnimationTime = 25;

const playerSize = 300;
const playerOffset = 75;
let topColor = 0x000000;
let bottomColor = 0xffffff;
let player1, player2;

export function setupMenu() {
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    Game.menu = new PIXI.Container();
    Game.menu.sortableChildren = true;
    Game.menu.choosable = true;
    Game.app.stage.addChild(Game.menu);
    Game.menu.bg = createMenuBG(randomChoice([BG_COLORS.FLOODED_CAVE, BG_COLORS.DARK_TUNNEL]), -10);
    Game.menu.blackBG = createMenuBG(0x000000, -9);
    [player1, player2] = createMenuTrianglesAnimation();
    setTickTimeout(() => {
        movePlayersUp([player1, player2]);
        setTickTimeout(() => {
            createButtons();
        }, ppUpAnimationTime * 2 / 3);
    }, ppAnimationTime1 + ppAnimationTime2 * 2 / 3);
}

function createMenuBG(color = 0x666666, zIndex = -10) {
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, Game.app.renderer.screen.width, Game.app.renderer.screen.height);
    bg.zIndex = zIndex;
    Game.menu.addChild(bg);
    bg.endFill();
    return bg;
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
    Game.menu.addChild(p1);
    Game.menu.addChild(p2);

    const p1A = new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture);
    const p2A = new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture);
    p1A.alpha = p2A.alpha = 0.6;
    p1A.zIndex = p1.zIndex - 2;
    p2A.zIndex = p2.zIndex - 2;
    p1A.width = p1A.height = p2A.width = p2A.height = p1.width;
    p1A.anchor.set(0.5, 0.5);
    p2A.anchor.set(0.5, 0.5);
    p1A.visible = p2A.visible = false;
    Game.menu.addChild(p1A);
    Game.menu.addChild(p2A);

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
            Game.menu.blackBG.alpha = 1 - (counter - animationTime) / animationTime2 * 3;
            p1A.alpha = p2A.alpha = alphaStartVal - alphaStartVal * easeOutQuad((counter - animationTime) / animationTime2);
            p1A.width = p2A.width = p1A.height = p2A.height = sizeStartVal + sizeEndChange * easeOutQuad((counter - animationTime) / animationTime2);
        }
        if (counter >= animationTime + animationTime2) {
            Game.menu.removeChild(p1A);
            Game.menu.removeChild(p2A);
            Game.menu.removeChild(Game.menu.blackBG);
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

function createButtons() {
    const buttonTexts = ["PLAY", "SETTINGS", "SPIN"];
    const buttons = [];
    const buttonWidth = 220;
    const buttonHeight = 66;
    const buttonOffset = 25;
    const playerOffsetX = 20;
    const lineWidth = 4;
    const animationTime = 20;
    let players;
    if (Math.random() < 0.5) {
        players = [new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture),
            new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture)];
        players[0].angle = 90;
        players[1].angle = 90;
    } else {
        players = [new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture),
            new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture)];
        players[0].angle = -90;
        players[1].angle = -90;
    }
    players[0].anchor.set(0.5, 0.5);
    players[1].anchor.set(0.5, 0.5);
    players[0].scale.set(1, 1);
    players[0].width = players[0].height = players[1].width = players[1].height = buttonHeight;

    const redrawSelection = () => {
        for (const button of buttons) {
            if (button.chosen) {
                players[0].position.y = players[1].position.y = button.position.y + (buttonHeight + lineWidth / 2) / 2;
                players[0].position.x = button.position.x - playerOffsetX - players[0].width / 2;
                players[1].position.x = button.position.x + buttonWidth + playerOffsetX + players[1].width / 2;
                break;
            }
        }
    };

    for (let i = 0; i < buttonTexts.length; i++) {
        setTickTimeout(() => {
            const button = new PIXI.Container();
            button.interactive = true;
            button.buttonMode = true;

            button.redrawRect = (color1, color2) => {
                if (button.rect) button.removeChild(button.rect);
                const rect = new PIXI.Graphics();
                rect.lineStyle(lineWidth, color2);
                rect.beginFill(color1);
                rect.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
                button.addChild(rect);
                return rect;
            };

            button.redrawText = color => {
                if (button.text) button.removeChild(button.text);
                const text = new PIXI.Text(buttonTexts[i], {fontSize: 30, fill: color, fontWeight: "bold"});
                text.position.set(button.rect.width / 2 - text.width / 2 - lineWidth / 2, button.rect.height / 2 - text.height / 2 - lineWidth / 2);
                button.addChild(text);
                return text;
            };

            button.rect = button.redrawRect(topColor, bottomColor);
            button.text = button.redrawText(bottomColor);

            Game.menu.addChild(button);
            buttons.push(button);

            const unchooseAll = () => {
                for (const bt of buttons) {
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

            button.clickButton = () => {
                if (!Game.menu.choosable) return;
                if (i === 0) {
                    Game.menu.choosable = false;
                    closeBlackBars(() => {
                        Game.menu.visible = false;
                        createLoadingText();
                        setupGame();
                    });
                } else if (i === 1) {

                } else if (i === 2) {
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
                }
            };

            button.on("click", button.clickButton);

            button.scale.x = button.scale.y = 0;
            button.position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
            button.position.y = playerOffset + playerSize + playerOffset + (buttonHeight + buttonOffset) * i;

            const startScale = players[0].scale.x;
            if (i === 0) {
                players[0].scale.x = players[0].scale.y = players[1].scale.x = players[1].scale.y = 0;
                players[0].position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                players[1].position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                players[0].position.y = players[1].position.y = playerOffset + playerSize + playerOffset + (buttonHeight + buttonOffset) * i;
                Game.menu.addChild(players[0]);
                Game.menu.addChild(players[1]);
                button.chooseButton();
            }

            let counter = 0;
            const animation = delta => {
                counter += delta;
                button.scale.x = button.scale.y = easeOutQuad(counter / animationTime);
                button.position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                button.position.y = playerOffset + playerSize + playerOffset + (buttonHeight + buttonOffset) * i;
                if (i === 0) {
                    players[0].scale.x = players[0].scale.y = players[1].scale.x = players[1].scale.y = startScale * easeOutQuad(counter / animationTime);
                    redrawSelection();
                }
                if (counter >= animationTime) {
                    button.scale.x = button.scale.y = 1;
                    if (i === 0) {
                        players[0].scale.x = players[0].scale.y = players[1].scale.x = players[1].scale.y = startScale;
                    }
                    Game.app.ticker.remove(animation);
                }
            };
            Game.app.ticker.add(animation);
        }, i * 5);
    }

    const keyboardClickButton = () => {
        if (!Game.menu.visible || !Game.menu.choosable) return;
        for (const button of buttons) {
            if (button.chosen) {
                button.clickButton();
                break;
            }
        }
    };

    const moveDownButton = () => {
        if (!Game.menu.visible || !Game.menu.choosable) return;
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].chosen) {
                buttons[(i + 1) % buttons.length].chooseButton();
                break;
            }
        }
    };

    const moveUpButton = () => {
        if (!Game.menu.visible || !Game.menu.choosable) return;
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].chosen) {
                if (i - 1 < 0) i = buttons.length;
                buttons[i - 1].chooseButton();
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