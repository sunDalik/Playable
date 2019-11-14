import {Game} from "../game";
import {
    heartColOffset,
    heartRowOffset,
    heartSize,
    heartYOffset,
    slotsColOffset,
    slotSize,
    slotsRowOffset
} from "./draw_constants";
import * as PIXI from "pixi.js";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "./draw_utils";

export function drawHUD() {
    drawHealth();
    drawSlots();
}

export function drawHealth() {
    redrawHealthForPlayer(Game.player);
    redrawHealthForPlayer(Game.player2);
}

export function drawSlots() {
    redrawSlotsForPlayer(Game.player);
    redrawSlotsForPlayer(Game.player2);
}

export function redrawHealthForPlayer(player) {
    const container = player === Game.player ? Game.hearts1 : Game.hearts2;
    removeAllChildrenFromContainer(container);
    const heartXOffset = player === Game.player ? 50 : Game.APP.renderer.screen.width - 50 - (heartSize + heartColOffset) * 5 + heartColOffset;
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
    const container = player === Game.player ? Game.slots1 : Game.slots2;
    removeAllChildrenFromContainer(container);
    const slotsYOffset = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / 5) + 15;
    const slotsXOffset = player === Game.player ? 20 : Game.APP.renderer.screen.width - 20 - (slotSize + slotsColOffset) * 4 + slotsColOffset;
    const slotsEquipmentOffset = player === Game.player ? slotsXOffset : Game.APP.renderer.screen.width - 20 - slotSize;
    const slotsSecondRowXOffset = player === Game.player ? slotsXOffset : Game.APP.renderer.screen.width - 20 - (slotSize + slotsColOffset) * 2 + slotsColOffset;
    const weaponSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_weapon.png"].texture);
    const secondHandSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_second_hand.png"].texture);
    const magicSlot1 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const magicSlot2 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const magicSlot3 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const magicSlot4 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const headSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_head.png"].texture);
    const armorSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_armor.png"].texture);
    const feetSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_feet.png"].texture);
    const topRowSlots = [magicSlot1, magicSlot2, magicSlot3, magicSlot4];
    const secondRowSlots = [weaponSlot, secondHandSlot];
    const columnSlots = [headSlot, armorSlot, feetSlot];

    const itemMargin = 15;
    for (let i = 0; i < topRowSlots.length; ++i) {
        topRowSlots[i].position.y = slotsYOffset;
        topRowSlots[i].position.x = slotsXOffset + (slotSize + slotsColOffset) * i;
        topRowSlots[i].width = slotSize;
        topRowSlots[i].height = slotSize;
        container.addChild(topRowSlots[i]);
        switch (topRowSlots[i]) {
            case magicSlot1:
                if (player.magic1 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic1.texture);
                    drawUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic1);
                }
                break;
            case magicSlot2:
                if (player.magic2 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic2.texture);
                    drawUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic2);
                }
                break;
            case magicSlot3:
                if (player.magic3 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic3.texture);
                    drawUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic3);
                }
                break;
            case magicSlot4:
                if (player.magic4 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic4.texture);
                    drawUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic4);
                }
                break;
        }
    }
    for (let i = 0; i < secondRowSlots.length; ++i) {
        secondRowSlots[i].position.y = slotsYOffset + slotSize + slotsRowOffset;
        secondRowSlots[i].position.x = slotsSecondRowXOffset + (slotSize + slotsColOffset) * i;
        secondRowSlots[i].width = slotSize;
        secondRowSlots[i].height = slotSize;
        container.addChild(secondRowSlots[i]);
        switch (secondRowSlots[i]) {
            case weaponSlot:
                if (player.weapon !== null) drawEquipment(secondRowSlots[i].position.x + itemMargin / 2, secondRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.weapon.texture);
                break;
            case secondHandSlot:
                if (player.secondHand !== null) {
                    drawEquipment(secondRowSlots[i].position.x + itemMargin / 2, secondRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.secondHand.texture);
                    drawUses(secondRowSlots[i].position.x + secondRowSlots[i].width, secondRowSlots[i].position.y, container, player.secondHand);
                }
                break;
        }
    }
    if (player === Game.player) drawStatsForPlayer(secondRowSlots[1].position.x + secondRowSlots[1].width + 20, secondRowSlots[1].position.y + secondRowSlots[1].height / 2, container, player);
    else drawStatsForPlayer(secondRowSlots[0].position.x - 10, secondRowSlots[0].position.y + secondRowSlots[0].height / 2, container, player);
    for (let i = 0; i < columnSlots.length; ++i) {
        columnSlots[i].position.y = slotsYOffset + (slotSize + slotsRowOffset) * (i + 2);
        columnSlots[i].position.x = slotsEquipmentOffset;
        columnSlots[i].width = slotSize;
        columnSlots[i].height = slotSize;
        container.addChild(columnSlots[i]);
        switch (columnSlots[i]) {
            case headSlot:
                if (player.headwear !== null) drawEquipment(columnSlots[i].position.x + itemMargin / 2, columnSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.headwear.texture);
                break;
            case armorSlot:
                if (player.armor !== null) drawEquipment(columnSlots[i].position.x + itemMargin / 2, columnSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.armor.texture);
                break;
            case feetSlot:
                if (player.footwear !== null) drawEquipment(columnSlots[i].position.x + itemMargin / 2, columnSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.footwear.texture);
                break;
        }
    }

    function drawEquipment(posX, posY, size, container, texture) {
        const sprite = new PIXI.Sprite(texture);
        sprite.position.set(posX, posY);
        sprite.width = size;
        sprite.height = size;
        sprite.zIndex = -1;
        container.addChild(sprite);
    }

    function drawUses(rightPosX, topPosY, container, item) {
        if (item.uses == null || item.maxUses == null) return false;
        const fontSize = 16;
        const text = new PIXI.Text(item.uses + "/" + item.maxUses, {
            fontSize: fontSize,
            fill: 0xffffff,
            fontWeight: "bold",
            stroke: 0x000000,
            strokeThickness: 2
        });
        text.position.set(rightPosX - text.width, topPosY);
        container.addChild(text);
    }

    function drawStatsForPlayer(posX, posY, container, player) {
        const fontSize = 16;
        const text = new PIXI.Text(`ATK = ${player.getAtkBaseWithWeapon(player.weapon)} * ${player.atkMul} = ${player.getAtkWithWeapon(player.weapon)}\n\nDEF = ${player.getDefBase()} * ${player.defMul} = ${player.getDef()}`, {
            fontSize: fontSize,
            fill: 0xffffff,
            fontWeight: "bold",
            stroke: 0x000000,
            strokeThickness: 2
        });
        if (player === Game.player) text.position.set(posX, posY - text.height / 2);
        else text.position.set(posX - text.width, posY - text.height / 2);
        container.addChild(text);
    }
}