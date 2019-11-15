import {Game} from "../game";
import {
    heartColOffset,
    heartBorderOffsetX,
    heartRowOffset,
    heartSize,
    heartYOffset,
    slotsColOffset,
    slotSize,
    slotsRowOffset,
    HUDTextStyle,
    slotContentSizeMargin,
    slotBorderOffsetX,
    statsOffsetX,
    HUDKeyBindFontsize, HUDKeyBindTextStyle
} from "./draw_constants";
import * as PIXI from "pixi.js";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "./draw_utils";
import {HUD} from "./hud_object";
import {EQUIPMENT_TYPE, SHIELD_TYPE} from "../enums";

export function drawHUD() {
    drawHealth();
    drawSlots();
    drawSlotsContents();
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
        Game.APP.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * 5 + heartColOffset;
    const healthArray = getHealthArray(player);
    for (let i = 0; i < healthArray.length; ++i) {
        const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
        heart.width = heartSize;
        heart.height = heartSize;
        heart.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.floor(i / 5);
        heart.position.x = heartXOffset + (i % 5) * (heartColOffset + heartSize);
        container.addChild(heart);
    }
}

export function redrawSlotsForPlayer(player) {
    const container = player === Game.player ? HUD.slots1 : HUD.slots2;
    removeAllChildrenFromContainer(container);

    const topRowSlots = [new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture)];

    const secondRowSlots = [new PIXI.Sprite(Game.resources["src/images/HUD/slot_weapon.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/HUD/slot_second_hand.png"].texture)];

    const columnSlots = [new PIXI.Sprite(Game.resources["src/images/HUD/slot_head.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/HUD/slot_armor.png"].texture),
        new PIXI.Sprite(Game.resources["src/images/HUD/slot_feet.png"].texture)];

    const slotsYOffset = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / 5) + 15;
    const slotsXOffset = player === Game.player ?
        slotBorderOffsetX :
        Game.APP.renderer.screen.width - slotBorderOffsetX - (slotSize + slotsColOffset) * 4 + slotsColOffset;

    const slotsEquipmentOffset = player === Game.player ?
        slotsXOffset :
        Game.APP.renderer.screen.width - slotBorderOffsetX - slotSize;

    const slotsSecondRowXOffset = player === Game.player ?
        slotsXOffset :
        Game.APP.renderer.screen.width - slotBorderOffsetX - (slotSize + slotsColOffset) * 2 + slotsColOffset;

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

    function drawSlot(x, y, slot) {
        slot.position.x = x;
        slot.position.y = y;
        slot.width = slotSize;
        slot.height = slotSize;
        container.addChild(slot);
    }
}

function drawStatsForPlayer(player) {
    const container = player === Game.player ? HUD.stats1 : HUD.stats2;
    removeAllChildrenFromContainer(container);
    const text = new PIXI.Text(`ATK = ${player.getAtkBaseWithWeapon(player.weapon)} * ${player.atkMul} = ${player.getAtkWithWeapon(player.weapon)}\nDEF = ${player.getDefBase()} * ${player.defMul} = ${player.getDef()}`, HUDTextStyle);

    if (player === Game.player) text.position.x = slotBorderOffsetX + slotSize * 2 + slotsColOffset + statsOffsetX;
    else text.position.x = Game.APP.renderer.screen.width - slotBorderOffsetX - slotSize * 2 - slotsColOffset - text.width - statsOffsetX;
    text.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / 5) + 15 + slotSize + slotsRowOffset + slotSize / 2 - text.height / 2;
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
        const keyBind = getKeyBind(player, slot);
        if (keyBind !== false) drawKey(keyBind);
    }
    drawStatsForPlayer(player);

    function drawSprite() {
        const sprite = new PIXI.Sprite(item.texture);
        sprite.position.set(slotContentSizeMargin / 2, slotContentSizeMargin / 2);
        sprite.width = slotSize - slotContentSizeMargin;
        sprite.height = slotSize - slotContentSizeMargin;
        container.sprite.addChild(sprite);
    }

    function drawUses() {
        if (item.uses == null || item.maxUses == null) return false;
        const text = new PIXI.Text(item.uses + "/" + item.maxUses, HUDTextStyle);
        text.position.set(slotSize - text.width / 2 - 6, 0);//6 arbitrary
        container.meta.addChild(text);
    }

    function drawKey(keyBind) {
        const key = new PIXI.Container();
        const rect = new PIXI.Graphics();
        rect.beginFill(0xffffff);
        rect.lineStyle(1, 0x000000);
        const rectSize = HUDKeyBindFontsize * 1.4;
        rect.drawRoundedRect(0, 0, rectSize, rectSize, 5);
        rect.endFill();
        const text = new PIXI.Text(keyBind, HUDKeyBindTextStyle);
        text.position.set((rectSize - text.width) / 2, (rectSize - text.height) / 2);
        key.addChild(rect);
        key.addChild(text);
        container.meta.addChild(key);
    }

    function getKeyBind(player, slot) {
        const item = player[slot];
        if (item.uses > 0) {
            if (item.equipmentType === EQUIPMENT_TYPE.SHIELD && item.type !== SHIELD_TYPE.PASSIVE) {
                if (player === Game.player) return "E";
                else return "O"; // bruh should do some keyBindings file with all the values
            } else if (player === Game.player) {
                if (item === player.magic1) return "1";
                else if (item === player.magic2) return "2";
                else if (item === player.magic3) return "3";
                else if (item === player.magic4) return "4";
                else return false;
            } else {
                if (item === player.magic1) return "7";
                else if (item === player.magic2) return "8";
                else if (item === player.magic3) return "9";
                else if (item === player.magic4) return "0";
                else return false;
            }
        } else return false;
    }
}

export function redrawAllMagicSlots(player) {
    redrawSlotContents(player, "magic1");
    redrawSlotContents(player, "magic2");
    redrawSlotContents(player, "magic3");
    redrawSlotContents(player, "magic4");
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
