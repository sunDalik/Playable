import {Game} from "./game";
import * as PIXI from "pixi.js";
import {easeInQuad, easeOutQuad} from "./utils/math_utils";
import {randomChoice} from "./utils/random_utils";
import {BG_COLORS} from "./game_changer";
import {setTickTimeout} from "./utils/game_utils";
import {createLoadingText, setupGame} from "./setup";
import {closeBlackBars} from "./drawing/hud_animations";

const ppAnimationTime1 = 35;
const ppAnimationTime2 = 35;
const ppUpAnimationTime = 25;

const playerSize = 300;
const playerOffset = 75;
let topColor = 0x000000;
let bottomColor = 0xffffff;

export function setupMenu() {
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    Game.menu = new PIXI.Container();
    Game.menu.sortableChildren = true;
    Game.app.stage.addChild(Game.menu);
    Game.menu.bg = createMenuBG(randomChoice([BG_COLORS.FLOODED_CAVE, BG_COLORS.DARK_TUNNEL]), -10);
    Game.menu.blackBG = createMenuBG(0x000000, -9);
    let [player1, player2] = createMenuTrianglesAnimation();
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
    p1.position.x = p2.position.x = Game.app.renderer.screen.width / 2 - p1.width / 2;
    let p1MoveSign;
    if (Math.random() < 0.5) {
        p1.position.y = -p1.height;
        p1MoveSign = 1;
        p2.position.y = Game.app.renderer.screen.height;
    } else {
        p1.position.y = Game.app.renderer.screen.height;
        p1MoveSign = -1;
        p2.position.y = -p1.height;
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
                p1A.position.x = p2A.position.x = p1.position.x + p1A.width / 2;
                p1A.position.y = p1.position.y + p1.height / 2;
                p2A.position.y = p2.position.y + p2.height / 2;
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
    const endChange = -players[0].position.y + playerOffset;
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
    const buttons = ["PLAY", "SETTINGS"];
    const animationTime = 20;

    for (let i = 0; i < buttons.length; i++) {
        setTickTimeout(() => {
            const button = new PIXI.Container();
            button.interactive = true;
            button.buttonMode = true;
            const buttonWidth = 220;
            const buttonHeight = 66;
            const buttonOffset = 25;
            const lineWidth = 4;

            const redrawRect = (color1, color2) => {
                const rect = new PIXI.Graphics();
                rect.lineStyle(lineWidth, color2);
                rect.beginFill(color1);
                rect.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
                button.addChild(rect);
                return rect;
            };

            const redrawText = color => {
                const text = new PIXI.Text(buttons[i], {fontSize: 30, fill: color, fontWeight: "bold"});
                text.position.set(button.rect.width / 2 - text.width / 2 - lineWidth / 2, button.rect.height / 2 - text.height / 2 - lineWidth / 2);
                button.addChild(text);
                return text;
            };

            button.rect = redrawRect(topColor, bottomColor);
            button.text = redrawText(bottomColor);

            Game.menu.addChild(button);
            button.scale.x = button.scale.y = 0;
            button.on("mouseover", () => {
                button.rect = redrawRect(bottomColor, topColor);
                button.text = redrawText(topColor);
            });
            button.on("mouseout", () => {
                button.rect = redrawRect(topColor, bottomColor);
                button.text = redrawText(bottomColor);
            });
            button.on("click", () => {
                if (i === 0) {
                    closeBlackBars(() => {
                        Game.menu.visible = false;
                        createLoadingText();
                        setupGame();
                    });
                }
            });

            let counter = 0;
            const animation = delta => {
                counter += delta;
                button.scale.x = button.scale.y = easeOutQuad(counter / animationTime);
                button.position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
                button.position.y = playerOffset + playerSize + playerOffset + (buttonHeight + buttonOffset) * i;
                if (counter >= animationTime) {
                    button.scale.x = button.scale.y = 1;
                    Game.app.ticker.remove(animation);
                }
            };
            Game.app.ticker.add(animation);
        }, i * 5);
    }
}