import {Game} from "../game";
import {
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
    miniMapPixelSize,
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
import {EQUIPMENT_TYPE, MAGIC_TYPE, SHIELD_TYPE, TILE_TYPE} from "../enums";
import {ITEM_OUTLINE_FILTER} from "../filters";

export function drawHUD() {
    drawHealth();
    drawSlots();
    drawOther();
    drawMovementKeyBindings();
    drawInteractionKeys();
    redrawEnergy();
    drawSlotsContents();
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
        Game.app.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * 5 + heartColOffset;
    const healthArray = getHealthArray(player);
    for (let i = 0; i < healthArray.length; ++i) {
        const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
        heart.width = heartSize;
        heart.height = heartSize;
        heart.anchor.set(0.5, 0.5);
        if (player === Game.player2 && i === 0 || player === Game.player && i !== 0) {
            //heart.angle = 180;
            //heart.scale.x *= -1;
        }
        heart.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.floor(i / 5) + heart.height * heart.anchor.y;
        heart.position.x = heartXOffset + (i % 5) * (heartColOffset + heartSize) + heart.width * heart.anchor.x;
        container.addChild(heart);
    }
}

export function redrawSlotsForPlayer(player) {
    const container = player === Game.player ? HUD.slots1 : HUD.slots2;
    removeAllChildrenFromContainer(container);

    const topRowSlots = [getSlotWithName("Magic"), getSlotWithName("Magic"),
        getSlotWithName("Magic"), getSlotWithName("Magic")];
    const secondRowSlots = [getSlotWithName("Weapon"), getSlotWithName("Extra")];
    const columnSlots = [getSlotWithName("Head"), getSlotWithName("Armor"), getSlotWithName("Feet")];

    const slotsYOffset = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / 5) + slotOffsetFromHeartsY;
    const slotsXOffset = player === Game.player ?
        slotBorderOffsetX :
        Game.app.renderer.screen.width - slotBorderOffsetX - (slotSize + slotsColOffset) * 4 + slotsColOffset;

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

    HUD.energy.position.set(slotBorderOffsetX, slotsYOffset + (slotSize + slotsRowOffset) * 5);

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
    const text = new PIXI.Text(`ATK = ${player.getAtkBaseWithWeapon(player.weapon)} * ${player.getAtkMul()} = ${player.getAtkWithWeapon(player.weapon)}\nDEF = ${player.getDefBase()} * ${player.getDefMul()} = ${player.getDef()}`, HUDTextStyle);

    if (player === Game.player) text.position.x = slotBorderOffsetX + slotSize * 2 + slotsColOffset + statsOffsetX;
    else text.position.x = Game.app.renderer.screen.width - slotBorderOffsetX - slotSize * 2 - slotsColOffset - text.width - statsOffsetX;
    text.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / 5) + slotOffsetFromHeartsY + slotSize + slotsRowOffset + slotSize / 2 - text.height / 2;
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
            if (keyBind !== false) drawKey(keyBind);
        }
    }
    drawStatsForPlayer(player);

    function drawSprite() {
        const sprite = new PIXI.Sprite(item.texture);
        sprite.position.set(slotContentSizeMargin / 2, slotContentSizeMargin / 2);
        sprite.width = slotSize - slotContentSizeMargin;
        sprite.height = slotSize - slotContentSizeMargin;
        sprite.filters = [ITEM_OUTLINE_FILTER];
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
        const text = new PIXI.Text(keyBind, HUDKeyBindTextStyle);
        const rect = new PIXI.Graphics();
        rect.beginFill(0xffffff);
        rect.lineStyle(2, 0x666666, 0.5);
        const newLines = (keyBind.match(/\n/g) || '').length + 1;
        const rectHeight = HUDKeyBindSize * newLines;
        let rectWidth = rectHeight;
        if (keyBind.length > 1) rectWidth = text.width + 10;
        rect.drawRect(0, -(newLines - 1) * rectHeight / 2, rectWidth, rectHeight);
        rect.endFill();
        text.position.set((rectWidth - text.width) / 2, (rectHeight - text.height) / 2 - ((newLines - 1) * rectHeight / 2));
        key.addChild(rect);
        key.addChild(text);
        container.meta.addChild(key);
    }

    function getKeyBind(player, slot) {
        const item = player[slot];
        let release = "";
        if (item.equipmentType === EQUIPMENT_TYPE.MAGIC && item.type === MAGIC_TYPE.FIREBALL && item.multiplier > 0) release = " or\nspace";
        if (slot === "secondHand" && player["secondHand"].equipmentType === EQUIPMENT_TYPE.WEAPON
            && ((player["weapon"] === null || player["weapon"].type !== player["secondHand"].type)
                || player["weapon"] && player["weapon"].type === player["secondHand"].type && player["secondHand"].uses < player["weapon"].uses && player["weapon"].uses === player["weapon"].maxUses)) {
            if (player === Game.player) return "E";
            else return "O";

        } else if (slot === "weapon" && item.concentrate && item.uses < item.maxUses) {
            if (player === Game.player) return "Q";
            else return "U";
        } else if (item.uses > 0) {
            if (item.equipmentType === EQUIPMENT_TYPE.SHIELD && item.type !== SHIELD_TYPE.PASSIVE) {
                if (player === Game.player) return "E";
                else return "O"; // bruh should do some keyBindings file with all the values
            } else if (player === Game.player) {
                if (item === player.magic1) return "1" + release;
                else if (item === player.magic2) return "2" + release;
                else if (item === player.magic3) return "3" + release;
                else if (item === player.magic4) return "4" + release;
                else return false;
            } else {
                if (item === player.magic1) return "7" + release;
                else if (item === player.magic2) return "8" + release;
                else if (item === player.magic3) return "9" + release;
                else if (item === player.magic4) return "0" + release;
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

export function drawMovementKeyBindings() {
    const container = HUD.movementGuide;
    removeAllChildrenFromContainer(container);
    if (!Game.player.dead && !Game.player2.pushPullMode) {
        const heartXOffset = heartBorderOffsetX + HUDGuideOffsetX;
        const topKey = "W";
        const bottomRowKeys = ["A", "S", "D"];
        if (!Game.player.pushPullMode || Game.player.tilePosition.x === Game.player2.tilePosition.x) {
            drawKey(container, topKey, heartXOffset + 5 * (heartColOffset + heartSize) + HUDKeyBindSize + HUDGuideKeyOffsetX, heartYOffset + HUDGuideOffsetY);
        } else bottomRowKeys[1] = "";
        if (Game.player.pushPullMode && Game.player.tilePosition.y !== Game.player2.tilePosition.y) {
            bottomRowKeys[0] = "";
            bottomRowKeys[2] = "";
        }
        for (let i = 0; i < bottomRowKeys.length; i++) {
            if (bottomRowKeys[i] !== "") {
                drawKey(container, bottomRowKeys[i], heartXOffset + 5 * (heartColOffset + heartSize) + HUDKeyBindSize * i + i * HUDGuideKeyOffsetX,
                    heartYOffset + HUDGuideOffsetY + HUDKeyBindSize + HUDGuideKeyOffsetY);
            }
        }
    }

    if (!Game.player2.dead && !Game.player.pushPullMode) {
        const heartXOffset = Game.app.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * 5 - HUDGuideOffsetX;
        let topKey = "I";
        const bottomRowKeys = ["L", "K", "J"];
        if (!Game.player2.pushPullMode || Game.player.tilePosition.x === Game.player2.tilePosition.x) {
            drawKey(container, topKey, heartXOffset - HUDKeyBindSize * 2 - HUDGuideKeyOffsetX, heartYOffset + HUDGuideOffsetY);
        } else bottomRowKeys[1] = "";
        if (Game.player2.pushPullMode && Game.player.tilePosition.y !== Game.player2.tilePosition.y) {
            bottomRowKeys[0] = "";
            bottomRowKeys[2] = "";
        }
        for (let i = 0; i < bottomRowKeys.length; i++) {
            if (bottomRowKeys[i] !== "") {
                drawKey(container, bottomRowKeys[i], heartXOffset - HUDKeyBindSize * (i + 1) - i * HUDGuideKeyOffsetX,
                    heartYOffset + HUDGuideOffsetY + HUDKeyBindSize + HUDGuideKeyOffsetY);
            }
        }
    }
}

function drawKey(container, keyText, posX, posY) {
    const key = new PIXI.Container();
    const text = new PIXI.Text(keyText, HUDKeyBindTextStyle);
    const rect = new PIXI.Graphics();
    rect.beginFill(0xffffff);
    rect.lineStyle(2, 0x666666, 0.5);
    const rectSize = HUDKeyBindSize;
    rect.drawRect(posX, posY, rectSize, rectSize);
    rect.endFill();
    text.position.set(posX + (rectSize - text.width) / 2, posY + (rectSize - text.height) / 2);
    key.addChild(rect);
    key.addChild(text);
    container.addChild(key);
    return key;
}

export function drawInteractionKeys() {
    return;
    const container = HUD.interactionGuide;
    removeAllChildrenFromContainer(container);
    if (Game.player.dead || Game.player2.dead) return;
    const playerSize = 50;
    const offsetY = 18;
    const iconSize = 30;
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x && Game.player.tilePosition.y === Game.player2.tilePosition.y) {
        const playerSprite = drawPlayer(Game.player);
        drawPlayer(Game.player2);
        if (Game.followMode) {
            drawIconAndKey("src/images/icons/unchain_icon.png", "F",
                Game.app.renderer.screen.width / 2 + playerSize + HUDKeyBindSize / 2, offsetY + playerSize - HUDKeyBindSize - iconSize - 5);
            const chain = new PIXI.Sprite(Game.resources["src/images/follow_chain.png"].texture);
            chain.width = chain.height = playerSize;
            chain.anchor.set(0.5, 0.5);
            chain.zIndex = Game.primaryPlayer.zIndex;
            chain.angle = 45;
            chain.alpha = 0.8;
            chain.position.x = playerSprite.position.x + playerSprite.width / 2;
            chain.position.y = playerSprite.position.y + playerSprite.height / 2;
            container.addChild(chain);
        } else {
            drawIconAndKey("src/images/icons/chain_icon.png", "F",
                Game.app.renderer.screen.width / 2 + playerSize + HUDKeyBindSize / 2, offsetY + playerSize - HUDKeyBindSize - iconSize - 5);
        }
        const swapTexture = Game.player === Game.primaryPlayer ? "src/images/icons/swap_icon_1.png" : "src/images/icons/swap_icon_2.png";
        drawIconAndKey(swapTexture, "Z",
            Game.app.renderer.screen.width / 2 - playerSize - HUDKeyBindSize / 2, offsetY + playerSize - HUDKeyBindSize - iconSize - 5);

        function drawPlayer(player) {
            const texture = player === Game.player ? "src/images/player.png" : "src/images/player2.png";
            const playerSprite = new PIXI.Sprite(Game.resources[texture].texture);
            playerSprite.width = playerSize;
            playerSprite.height = playerSize;
            playerSprite.zIndex = player.zIndex;
            playerSprite.position.x = Game.app.renderer.screen.width / 2 - playerSize / 2;
            playerSprite.position.y = offsetY;
            container.addChild(playerSprite);
            return playerSprite;
        }

        function drawIconAndKey(iconTexture, keyText, posX, posY) {
            const icon = new PIXI.Sprite(Game.resources[iconTexture].texture);
            icon.width = icon.height = iconSize;
            icon.position.set(posX - iconSize / 2, posY);
            container.addChild(icon);
            drawKey(container, keyText, posX - HUDKeyBindSize / 2, posY + iconSize + 5);
        }
    } else if (Math.abs(Game.player.tilePosition.x - Game.player2.tilePosition.x) + Math.abs(Game.player.tilePosition.y - Game.player2.tilePosition.y) === 1) {
        const togetherSprite = new PIXI.Sprite(Game.resources["src/images/icons/together_icon.png"].texture);
        togetherSprite.width = playerSize * 2;
        togetherSprite.height = playerSize;
        togetherSprite.position.x = Game.app.renderer.screen.width / 2 - togetherSprite.width / 2;
        togetherSprite.position.y = offsetY;
        container.addChild(togetherSprite);
        if (!Game.player2.pushPullMode)
            drawKey(container, "R", Game.app.renderer.screen.width / 2 - togetherSprite.width / 2 - HUDKeyBindSize, offsetY + playerSize / 2 - HUDKeyBindSize);
        if (!Game.player.pushPullMode)
            drawKey(container, "P", Game.app.renderer.screen.width / 2 + togetherSprite.width / 2, offsetY + playerSize / 2 - HUDKeyBindSize);
        const fKey = drawKey(container, "F", Game.app.renderer.screen.width / 2 - HUDKeyBindSize / 2, offsetY + togetherSprite.height / 2 - HUDKeyBindSize / 2);
        fKey.zIndex = 1;
        if (Game.followMode) {
            const chain = new PIXI.Sprite(Game.resources["src/images/follow_chain.png"].texture);
            chain.width = chain.height = playerSize;
            chain.anchor.set(0.5, 0.5);
            chain.angle = 45;
            chain.position.x = togetherSprite.position.x + togetherSprite.width / 2;
            chain.position.y = togetherSprite.position.y + togetherSprite.height / 2;
            container.addChild(chain);
        }
    }
}

export function redrawEnergy() {
    const container = HUD.energy;
    removeAllChildrenFromContainer(container);
    const text = new PIXI.Text(`LE = ${Game.lightEnergy}\nDE = ${Game.darkEnergy}`, HUDTextStyle);
    container.addChild(text);
}

export function drawMiniMap() {
    for (let i = 0; i < Game.minimap.length; i++) {
        for (let j = 0; j < Game.minimap[0].length; j++) {
            HUD.minimap.removeChild(Game.minimap[i][j]);
        }
    }

    Game.minimap = [];
    for (let i = 0; i < Game.map.length; i++) {
        Game.minimap[i] = [];
        for (let j = 0; j < Game.map[0].length; j++) {
            redrawMiniMapPixel(j, i);
        }
    }
    const miniMapWidth = Game.map[0].length * miniMapPixelSize;
    const miniMapHeight = Game.map.length * miniMapPixelSize;
    HUD.minimap.removeChild(HUD.minimap.bg);
    HUD.minimap.bg = new PIXI.Graphics();
    const lineWidth = 3;
    /*hmmm.... it seems that element's width changes by one line width exactly because half of line width
    from both sides goes inward and another one goes outward? Dunno, just my hypothesis*/
    HUD.minimap.bg.lineStyle(lineWidth, 0xffffff, 0.8);
    HUD.minimap.bg.beginFill(0x000000, 0.2);
    HUD.minimap.bg.drawRect(0, 0, miniMapWidth + lineWidth, miniMapHeight + lineWidth);
    HUD.minimap.bg.zIndex = -1;
    HUD.minimap.addChild(HUD.minimap.bg);
    HUD.minimap.bg.position.set(-lineWidth / 2, -lineWidth / 2);
    HUD.minimap.position.set(Game.app.renderer.screen.width - miniMapWidth - slotBorderOffsetX - lineWidth / 2, Game.app.renderer.screen.height - miniMapHeight - 15)
}

export function redrawMiniMapPixel(x, y) {
    if (Game.minimap[y][x]) {
        HUD.minimap.removeChild(Game.minimap[y][x]);
    }
    const pixel = new PIXI.Graphics();
    if (Game.map[y][x].tileType === TILE_TYPE.WALL) {
        pixel.beginFill(0x7a5916);
    } else if (Game.map[y][x].tileType === TILE_TYPE.SUPER_WALL) {
        pixel.beginFill(0x757167);
    } else if (Game.map[y][x].tileType === TILE_TYPE.VOID) {
        pixel.beginFill(0x000000);
    } else if (Game.map[y][x].entity === Game.player || Game.map[y][x].entity === Game.player2) {
        pixel.beginFill(0x0000ff);
    } else pixel.beginFill(0xffffff);
    pixel.drawRect(miniMapPixelSize * x, miniMapPixelSize * y, miniMapPixelSize, miniMapPixelSize);
    HUD.minimap.addChild(pixel);
    Game.minimap[y][x] = pixel;
    if (!Game.map[y][x].lit) {
        pixel.visible = false;
    }
}

function drawOther() {
    const container = HUD.other;
    removeAllChildrenFromContainer(container);
    const playerSize = 60;
    drawPlayer(Game.player, heartBorderOffsetX + heartSize / 2 - playerSize / 2, heartYOffset + heartSize / 2 - playerSize / 2);
    drawPlayer(Game.player2, Game.app.renderer.screen.width - heartBorderOffsetX - (heartSize + heartColOffset) * 5 + heartColOffset + heartSize / 2 - playerSize / 2,
        heartYOffset + heartSize / 2 - playerSize / 2);

    function drawPlayer(player, posX, posY) {
        let playerSprite;
        if (player === Game.player) playerSprite = new PIXI.Sprite(Game.resources["src/images/player.png"].texture);
        else {
            playerSprite = new PIXI.Sprite(Game.resources["src/images/player2.png"].texture);
            playerSprite.anchor.set(0.5, 0.5);
            //playerSprite.angle = 180;
        }
        playerSprite.width = playerSprite.height = playerSize;
        playerSprite.alpha = 0.5;
        playerSprite.position.x = posX + playerSprite.width * playerSprite.anchor.x;
        playerSprite.position.y = posY + playerSprite.height * playerSprite.anchor.y;
        container.addChild(playerSprite);
    }
}