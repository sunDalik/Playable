import * as PIXI from "pixi.js";
import {Game} from "../game";
import {setTickTimeout} from "../utils/game_utils";
import {easeOutQuad} from "../utils/math_utils";
import {bottomColor, topColor} from "./menu";

const menuButtonWidth = 250;
const menuButtonHeight = 70;
const buttonOffset = 25;
const buttonFontSize = 28;
const playerSelectorOffsetX = 20;
const buttonLineWidth = 4;
const buttonAnimationTime = 20;

export function createSimpleButtonSet(buttonTexts, container, startOffsetY, chooseFirst = true, fontSize = buttonFontSize, buttonWidth = menuButtonWidth, buttonHeight = menuButtonHeight) {
    if (!container.buttons) container.buttons = [];
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
                const text = new PIXI.Text(buttonTexts[i], {fontSize: fontSize, fill: color, fontWeight: "bold"});
                text.position.set(button.rect.width / 2 - text.width / 2 - buttonLineWidth / 2, button.rect.height / 2 - text.height / 2 - buttonLineWidth / 2);
                button.addChild(text);
                return text;
            };

            button.rect = button.redrawRect(topColor, bottomColor);
            button.text = button.redrawText(bottomColor);

            container.addChild(button);

            const unchooseAll = () => {
                for (const bt of container.buttons) {
                    if (bt.unchooseButton) bt.unchooseButton();
                }
            };

            button.unchooseButton = () => {
                button.rect = button.redrawRect(topColor, bottomColor);
                button.text = button.redrawText(bottomColor);
                button.chosen = false;
                redrawSelection();
            };

            button.chooseButton = () => {
                if (!container.choosable) return;
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
                if (chooseFirst) button.chooseButton();
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
    for (let i = 0; i < buttons.length; i++) {
        if (i + 1 >= buttons.length) buttons[i].downButton = buttons[0];
        else buttons[i].downButton = buttons[i + 1];

        if (i - 1 < 0) buttons[i].upButton = buttons[buttons.length - 1];
        else buttons[i].upButton = buttons[i - 1];
    }
    return buttons;
}

//double cooooooooooooooode
export function createBackButton(container) {
    const buttonHeight = 55;
    const buttonWidth = 120;
    const arrowOffset = buttonWidth / 4;
    const button = new PIXI.Container();

    button.interactive = true;
    button.buttonMode = true;

    button.redrawRect = (color1, color2) => {
        if (button.rect) button.removeChild(button.rect);
        const rect = new PIXI.Graphics();
        rect.lineStyle(buttonLineWidth, color2);
        rect.beginFill(color1);
        rect.drawPolygon([0, buttonHeight / 2, arrowOffset, buttonHeight, buttonWidth, buttonHeight, buttonWidth, 0, arrowOffset, 0]);
        button.addChild(rect);
        return rect;
    };

    button.redrawText = color => {
        if (button.text) button.removeChild(button.text);
        const text = new PIXI.Text("BACK", {fontSize: 22, fill: color, fontWeight: "bold"});
        text.position.set((button.rect.width - arrowOffset) / 2 + arrowOffset - text.width / 2 - buttonLineWidth / 2, button.rect.height / 2 - text.height / 2 - buttonLineWidth / 2);
        button.addChild(text);
        return text;
    };

    button.rect = button.redrawRect(topColor, bottomColor);
    button.text = button.redrawText(bottomColor);

    container.addChild(button);

    const unchooseAll = () => {
        for (const bt of container.buttons) {
            if (bt.unchooseButton) bt.unchooseButton();
        }
    };

    button.unchooseButton = () => {
        button.rect = button.redrawRect(topColor, bottomColor);
        button.text = button.redrawText(bottomColor);
        button.chosen = false;
    };

    button.chooseButton = () => {
        if (!container.choosable) return;
        unchooseAll();
        button.rect = button.redrawRect(bottomColor, topColor);
        button.text = button.redrawText(topColor);
        button.chosen = true;
    };

    button.on("mouseover", button.chooseButton);

    button.position.x = 50;
    button.position.y = 40;
    return button;
}