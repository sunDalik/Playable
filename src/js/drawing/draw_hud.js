import {Game} from "../game";
import {
    healthBarLength,
    heartBorderOffsetX,
    heartColOffset,
    heartRowOffset,
    heartSize,
    heartYOffset,
    HUDGuideKeyOffsetX,
    HUDGuideKeyOffsetY,
    HUDGuideOffsetX,
    HUDGuideOffsetY,
    HUDKeyBindSize,
    HUDKeyBindTextStyle,
    HUDTextStyle,
    HUDTextStyleSlot,
    HUDTextStyleTitle,
    miniMapBottomOffset,
    slotBorderOffsetX,
    slotContentSizeMargin,
    slotOffsetFromHeartsY,
    slotsColOffset,
    slotSize,
    slotsRowOffset,
    statsOffsetX
} from "./draw_constants";
import * as PIXI from "pixi.js";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "./draw_utils";
import {HUD} from "./hud_object";
import {EQUIPMENT_TYPE, HEAD_TYPE, SHIELD_TYPE, STORAGE} from "../enums";
import {ITEM_OUTLINE_FILTER} from "../filters";
import {getTimeFromMs} from "../utils/game_utils";
import {CommonSpriteSheet} from "../loader";

export function drawHUD() {
    drawHealth();
    drawSlots();
    drawOtherHUD();
    drawMovementKeyBindings();
    drawInteractionKeys();
    redrawFps();
    //redrawEnergy();
    drawSlotsContents();
    redrawSpeedRunTime();
    if (Game.bossFight) Game.boss.redrawHealth();
}

export function drawHealth() {
    redrawHealthForPlayer(Game.player);
    redrawHealthForPlayer(Game.player2);
}

export function drawSlots() {
    redrawSlotsForPlayer(Game.player);
    redrawSlotsForPlayer(Game.player2);
}

export function drawSlotsContents() {
    redrawSlotContentsForPlayer(Game.player);
    redrawSlotContentsForPlayer(Game.player2);
}

export function redrawSlotContentsForPlayer(player) {
    const container = player === Game.player ? HUD.slots1Contents : HUD.slots2Contents;
    const slots = Object.keys(container);
    for (let i = 0; i < slots.length; i++) {
        redrawSlotContents(player, slots[i]);
    }
    drawStatsForPlayer(player);
}

export function redrawHealthForPlayer(player) {
    const container = player === Game.player ? HUD.hearts1 : HUD.hearts2;
    removeAllChildrenFromContainer(container);
    const heartXOffset = player === Game.player ?
        heartBorderOffsetX :
        Game.app.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * getHealthBarLength(player) + heartColOffset;
    const healthArray = getHealthArray(player);
    for (let i = 0; i < healthArray.length; ++i) {
        const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
        heart.width = heartSize;
        heart.height = heartSize;
        heart.anchor.set(0.5, 0.5);
        heart.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.floor(i / healthBarLength) + heart.height * heart.anchor.y;
        heart.position.x = heartXOffset + (i % healthBarLength) * (heartColOffset + heartSize) + heart.width * heart.anchor.x;
        container.addChild(heart);
    }
}

export function redrawSlotsForPlayer(player) {
    const container = player === Game.player ? HUD.slots1 : HUD.slots2;
    removeAllChildrenFromContainer(container);

    const topRowSlots = [getSlotWithName("Magic"), getSlotWithName("Magic"),
        getSlotWithName("Magic")];
    const secondRowSlots = [getSlotWithName("Weapon"), getSlotWithName("Extra")];
    const columnSlots = [getSlotWithName("Head"), getSlotWithName("Armor"), getSlotWithName("Feet")];
    const bagSlot = getSlotWithName("Bag");

    const slotsYOffset = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / healthBarLength) + slotOffsetFromHeartsY;
    const slotsXOffset = player === Game.player ?
        slotBorderOffsetX :
        Game.app.renderer.screen.width - slotBorderOffsetX - (slotSize + slotsColOffset) * topRowSlots.length + slotsColOffset;

    const slotsEquipmentOffset = player === Game.player ?
        slotsXOffset :
        Game.app.renderer.screen.width - slotBorderOffsetX - slotSize;

    const slotsSecondRowXOffset = player === Game.player ?
        slotsXOffset :
        Game.app.renderer.screen.width - slotBorderOffsetX - (slotSize + slotsColOffset) * 2 + slotsColOffset;

    const contentsContainer = player === Game.player ? HUD.slots1Contents : HUD.slots2Contents;

    for (let i = 0; i < topRowSlots.length; ++i) {
        const x = slotsXOffset + (slotSize + slotsColOffset) * i;
        const y = slotsYOffset;
        drawSlot(x, y, topRowSlots[i]);
        const magIdx = i + 1;
        contentsContainer["magic" + magIdx].sprite.position.x = x;
        contentsContainer["magic" + magIdx].sprite.position.y = y;
        contentsContainer["magic" + magIdx].meta.position.x = x;
        contentsContainer["magic" + magIdx].meta.position.y = y;
    }

    for (let i = 0; i < secondRowSlots.length; ++i) {
        const x = slotsSecondRowXOffset + (slotSize + slotsColOffset) * i;
        const y = slotsYOffset + slotSize + slotsRowOffset;
        drawSlot(x, y, secondRowSlots[i]);
        let slotContentsName;
        if (i === 0) slotContentsName = "weapon";
        else if (i === 1) slotContentsName = "secondHand";
        contentsContainer[slotContentsName].sprite.position.x = x;
        contentsContainer[slotContentsName].sprite.position.y = y;
        contentsContainer[slotContentsName].meta.position.x = x;
        contentsContainer[slotContentsName].meta.position.y = y;
    }

    for (let i = 0; i < columnSlots.length; ++i) {
        const x = slotsEquipmentOffset;
        const y = slotsYOffset + (slotSize + slotsRowOffset) * (i + 2);
        drawSlot(x, y, columnSlots[i]);
        let slotContentsName;
        if (i === 0) slotContentsName = "headwear";
        else if (i === 1) slotContentsName = "armor";
        else if (i === 2) slotContentsName = "footwear";
        contentsContainer[slotContentsName].sprite.position.x = x;
        contentsContainer[slotContentsName].sprite.position.y = y;
        contentsContainer[slotContentsName].meta.position.x = x;
        contentsContainer[slotContentsName].meta.position.y = y;
    }

    let x;
    if (player === Game.player) x = slotsEquipmentOffset + slotSize + slotsRowOffset;
    else x = slotsSecondRowXOffset;
    const y = slotsYOffset + (slotSize + slotsRowOffset) * 2;
    drawSlot(x, y, bagSlot);
    contentsContainer["bag"].sprite.position.x = x;
    contentsContainer["bag"].sprite.position.y = y;
    contentsContainer["bag"].meta.position.x = x;
    contentsContainer["bag"].meta.position.y = y;
    if (player === Game.player) HUD.bagSlot1 = bagSlot;
    else if (player === Game.player2) HUD.bagSlot2 = bagSlot;
    if (player.bag === null) bagSlot.visible = false;

    if (player === Game.player) {
        HUD.energy.position.set(slotBorderOffsetX, slotsYOffset + (slotSize + slotsRowOffset) * 5);
        HUD.fps.position.set(HUD.energy.position.x, HUD.energy.position.y);
    }

    function drawSlot(x, y, slot) {
        slot.position.x = x;
        slot.position.y = y;
        container.addChild(slot);
    }

    function getSlotWithName(name) {
        const container = new PIXI.Container();
        const slot = new PIXI.Graphics();
        const lineWidth = 3;
        slot.lineStyle(lineWidth, 0xffffff, 0.8);
        slot.drawRect(0, 0, slotSize, slotSize);
        const text = new PIXI.Text(name, HUDTextStyleSlot);
        text.alpha = 0.9;
        container.addChild(slot);
        slot.addChild(text);
        text.position.set(slot.width / 2 - text.width / 2 - lineWidth / 2, slot.height - text.height - lineWidth);
        if (name.match("\n")) text.position.y = slot.height - text.height / 2 - lineWidth - 3;
        return container;
    }
}

export function drawStatsForPlayer(player) {
    const container = player === Game.player ? HUD.stats1 : HUD.stats2;
    removeAllChildrenFromContainer(container);
    const text = new PIXI.Text(`ATK ${player.getAtkWithWeapon(player.weapon)}\nDEF ${player.getDef()}`, HUDTextStyle);

    if (player === Game.player) text.position.x = slotBorderOffsetX + slotSize * 2 + slotsColOffset + statsOffsetX;
    else text.position.x = Game.app.renderer.screen.width - slotBorderOffsetX - slotSize * 2 - slotsColOffset - text.width - statsOffsetX;
    text.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / healthBarLength) + slotOffsetFromHeartsY + slotSize + slotsRowOffset + slotSize / 2 - text.height / 2;
    container.addChild(text);
}

export function redrawSlotContents(player, slot) {
    const container = player === Game.player ? HUD.slots1Contents[slot] : HUD.slots2Contents[slot];
    removeAllChildrenFromContainer(container.sprite);
    removeAllChildrenFromContainer(container.meta);
    const item = player[slot];
    if (item) {
        drawSprite();
        drawUses();
        if (!player.dead) {
            const keyBind = getKeyBind(player, slot);
            if (keyBind !== false) drawKey(keyBind, container.meta);
        }
    }
    drawStatsForPlayer(player);
    if (slot === "bag") {
        const bagSlot = player === Game.player ? HUD.bagSlot1 : HUD.bagSlot2;
        bagSlot.visible = player[slot] !== null;
    }

    function drawSprite() {
        const sprite = new PIXI.Sprite(item.texture);
        sprite.position.set(slotContentSizeMargin / 2, slotContentSizeMargin / 2);
        sprite.width = slotSize - slotContentSizeMargin;
        sprite.height = slotSize - slotContentSizeMargin;
        sprite.filters = [ITEM_OUTLINE_FILTER];
        container.sprite.addChild(sprite);
    }

    function drawUses() {
        let text;
        if (item.equipmentType === EQUIPMENT_TYPE.HEAD && item.type === HEAD_TYPE.VAMPIRE_CROWN) {
            text = new PIXI.Text(item.killsMade + "/" + item.killsNeeded, HUDTextStyle);
        } else if (item.equipmentType === EQUIPMENT_TYPE.BAG_ITEM) {
            text = new PIXI.Text("x" + item.amount, HUDTextStyle);
            text.position.set(slotSize - text.width, 0);
        } else {
            if (item.uses == null || item.maxUses == null || item.infinite) return false;
            text = new PIXI.Text(item.uses + "/" + item.maxUses, HUDTextStyle);
        }

        if (item.equipmentType !== EQUIPMENT_TYPE.BAG_ITEM) {
            text.position.set(slotSize - text.width * 2 / 3, 0);
        }
        container.meta.addChild(text);
    }

    function getKeyBind(player, slot) {
        const item = player[slot];
        if (slot === "secondHand" && player["secondHand"].equipmentType === EQUIPMENT_TYPE.WEAPON
            && ((player["weapon"] === null || player["weapon"].type !== player["secondHand"].type)
                || player["weapon"] && player["weapon"].type === player["secondHand"].type && player["secondHand"].uses < player["weapon"].uses && player["weapon"].uses === player["weapon"].maxUses)) {
            if (player === Game.player) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_EXTRA_1P]);
            else return getKeyBindSymbol(window.localStorage[STORAGE.KEY_EXTRA_2P]);

        } else if (slot === "weapon" && item.focus && item.uses < item.maxUses) {
            if (player === Game.player) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_WEAPON_1P]);
            else return getKeyBindSymbol(window.localStorage[STORAGE.KEY_WEAPON_2P]);
        } else if (slot === "bag" && item.amount > 0) {
            if (player === Game.player) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_BAG_1P]);
            else return getKeyBindSymbol(window.localStorage[STORAGE.KEY_BAG_2P]);
        } else if (item.uses > 0 && !item.passive) {
            if (item.equipmentType === EQUIPMENT_TYPE.SHIELD && item.type !== SHIELD_TYPE.PASSIVE) {
                if (player === Game.player) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_EXTRA_1P]);
                else return getKeyBindSymbol(window.localStorage[STORAGE.KEY_EXTRA_2P]);
            } else if (player === Game.player) {
                if (item === player.magic1) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_MAGIC_1_1P]);
                else if (item === player.magic2) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_MAGIC_2_1P]);
                else if (item === player.magic3) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_MAGIC_3_1P]);
                else return false;
            } else {
                if (item === player.magic1) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_MAGIC_1_2P]);
                else if (item === player.magic2) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_MAGIC_2_2P]);
                else if (item === player.magic3) return getKeyBindSymbol(window.localStorage[STORAGE.KEY_MAGIC_3_2P]);
                else return false;
            }
        } else return false;
    }
}

export function drawKey(keyBind, container, posX = 0, posY = 0) {
    const key = new PIXI.Container();
    const text = new PIXI.Text(keyBind, HUDKeyBindTextStyle);
    const rect = new PIXI.Graphics();
    rect.beginFill(0xffffff);
    rect.lineStyle(2, 0x666666, 0.5);
    const rectHeight = HUDKeyBindSize;
    let rectWidth = rectHeight;
    if (keyBind.length > 1) rectWidth = text.width + 10; //hmmm
    rect.drawRect(posX, posY, rectWidth, rectHeight);
    rect.endFill();
    text.position.set(posX + (rectWidth - text.width) / 2, posY + (rectHeight - text.height) / 2);
    key.addChild(rect);
    key.addChild(text);
    container.addChild(key);
    return key;
}

//should I do enum for all those symbolic values as well? e.g. headwear, secondHand etc...
export function redrawAllMagicSlots(player) {
    redrawSlotContents(player, "magic1");
    redrawSlotContents(player, "magic2");
    redrawSlotContents(player, "magic3");
}

export function redrawWeapon(player) {
    redrawSlotContents(player, "weapon");
}

export function redrawSecondHand(player) {
    redrawSlotContents(player, "secondHand");
}

export function redrawWeaponAndSecondHand(player) {
    redrawSlotContents(player, "weapon");
    redrawSlotContents(player, "secondHand");
}

export function redrawHeadwear(player) {
    redrawSlotContents(player, "headwear");
}

export function redrawArmor(player) {
    redrawSlotContents(player, "armor");
}

export function redrawFootwear(player) {
    redrawSlotContents(player, "footwear");
}

export function redrawBag(player) {
    redrawSlotContents(player, "bag");
}

export function drawMovementKeyBindings() {
    const container = HUD.movementGuide;
    removeAllChildrenFromContainer(container);
    if (!Game.player.dead) {
        const heartXOffset = heartBorderOffsetX + HUDGuideOffsetX;
        const topKey = getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_UP_1P]);
        const bottomRowKeys = [getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_LEFT_1P]),
            getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_DOWN_1P]),
            getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_RIGHT_1P])];
        drawKey(topKey, container, heartXOffset + getHealthBarLength(Game.player) * (heartColOffset + heartSize) + HUDKeyBindSize + HUDGuideKeyOffsetX, heartYOffset + HUDGuideOffsetY);
        for (let i = 0; i < bottomRowKeys.length; i++) {
            if (bottomRowKeys[i] !== "") {
                drawKey(bottomRowKeys[i], container, heartXOffset + getHealthBarLength(Game.player) * (heartColOffset + heartSize) + HUDKeyBindSize * i + i * HUDGuideKeyOffsetX,
                    heartYOffset + HUDGuideOffsetY + HUDKeyBindSize + HUDGuideKeyOffsetY);
            }
        }
    }

    if (!Game.player2.dead) {
        const heartXOffset = Game.app.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * getHealthBarLength(Game.player2) - HUDGuideOffsetX;
        const topKey = getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_UP_2P]);
        const bottomRowKeys = [getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_RIGHT_2P]),
            getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_DOWN_2P]),
            getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_LEFT_2P])];
        drawKey(topKey, container, heartXOffset - HUDKeyBindSize * 2 - HUDGuideKeyOffsetX, heartYOffset + HUDGuideOffsetY);
        for (let i = 0; i < bottomRowKeys.length; i++) {
            if (bottomRowKeys[i] !== "") {
                drawKey(bottomRowKeys[i], container, heartXOffset - HUDKeyBindSize * (i + 1) - i * HUDGuideKeyOffsetX,
                    heartYOffset + HUDGuideOffsetY + HUDKeyBindSize + HUDGuideKeyOffsetY);
            }
        }
    }
}

export function drawInteractionKeys() {
    const container = HUD.interactionGuide;
    removeAllChildrenFromContainer(container);
    if (Game.player.dead || Game.player2.dead) return;
    const playerSize = 50;
    const offsetY = 20;
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x && Game.player.tilePosition.y === Game.player2.tilePosition.y) {
        drawPlayer(Game.player);
        drawPlayer(Game.player2);
        const ZKey = drawKey(getKeyBindSymbol(window.localStorage[STORAGE.KEY_Z_SWITCH]), container,
            Game.app.renderer.screen.width / 2 - HUDKeyBindSize / 2, offsetY + playerSize / 2 - HUDKeyBindSize / 2 - Game.player.tallModifier);
        ZKey.zIndex = Game.primaryPlayer.ownZIndex + 1;

        function drawPlayer(player) {
            const texture = player === Game.player ? "player.png" : "player2.png";
            const playerSprite = new PIXI.Sprite(CommonSpriteSheet[texture]);
            playerSprite.scale.y = playerSprite.scale.x = playerSize / playerSprite.width;
            playerSprite.zIndex = player.ownZIndex;
            playerSprite.position.x = Game.app.renderer.screen.width / 2 - playerSize / 2;
            playerSprite.position.y = offsetY - player.tallModifier;
            container.addChild(playerSprite);
            return playerSprite;
        }
    }
}

function redrawFps() {
    const container = HUD.fps;
    removeAllChildrenFromContainer(container);
    if (HUD.fps.animation) Game.app.ticker.remove(HUD.fps.animation);
    const text = new PIXI.Text("FPS: ", HUDTextStyle);
    container.addChild(text);
    let counter = 0;
    HUD.fps.animation = (delta) => {
        counter += delta;
        if (counter > 10) {
            text.text = "FPS " + Math.floor(Game.app.ticker.FPS);
            counter = 0;
        }
    };
    Game.app.ticker.add(HUD.fps.animation);
}

export function redrawEnergy() {
    return;
    const container = HUD.energy;
    removeAllChildrenFromContainer(container);
    const text = new PIXI.Text(`LE ${Game.lightEnergy}\nDE ${Game.darkEnergy}`, HUDTextStyle);
    container.addChild(text);
}

export function drawOtherHUD() {
    const container = HUD.other;
    removeAllChildrenFromContainer(container);
    const playerSize = 60;
    drawPlayer(Game.player, heartBorderOffsetX + heartSize / 2 - playerSize / 2, heartYOffset + heartSize / 2 - playerSize / 2);
    drawPlayer(Game.player2, Game.app.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * getHealthBarLength(Game.player2) + heartColOffset + heartSize / 2 - playerSize / 2,
        heartYOffset + heartSize / 2 - playerSize / 2);

    function drawPlayer(player, posX, posY) {
        const playerTexture = player === Game.player ? "player.png" : "player2.png";
        const playerSprite = new PIXI.Sprite(CommonSpriteSheet[playerTexture]);
        playerSprite.scale.y = playerSprite.scale.x = playerSize / playerSprite.width;
        playerSprite.alpha = 0.5;
        playerSprite.position.x = posX + playerSprite.width * playerSprite.anchor.x;
        playerSprite.position.y = posY + playerSprite.height * playerSprite.anchor.y;
        if (player === Game.player2) playerSprite.position.y -= player.tallModifier * 1.5;
        container.addChild(playerSprite);
    }
}

function getHealthBarLength(player) {
    return Math.min(player.maxHealth, healthBarLength);
}

export function getKeyBindSymbol(keyBind) {
    if (keyBind === "ArrowUp") return "🡱";
    else if (keyBind === "ArrowLeft") return "🡰";
    else if (keyBind === "ArrowDown") return "🡳";
    else if (keyBind === "ArrowRight") return "🡲";
    else if (keyBind === "Escape") return "Esc";
    else if (keyBind === "ControlLeft") return "Ctrl";
    else if (keyBind === "ControlRight") return "Ctrl";
    else if (keyBind === "Tab") return "↹";
    else if (keyBind === "PageDown") return "PgDn";
    else if (keyBind === "PageUp") return "PgUp";
    else if (keyBind === "Backspace") return "⟵";
    else if (keyBind === "Enter") return "↵";
    else if (keyBind === "Space") return "␣";
    else if (keyBind === "AltLeft") return "Alt";
    else if (keyBind === "AltRight") return "Alt";
    else if (keyBind === "Backslash") return "\\";
    else if (keyBind === "Slash") return "/";
    else if (keyBind === "Period") return ".";
    else if (keyBind === "Comma") return ",";
    else if (keyBind === "Equal") return "=";
    else if (keyBind === "Minus") return "-";
    else if (keyBind === "Backquote") return "`";
    else if (keyBind === "CapsLock") return "Caps";
    else if ((keyBind.length === 2 || keyBind.length === 3) && keyBind[0] === "F") return keyBind;
    else if (keyBind === "BracketRight") return "]";
    else if (keyBind === "BracketLeft") return "[";
    else if (keyBind === "Quote") return "'";
    else if (keyBind === "Semicolon") return ";";
    else if (keyBind === "Home") return "Home";
    else if (keyBind === "End") return "End";
    else if (keyBind === "Delete") return "Delete";
    else return keyBind.slice(-1);
}

export function redrawSpeedRunTime() {
    const container = HUD.speedrunTime;
    removeAllChildrenFromContainer(container);
    if (Game.showTime) {
        const time = getTimeFromMs(Game.time);
        const text = new PIXI.Text(`Time: ${padTime(time.minutes, 2)}:${padTime(time.seconds, 2)}.${padTime(time.ms, 3)}`, HUDTextStyleTitle);
        text.position.set(slotBorderOffsetX, Game.app.renderer.screen.height - text.height - miniMapBottomOffset);
        container.addChild(text);
    }
}

function padTime(time, digits) {
    let paddedTime = time.toString();
    for (let i = 0; i < digits - time.toString().length; i++) {
        paddedTime = "0" + paddedTime;
    }
    return paddedTime;
}