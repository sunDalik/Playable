import {Game} from "../game";
import * as PIXI from "pixi.js";
import {getKeyBindSymbol} from "../drawing/draw_hud";
import {STORAGE} from "../enums";

export function setupControlSettings() {
    Game.controlsInterface = new PIXI.Container();
    Game.controlsInterface.sortableChildren = true;
    Game.controlsInterface.visible = false;
    Game.controlsInterface.zIndex = 4;
    Game.controlsInterface.choosable = true;
    Game.app.stage.addChild(Game.controlsInterface);
    Game.controlsInterface.buttons = createControlsButtonSet();
    setButtonClickHandlers();
}

function createControlsButtonSet() {
    const buttonTexts = [
        [STORAGE.KEY_MOVE_UP_1P, "UP", STORAGE.KEY_MOVE_UP_2P],
        [STORAGE.KEY_MOVE_LEFT_1P, "LEFT", STORAGE.KEY_MOVE_LEFT_2P],
        [STORAGE.KEY_MOVE_DOWN_1P, "DOWN", STORAGE.KEY_MOVE_DOWN_2P],
        [STORAGE.KEY_MOVE_RIGHT_1P, "RIGHT", STORAGE.KEY_MOVE_RIGHT_2P],
        [STORAGE.KEY_WEAPON_1P, "WEAPON", STORAGE.KEY_WEAPON_2P],
        [STORAGE.KEY_EXTRA_1P, "EXTRA", STORAGE.KEY_EXTRA_2P],
        [STORAGE.KEY_BAG_1P, "BAG", STORAGE.KEY_BAG_2P],
        [STORAGE.KEY_MAGIC_1_1P, "MAGIC 1", STORAGE.KEY_MAGIC_1_2P],
        [STORAGE.KEY_MAGIC_2_1P, "MAGIC 2", STORAGE.KEY_MAGIC_2_2P],
        [STORAGE.KEY_MAGIC_3_1P, "MAGIC 3", STORAGE.KEY_MAGIC_3_2P]];
    const buttons = [];
    const textWidth = 160;
    const keyBindWidth = 100;
    const buttonHeight = 45;
    const buttonOffsetX = 40;
    const buttonOffsetY = 10;
    const overallWidth = keyBindWidth * 2 + textWidth + buttonOffsetX * 2;
    const initialButtonOffsetX = Game.app.renderer.screen.width / 2 - overallWidth / 2;
    const playerIconSize = 50;
    const playerIconOffsetY = 20;
    const initialButtonOffsetY = playerIconSize + playerIconOffsetY * 2;
    const bg = new PIXI.Graphics();
    bg.beginFill(0x494470, 0.85);
    const bgPadding = 100;
    bg.drawRect(initialButtonOffsetX - bgPadding, 0, overallWidth + bgPadding * 2, Game.app.renderer.screen.height);
    bg.zIndex = -3;
    Game.controlsInterface.addChild(bg);
    for (let i = 0; i < buttonTexts.length; i++) {
        const buttonSet = buttonTexts[i];
        const textStyle = {fill: 0xffffff, fontWeight: "bold", fontSize: 22, stroke: 0x000000, strokeThickness: 4};
        const keyBindP1 = new PIXI.Text(getKeyBindSymbol(window.localStorage[buttonSet[0]]), textStyle);
        const keyBindName = new PIXI.Text(buttonSet[1], textStyle);
        const keyBindP2 = new PIXI.Text(getKeyBindSymbol(window.localStorage[buttonSet[2]]), textStyle);
        keyBindP1.position.set(initialButtonOffsetX + keyBindWidth / 2 - keyBindP1.width / 2, initialButtonOffsetY + i * (buttonHeight + buttonOffsetY) + buttonHeight / 2 - keyBindP1.height / 2);
        keyBindName.position.set(initialButtonOffsetX + keyBindWidth + buttonOffsetX + textWidth / 2 - keyBindName.width / 2, initialButtonOffsetY + i * (buttonHeight + buttonOffsetY) + buttonHeight / 2 - keyBindName.height / 2);
        keyBindP2.position.set(initialButtonOffsetX + (keyBindWidth + buttonOffsetX) + (textWidth + buttonOffsetX) + keyBindWidth / 2 - keyBindP2.width / 2, initialButtonOffsetY + i * (buttonHeight + buttonOffsetY) + buttonHeight / 2 - keyBindP2.height / 2);
        if (i === 0) {
            const player1 = new PIXI.Sprite(Game.resources["src/images/player.png"].texture);
            const player2 = new PIXI.Sprite(Game.resources["src/images/player2.png"].texture);
            player1.width = player1.height = player2.width = player2.height = playerIconSize;
            player1.position.x = keyBindP1.position.x + keyBindP1.width / 2 - player1.width / 2;
            player2.position.x = keyBindP2.position.x + keyBindP2.width / 2 - player2.width / 2;
            player1.position.y = player2.position.y = playerIconOffsetY;
            Game.controlsInterface.addChild(player1);
            Game.controlsInterface.addChild(player2);
        }

        Game.controlsInterface.addChild(keyBindP1);
        Game.controlsInterface.addChild(keyBindName);
        Game.controlsInterface.addChild(keyBindP2);

        const buttonL = new PIXI.Container();
        const buttonR = new PIXI.Container();
        buttonL.hitArea = new PIXI.Rectangle(initialButtonOffsetX - bgPadding, initialButtonOffsetY + i * (buttonHeight + buttonOffsetY) - buttonOffsetY / 2, keyBindWidth + buttonOffsetX + bgPadding, buttonHeight + buttonOffsetY / 2);
        buttonR.hitArea = new PIXI.Rectangle(Game.app.renderer.screen.width - initialButtonOffsetX - buttonOffsetX - keyBindWidth, initialButtonOffsetY + i * (buttonHeight + buttonOffsetY) - buttonOffsetY / 2, keyBindWidth + buttonOffsetX + bgPadding, buttonHeight + buttonOffsetY / 2);
        buttonL.rectCoords = {x: initialButtonOffsetX, y: initialButtonOffsetY + i * (buttonHeight + buttonOffsetY)};
        buttonR.rectCoords = {
            x: Game.app.renderer.screen.width - initialButtonOffsetX - buttonOffsetX - keyBindWidth - textWidth,
            y: initialButtonOffsetY + i * (buttonHeight + buttonOffsetY)
        };
        buttonL.textBinding = keyBindP1;
        buttonR.textBinding = keyBindP2;
        buttonL.textName = buttonR.textName = keyBindName;
        buttonL.selectFillColor = 0xffffff;
        buttonL.selectLineColor = 0x000000;
        buttonR.selectFillColor = 0x000000;
        buttonR.selectLineColor = 0xffffff;
        buttonL.storageIdentifier = buttonSet[0];
        buttonR.storageIdentifier = buttonSet[2];

        const redrawRect = (button, show) => {
            if (button.rect) Game.controlsInterface.removeChild(button.rect);
            if (show) {
                const rect = new PIXI.Graphics();
                rect.lineStyle(4, button.selectLineColor);
                rect.beginFill(button.selectFillColor);
                rect.drawRoundedRect(button.rectCoords.x, button.rectCoords.y - 2 - buttonOffsetY / 4, keyBindWidth + textWidth + buttonOffsetX, buttonHeight + buttonOffsetY / 2, 5);
                rect.zIndex = -2;
                Game.controlsInterface.addChild(rect);
                button.rect = rect;
            }
        };

        const redrawText = (button, selected) => {
            if (selected) {
                button.textBinding.style.fill = button.textName.style.fill = button.selectLineColor;
                button.textBinding.style.strokeThickness = button.textName.style.strokeThickness = 0;
            } else {
                button.textBinding.style.fill = button.textName.style.fill = 0xffffff;
                button.textBinding.style.strokeThickness = button.textName.style.strokeThickness = 4;
            }
        };

        const unchoose = () => {
            for (const bt of buttons) {
                if (bt.chosen) {
                    bt.chosen = false;
                    bt.redrawRect(false);
                    bt.redrawText(false);
                    break;
                }
            }
        };

        for (const bt of [buttonL, buttonR]) {
            bt.redrawRect = (show) => redrawRect(bt, show);
            bt.redrawText = (selected) => redrawText(bt, selected);
            bt.chooseButton = () => {
                if (!Game.controlsInterface.choosable) return;
                unchoose();
                bt.chosen = true;
                bt.redrawRect(true);
                bt.redrawText(true);
            };
            bt.on("mouseover", bt.chooseButton);
            bt.buttonMode = true;
            bt.interactive = true;
            buttons.push(bt);
            Game.controlsInterface.addChild(bt);
        }

        if (i === 0) buttonL.chooseButton();
    }
    for (let i = 0; i < buttons.length; i++) {
        if (i % 2 === 0) buttons[i].rightButton = buttons[i + 1];
        else buttons[i].leftButton = buttons[i - 1];
        if (i - 2 >= 0) buttons[i].upButton = buttons[i - 2];
        else buttons[i].upButton = buttons[buttons.length - 1 - Math.abs(i % 2 - 1)];
        if (i + 2 < buttons.length) buttons[i].downButton = buttons[i + 2];
        else buttons[i].downButton = buttons[i % 2];
    }

    return buttons
}

function setButtonClickHandlers() {
    for (let i = 0; i < Game.controlsInterface.buttons.length; i++) {
        Game.controlsInterface.buttons[i].clickButton = () => {
            if (!Game.controlsInterface.choosable) return;
            Game.controlsInterface.choosable = false;
            Game.controlsInterface.buttons[i].textBinding.text = "--";
            const handler = (e) => {
                Game.controlsInterface.choosable = true;
                Game.controlsInterface.buttons[i].textBinding.text = getKeyBindSymbol(e.code);
                window.removeEventListener("keydown", handler);
            };
            window.addEventListener("keydown", handler);
        };

        Game.controlsInterface.buttons[i].on("click", Game.controlsInterface.buttons[i].clickButton);
    }
}