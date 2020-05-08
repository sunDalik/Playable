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
import {EQUIPMENT_TYPE, HEAD_TYPE, SLOT, STORAGE} from "../enums";
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
    redrawKeysAmount();
}

export function redrawSlotContentsForPlayer(player) {
    for (const slot of Object.values(SLOT)) {
        redrawSlotContents(player, slot);
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
    for (const slot of Object.values(SLOT)) {
        if (container[slot]) removeAllChildrenFromContainer(container[slot].slot);
    }
    //each array of slots is a ROW of slots
    const slots = [[createSlot("Magic", SLOT.MAGIC1), createSlot("Magic", SLOT.MAGIC2), createSlot("Magic", SLOT.MAGIC3)],
        [createSlot("Weapon", SLOT.WEAPON), createSlot("Extra", SLOT.EXTRA)],
        [createSlot("Head", SLOT.HEADWEAR), createSlot("Bag", SLOT.BAG)], //change to accessory later and move bag down
        [createSlot("Armor", SLOT.ARMOR)],
        [createSlot("Feet", SLOT.FOOTWEAR)]];
    if (player === Game.player2) {
        slots[2].reverse();
        slots[3].reverse();
    }

    const slotsYOffset = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / healthBarLength) + slotOffsetFromHeartsY;
    for (let i = 0; i < slots.length; i++) {
        const y = slotsYOffset + (slotSize + slotsRowOffset) * i;
        for (let j = 0; j < slots[i].length; j++) {
            const x = player === Game.player
                ? slotBorderOffsetX + (slotSize + slotsColOffset) * j
                : Game.app.renderer.screen.width - slotBorderOffsetX - slots[i].length * slotSize - (slots[i].length - 1) * slotsColOffset + (slotSize + slotsColOffset) * j;
            const slot = slots[i][j];
            slot.position.set(x, y);
            container[slot.slotName].sprite.position.set(x, y);
            container[slot.slotName].meta.position.set(x, y);
        }
    }

    if (player === Game.player) {
        HUD.energy.position.set(slotBorderOffsetX, slotsYOffset + (slotSize + slotsRowOffset) * 5);
        HUD.fps.position.set(HUD.energy.position.x, HUD.energy.position.y);
        HUD.keysAmount.position.set(HUD.fps.position.x, HUD.fps.position.y + 30);
    }

    function createSlot(displayName, slotName) {
        const slotContainer = container[slotName].slot;
        slotContainer.slotName = slotName;
        const slot = new PIXI.Graphics();
        const lineWidth = 3;
        slot.lineStyle(lineWidth, 0xeeeeee, 0.8);
        slot.drawRect(0, 0, slotSize, slotSize);
        const text = new PIXI.Text(displayName, HUDTextStyleSlot);
        text.alpha = 0.9;
        slotContainer.addChild(slot);
        slot.addChild(text);
        text.position.set(slot.width / 2 - text.width / 2 - lineWidth / 2, slot.height - text.height - lineWidth);
        return slotContainer;
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
    const container = player === Game.player ? HUD.slots1[slot] : HUD.slots2[slot];
    if (!container) return;
    removeAllChildrenFromContainer(container.sprite);
    removeAllChildrenFromContainer(container.meta);
    const item = player[slot];
    if (item) {
        container.slot.alpha = 1;
        drawSprite();
        drawUses();
        if (!player.dead) {
            const keyBind = getKeyBind(player, slot);
            if (keyBind !== false) drawKey(keyBind, container.meta);
        }
    } else {
        if (container.invisible) container.slot.alpha = 0;
        else container.slot.alpha = 0.5;
    }
    drawStatsForPlayer(player);

    function drawSprite() {
        const sprite = new PIXI.Sprite(item.texture);
        sprite.position.set(slotContentSizeMargin / 2, slotContentSizeMargin / 2);
        sprite.width = sprite.height = slotSize - slotContentSizeMargin;
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
            if (player === Game.player) {
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

//todo remove these methods and instead use new convenient SLOT enum in place
export function redrawAllMagicSlots(player) {
    redrawSlotContents(player, SLOT.MAGIC1);
    redrawSlotContents(player, SLOT.MAGIC2);
    redrawSlotContents(player, SLOT.MAGIC3);
}

export function redrawSecondHand(player) {
    redrawSlotContents(player, SLOT.EXTRA);
}

export function redrawWeaponAndSecondHand(player) {
    redrawSlotContents(player, SLOT.WEAPON);
    redrawSlotContents(player, SLOT.EXTRA);
}

export function redrawBag(player) {
    redrawSlotContents(player, SLOT.BAG);
}

export function redrawKeysAmount() {
    const container = HUD.keysAmount;
    removeAllChildrenFromContainer(container);
    if (Game.keysAmount === 0) return;
    const icon = new PIXI.Sprite(Game.resources["src/images/key.png"].texture);
    icon.width = icon.height = 40;
    const text = new PIXI.Text(Game.keysAmount.toString(), HUDTextStyle);
    text.position.set(icon.width, (icon.height - text.height) / 3);
    container.addChild(icon);
    container.addChild(text);
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

export function redrawFps() {
    const container = HUD.fps;
    removeAllChildrenFromContainer(container);
    if (HUD.fps.animation) Game.app.ticker.remove(HUD.fps.animation);
    if (!Game.showFPS) return;
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