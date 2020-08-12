import * as PIXI from "pixi.js";
import {Game} from "../game";
import {setTickTimeout} from "../utils/game_utils";
import {easeOutQuad} from "../utils/math_utils";
import {bottomColor, topColor} from "./main_menu";
import {CommonSpriteSheet} from "../loader";
import {HUDTextStyle} from "../drawing/draw_constants";

const menuButtonWidth = 250;
export const menuButtonHeight = 40;
const buttonOffsetY = 65;
export const menuButtonOffset = 25;
const buttonFontSize = 26;
const playerSelectorOffsetX = 20;
const buttonLineWidth = 4;
const buttonAnimationTime = 15;

export function createSimpleButtonSet(buttonTexts, container, startOffsetY, chooseFirst = true) {
    if (!container.buttons) container.buttons = [];
    const buttons = [];
    const playerSelectors = [new PIXI.Sprite(CommonSpriteSheet["player.png"]),
        new PIXI.Sprite(CommonSpriteSheet["player2.png"])];
    for (const playerSelector of playerSelectors) {
        playerSelector.anchor.set(0.5, 0.5);
        playerSelector.angle = -90;
        playerSelector.scale.x = playerSelector.scale.y = 0.18;
    }

    const redrawSelection = () => {
        playerSelectors[0].visible = playerSelectors[1].visible = false;
        for (const button of buttons) {
            if (button.chosen) {
                playerSelectors[0].visible = playerSelectors[1].visible = true;
                playerSelectors[0].position.y = playerSelectors[1].position.y = button.position.y + 1; //+1 because of the stroke?? i'm not sure
                playerSelectors[0].position.x = button.position.x - button.width / 2 - playerSelectorOffsetX - playerSelectors[0].width / 2;
                playerSelectors[1].position.x = button.position.x + button.width / 2 + playerSelectorOffsetX + playerSelectors[1].width / 2;
                break;
            }
        }
    };

    for (let i = 0; i < buttonTexts.length; i++) {
        const button = new PIXI.Text(buttonTexts[i], HUDTextStyle);
        buttons.push(button);

        setTickTimeout(() => {
            button.interactive = true;
            button.buttonMode = true;
            button.anchor.set(0.5, 0.5);

            button.redraw = selected => {
                button.style.stroke = 0x000000;
                button.style.strokeThickness = 2.5;
                if (selected) {
                    button.style.fontSize = 40;
                    button.style.fill = 0xffffff;
                } else {
                    button.style.fontSize = 35;
                    button.style.fill = 0xababb3;
                }
                button.position.x = Game.app.renderer.screen.width / 2;
                button.position.y = startOffsetY + buttonOffsetY * i;
            };

            button.redraw(false);

            container.addChild(button);

            const unchooseAll = () => {
                for (const bt of container.buttons) {
                    if (bt.unchooseButton) bt.unchooseButton();
                }
            };

            button.unchooseButton = () => {
                button.redraw(false);
                button.chosen = false;
                redrawSelection();
            };

            button.chooseButton = () => {
                if (!container.choosable) return;
                unchooseAll();
                button.redraw(true);
                button.chosen = true;
                redrawSelection();
            };

            button.on("mouseover", button.chooseButton);

            button.scale.x = button.scale.y = 0;
            const startScale = playerSelectors[0].scale.x;
            if (i === 0) {
                for (const playerSelector of playerSelectors) {
                    playerSelector.scale.x = playerSelector.scale.y = 0;
                    container.addChild(playerSelector);
                }
                if (chooseFirst) button.chooseButton();
            }

            let counter = 0;
            const animation = delta => {
                counter += delta;
                button.scale.x = button.scale.y = easeOutQuad(counter / buttonAnimationTime);
                if (i === 0) {
                    playerSelectors[0].scale.x = playerSelectors[0].scale.y = playerSelectors[1].scale.x = playerSelectors[1].scale.y = startScale * easeOutQuad(counter / buttonAnimationTime);
                    redrawSelection();
                }
                if (counter >= buttonAnimationTime) {
                    button.scale.x = button.scale.y = 1;
                    if (i === 0) {
                        playerSelectors[0].scale.x = playerSelectors[0].scale.y = playerSelectors[1].scale.x = playerSelectors[1].scale.y = startScale;
                        redrawSelection();
                    }
                    Game.app.ticker.remove(animation);
                }
            };
            Game.app.ticker.add(animation);
        }, i * 4);
    }
    for (let i = 0; i < buttons.length; i++) {
        if (i + 1 >= buttons.length) buttons[i].downButton = buttons[0];
        else buttons[i].downButton = buttons[i + 1];

        if (i - 1 < 0) buttons[i].upButton = buttons[buttons.length - 1];
        else buttons[i].upButton = buttons[i - 1];
    }
    return buttons;
}

//double cooooooooooooooode
//differences: fontSize, selectorOffsetX, selectorSize, no animation, fixed position
export function createBackButton(container) {
    const backButtonPlayerSelectorOffsetX = 10;
    const playerSelector = new PIXI.Sprite(CommonSpriteSheet["player.png"]);
    playerSelector.anchor.set(0.5, 0.5);
    playerSelector.angle = -90;
    playerSelector.scale.x = playerSelector.scale.y = 0.16;
    container.addChild(playerSelector);

    const redrawSelection = () => {
        playerSelector.visible = false;
        if (button.chosen) {
            playerSelector.visible = true;
            playerSelector.position.y = button.position.y + 1;
            playerSelector.position.x = button.position.x - button.width / 2 - backButtonPlayerSelectorOffsetX - playerSelector.width / 2;
        }
    };

    const button = new PIXI.Text("Back", HUDTextStyle);
    button.interactive = true;
    button.buttonMode = true;
    button.anchor.set(0.5, 0.5);

    button.redraw = selected => {
        button.style.stroke = 0x000000;
        button.style.strokeThickness = 2.5;
        if (selected) {
            button.style.fontSize = 35;
            button.style.fill = 0xffffff;
        } else {
            button.style.fontSize = 30;
            button.style.fill = 0xababb3;
        }
        button.position.x = 90;
        button.position.y = 50;
    };

    button.redraw(false);

    container.addChild(button);

    const unchooseAll = () => {
        for (const bt of container.buttons) {
            if (bt.unchooseButton) bt.unchooseButton();
        }
    };

    button.unchooseButton = () => {
        button.redraw(false);
        button.chosen = false;
        redrawSelection();
    };

    button.chooseButton = () => {
        if (!container.choosable) return;
        unchooseAll();
        button.redraw(true);
        button.chosen = true;
        redrawSelection();
    };

    button.on("mouseover", button.chooseButton);
    return button;
}

export function createCheckboxSet(givenButtons, container, startOffsetY, chooseFirst = true, fontSize = buttonFontSize, buttonWidth = menuButtonWidth + 150, buttonHeight = menuButtonHeight) {
    if (!container.buttons) container.buttons = [];
    const buttons = [];
    const checkBoxSize = buttonHeight - 30;
    const checkBoxOffsetX = (buttonHeight - checkBoxSize) / 2;
    const playerSelectors = [new PIXI.Sprite(Game.resources["src/images/player_hd.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/player2_hd.png"].texture)];
    playerSelectors[0].angle = 90;
    playerSelectors[1].angle = 90;
    playerSelectors[0].anchor.set(0.5, 0.5);
    playerSelectors[1].anchor.set(0.5, 0.5);
    playerSelectors[0].scale.set(1, 1);
    playerSelectors[0].width = playerSelectors[0].height = playerSelectors[1].width = playerSelectors[1].height = buttonHeight;

    const redrawSelection = () => {
        let buttonFound = false;
        for (const button of buttons) {
            if (button.chosen) {
                buttonFound = true;
                playerSelectors[0].visible = playerSelectors[1].visible = true;
                playerSelectors[0].position.y = playerSelectors[1].position.y = button.position.y + (buttonHeight + buttonLineWidth / 2) / 2;
                playerSelectors[0].position.x = button.position.x - playerSelectorOffsetX - playerSelectors[0].width / 2;
                playerSelectors[1].position.x = button.position.x + buttonWidth + playerSelectorOffsetX + playerSelectors[1].width / 2;
                break;
            }
        }
        if (!buttonFound) playerSelectors[0].visible = playerSelectors[1].visible = false;
    };

    for (let i = 0; i < givenButtons.length; i++) {
        const button = new PIXI.Container();
        buttons.push(button);
        button.checked = givenButtons[i].checked;
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
            const text = new PIXI.Text(givenButtons[i].text, {fontSize: fontSize, fill: color, fontWeight: "bold"});
            text.position.set((buttonWidth - checkBoxSize - checkBoxOffsetX * 2) / 2 - text.width / 2 - buttonLineWidth / 2, button.rect.height / 2 - text.height / 2 - buttonLineWidth / 2);
            button.addChild(text);
            return text;
        };

        button.redrawCheckBox = (color1, color2) => {
            if (button.checkBox) button.removeChild(button.checkBox);
            const checkBox = new PIXI.Container();
            const frame = new PIXI.Graphics();
            frame.lineStyle(buttonLineWidth, color2);
            frame.beginFill(color1);
            frame.drawRoundedRect(buttonWidth - checkBoxSize - checkBoxOffsetX, (buttonHeight - checkBoxSize) / 2, checkBoxSize, checkBoxSize, 5);
            const checkMark = new PIXI.Text("✔", {fontSize: fontSize + 7, fill: color2, fontWeight: "bold"});
            checkMark.position.set(buttonWidth - checkBoxOffsetX - checkBoxSize / 2 - checkMark.width / 2, (buttonHeight - checkBoxSize) / 2);
            checkBox.addChild(frame);
            if (button.checked) checkBox.addChild(checkMark);
            button.addChild(checkBox);
            return checkBox;
        };

        button.rect = button.redrawRect(topColor, bottomColor);
        button.text = button.redrawText(bottomColor);
        button.checkBox = button.redrawCheckBox();

        container.addChild(button);

        const unchooseAll = () => {
            for (const bt of container.buttons) {
                if (bt.unchooseButton) bt.unchooseButton();
            }
        };

        button.unchooseButton = () => {
            button.rect = button.redrawRect(topColor, bottomColor);
            button.checkBox = button.redrawCheckBox(topColor, bottomColor);
            button.text = button.redrawText(bottomColor);
            button.chosen = false;
            redrawSelection();
        };

        button.chooseButton = () => {
            if (!container.choosable) return;
            unchooseAll();
            button.rect = button.redrawRect(bottomColor, topColor);
            button.checkBox = button.redrawCheckBox(bottomColor, topColor);
            button.text = button.redrawText(topColor);
            button.chosen = true;
            redrawSelection();
        };

        button.on("mouseover", button.chooseButton);

        button.check = () => {
            button.checked = !button.checked;
            button.checkBox = button.redrawCheckBox(bottomColor, topColor);
        };

        button.position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
        button.position.y = startOffsetY + (buttonHeight + menuButtonOffset) * i;

        if (i === 0) {
            playerSelectors[0].position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
            playerSelectors[1].position.x = Game.app.renderer.screen.width / 2 - button.width / 2;
            playerSelectors[0].position.y = playerSelectors[1].position.y = startOffsetY + (buttonHeight + menuButtonOffset) * i;
            container.addChild(playerSelectors[0]);
            container.addChild(playerSelectors[1]);
            button.chooseButton();
        }

    }
    for (let i = 0; i < buttons.length; i++) {
        if (i + 1 >= buttons.length) buttons[i].downButton = buttons[0];
        else buttons[i].downButton = buttons[i + 1];

        if (i - 1 < 0) buttons[i].upButton = buttons[buttons.length - 1];
        else buttons[i].upButton = buttons[i - 1];
    }
    return buttons;
}