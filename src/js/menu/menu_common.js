import * as PIXI from "pixi.js";
import {Game} from "../game";
import {setTickTimeout} from "../utils/game_utils";
import {easeOutQuad} from "../utils/math_utils";
import {CommonSpriteSheet, DiscordSpriteSheet} from "../loader";
import {HUDTextStyle, HUDTextStyleTitle} from "../drawing/draw_constants";
import {setMousePrivileges} from "../setup";

export const menuButtonOffsetY = 65;
const playerSelectorOffsetX = 20;
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
                button.position.y = startOffsetY + menuButtonOffsetY * i;
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
            Game.buttons.push(button);
            setMousePrivileges();
        }, i * 4, 99, false);
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
    Game.buttons.push(button);
    setMousePrivileges();
    return button;
}

// double cooooode
//differences: no animation and text checkboxes
export function createCheckboxSet(givenButtons, container, startOffsetY, chooseFirst = true) {
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

    for (let i = 0; i < givenButtons.length; i++) {
        const button = new PIXI.Text(givenButtons[i].text, HUDTextStyle);
        button.checked = givenButtons[i].checked;
        buttons.push(button);

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
            button.position.y = startOffsetY + menuButtonOffsetY * i;
        };

        button.check = () => {
            button.checked = !button.checked;
            button.redrawCheckBox();
        };

        button.redrawCheckBox = () => {
            button.text = givenButtons[i].text + "   ";
            if (i === 0) button.text += "      ";
            else if (i === 1) button.text += "        ";
            else if (i === 2) button.text += "";
            if (button.checked) button.text += "☑";
            else button.text += "☐";
        };

        button.redraw(false);
        button.redrawCheckBox();

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
        Game.buttons.push(button);
        if (chooseFirst) button.chooseButton();
    }
    setMousePrivileges();
    container.addChild(playerSelectors[0]);
    container.addChild(playerSelectors[1]);
    for (let i = 0; i < buttons.length; i++) {
        if (i + 1 >= buttons.length) buttons[i].downButton = buttons[0];
        else buttons[i].downButton = buttons[i + 1];

        if (i - 1 < 0) buttons[i].upButton = buttons[buttons.length - 1];
        else buttons[i].upButton = buttons[i - 1];
    }
    return buttons;
}


// double code double code
export function createDiscordButton(delay = 0) {
    const container = Game.mainMenu;
    if (!container.buttons) container.buttons = [];
    const playerSelectors = [new PIXI.Sprite(CommonSpriteSheet["player.png"]),
        new PIXI.Sprite(CommonSpriteSheet["player2.png"])];
    for (const playerSelector of playerSelectors) {
        playerSelector.anchor.set(0.5, 0.5);
        playerSelector.angle = -90;
        playerSelector.scale.x = playerSelector.scale.y = 0.18;
        container.addChild(playerSelector);
        playerSelector.visible = false;
    }
    const button = new PIXI.Sprite(PIXI.Texture.WHITE);

    const redrawSelection = () => {
        playerSelectors[0].visible = playerSelectors[1].visible = false;
        if (button.chosen) {
            playerSelectors[0].visible = playerSelectors[1].visible = true;
            playerSelectors[0].position.y = playerSelectors[1].position.y = button.position.y + 1; //+1 because of the stroke?? i'm not sure
            playerSelectors[0].position.x = button.position.x - button.width / 2 - playerSelectorOffsetX - playerSelectors[0].width / 2;
            playerSelectors[1].position.x = button.position.x + button.width / 2 + playerSelectorOffsetX + playerSelectors[1].width / 2;
        }
    };


    setTickTimeout(() => {
        button.interactive = true;
        button.buttonMode = true;
        button.anchor.set(0.5, 0.5);
        const bg = new PIXI.Graphics();
        const endScale = 0.20;
        const chosenScale = 0.25;

        const redrawBg = () => {
            bg.clear();
            bg.beginFill(0x7289DA);
            //bg.beginFill(0x2C2F33);
            bg.drawRoundedRect(0, 0, button.width + 20, button.height + 20, 7);
            bg.position.set(button.position.x - bg.width / 2, button.position.y - bg.height / 2);
        };

        button.redraw = selected => {
            // commented is alt variant black+purple
            if (selected) {
                button.texture = DiscordSpriteSheet["Discord-Logo+Wordmark-White.png"];
                //button.texture = DiscordSpriteSheet["Discord-Logo+Wordmark-Color.png"];
                button.scale.set(chosenScale);
            } else {
                button.texture = DiscordSpriteSheet["Discord-Logo-White.png"];
                //button.texture = DiscordSpriteSheet["Discord-Logo-Color.png"];
                button.scale.set(endScale);
            }
            const offsetX = 80;
            const offsetY = 50;
            button.position.x = Game.app.renderer.screen.width - offsetX - button.width / 2;
            button.position.y = Game.app.renderer.screen.height - offsetY - button.height / 2;
            redrawBg();
        };

        container.addChild(button);
        container.addChild(bg);
        bg.zIndex = button.zIndex - 1;

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
            if (!container.choosable || button.chosen) return;
            unchooseAll();
            button.redraw(true);
            button.chosen = true;
            redrawSelection();
        };

        button.on("mouseover", button.chooseButton);

        button.redraw(false);
        button.scale.x = button.scale.y = 0;

        let counter = 0;
        const animation = delta => {
            counter += delta;
            button.scale.x = button.scale.y = easeOutQuad(counter / buttonAnimationTime) * endScale;
            redrawBg();
            if (counter >= buttonAnimationTime) {
                button.scale.x = button.scale.y = endScale;
                redrawBg();
                Game.app.ticker.remove(animation);
            }
        };
        Game.app.ticker.add(animation);
        Game.buttons.push(button);
        setMousePrivileges();
    }, delay, 99, false);
    return button;
}

export function createVersionNumber(version, delay = 0) {
    const container = Game.mainMenu;
    const text = new PIXI.Text(version, HUDTextStyleTitle);
    text.anchor.set(0.5, 0.5);

    setTickTimeout(() => {
        container.addChild(text);

        const offsetX = 80 - 10 - 20; //-20 for some reason
        const offsetY = 50 - 10;
        text.position.x = offsetX + text.width / 2;
        text.position.y = Game.app.renderer.screen.height - offsetY - text.height / 2;
        text.scale.x = text.scale.y = 0;

        let counter = 0;
        const animation = delta => {
            counter += delta;
            text.scale.x = text.scale.y = easeOutQuad(counter / buttonAnimationTime);
            if (counter >= buttonAnimationTime) {
                text.scale.x = text.scale.y = 1;
                Game.app.ticker.remove(animation);
            }
        };
        Game.app.ticker.add(animation);
    }, delay, 99, false);
    return text;
}