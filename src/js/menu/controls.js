import {Game} from "../game";
import * as PIXI from "pixi.js";
import {drawHUD, getKeyBindSymbol} from "../drawing/draw_hud";
import {GAME_STATE, STORAGE} from "../enums";
import {initLocalStorageKeys} from "../setup";
import {createBackButton, createSimpleButtonSet} from "./menu_common";

export function setupControlSettings() {
    Game.controlsInterface = new PIXI.Container();
    Game.controlsInterface.sortableChildren = true;
    Game.controlsInterface.visible = false;
    Game.controlsInterface.zIndex = 4;
    Game.controlsInterface.choosable = true;
    Game.app.stage.addChild(Game.controlsInterface);
    Game.controlsInterface.buttons = createControlsButtonSet();
    setButtonClickHandlers();
    const resetButton = createSimpleButtonSet(["Reset to default"], Game.controlsInterface, 670, false, 22, 225, 65)[0];
    resetButton.clickButton = () => {
        if (!Game.controlsInterface.choosable) return;
        initLocalStorageKeys(true);
        for (const key of Game.keys) {
            if (key.storageSource !== null) {
                key.isUp = true;
                key.isDown = false;
                key.code = window.localStorage[key.storageSource];
            }
        }
        for (const button of Game.controlsInterface.buttons) {
            if (button.textBinding) {
                button.textBinding.text = getKeyBindSymbol(window.localStorage[button.storageIdentifier]);
            }
        }
        if (Game.state === GAME_STATE.PLAYING) drawHUD();
    };
    resetButton.on("click", resetButton.clickButton);
    Game.controlsInterface.buttons.push(resetButton);
    Game.controlsInterface.buttons[Game.controlsInterface.buttons.length - 3].downButton = Game.controlsInterface.buttons[Game.controlsInterface.buttons.length - 1];
    Game.controlsInterface.buttons[Game.controlsInterface.buttons.length - 2].downButton = Game.controlsInterface.buttons[Game.controlsInterface.buttons.length - 1];
    Game.controlsInterface.buttons[Game.controlsInterface.buttons.length - 1].upButton = Game.controlsInterface.buttons[Game.controlsInterface.buttons.length - 3];

    const backButton = createBackButton(Game.controlsInterface);
    Game.controlsInterface.buttons.unshift(backButton);
    backButton.clickButton = () => {
        Game.subSettingsInterface.visible = true;
        Game.controlsInterface.visible = false;
        Game.subSettingsInterface.buttons[1].chooseButton();
    };
    backButton.on("click", backButton.clickButton);
    backButton.downButton = backButton.rightButton = Game.controlsInterface.buttons[1];
    Game.controlsInterface.buttons[1].leftButton = Game.controlsInterface.buttons[1].upButton = backButton;
    Game.controlsInterface.buttons[2].upButton = backButton;
}

function createControlsButtonSet() {
    Game.controlsInterface.buttons = [];
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

        const unchooseAll = () => {
            for (const bt of Game.controlsInterface.buttons) {
                if (bt.unchooseButton) bt.unchooseButton();
            }
        };

        for (const bt of [buttonL, buttonR]) {
            bt.redrawRect = (show) => redrawRect(bt, show);
            bt.redrawText = (selected) => redrawText(bt, selected);
            bt.chooseButton = () => {
                if (!Game.controlsInterface.choosable) return;
                unchooseAll();
                bt.chosen = true;
                bt.redrawRect(true);
                bt.redrawText(true);
            };
            bt.unchooseButton = () => {
                bt.chosen = false;
                bt.redrawRect(false);
                bt.redrawText(false);
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
        const button = Game.controlsInterface.buttons[i];
        button.clickButton = () => {
            if (!Game.controlsInterface.choosable) return;
            Game.controlsInterface.choosable = false;
            button.textBinding.text = "--";
            const handler = (e) => {
                e.preventDefault();
                Game.controlsInterface.choosable = true;
                button.textBinding.text = getKeyBindSymbol(e.code);
                for (const key of Game.keys) {
                    if (key.storageSource === button.storageIdentifier) {
                        key.isUp = true;
                        key.isDown = false;
                        key.code = e.code;
                    }
                }
                window.localStorage[button.storageIdentifier] = e.code;
                if (Game.state === GAME_STATE.PLAYING) drawHUD();
                window.removeEventListener("keydown", handler);
            };
            window.addEventListener("keydown", handler);
        };

        button.on("click", button.clickButton);
    }
}