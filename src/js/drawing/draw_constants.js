import {Game} from "../game";

export const heartSize = 45;
export const heartBorderOffsetX = 30;
export const heartRowOffset = 0;
export const heartColOffset = 0;
export const heartYOffset = 25;
export const slotSize = 62;
export const slotOffsetFromHeartsY = 20;
export const slotsRowOffset = 15;
export const slotsColOffset = 15;
export const slotContentSizeMargin = 8;
export const slotBorderOffsetX = 25;
export const statsOffsetX = 15;

export const miniMapPixelSize = 5;
export const miniMapBottomOffset = 25;

export const bossHeartSize = 35;
export const bossHeartOffset = -16;
export const bottomBossHeartOffset = 25;

export const HUDFontSize = 16;
export const HUDSlotFontSize = 13;
export const HUDGameOverFontSize = 26;
export const HUDTitleFontSize = 20;
export const HUDTextStyle = {
    fontSize: HUDFontSize,
    fill: 0xffffff,
    fontWeight: "bold",
    stroke: 0x000000,
    strokeThickness: 2,
    align: "center"
};

export const HUDTextStyleTitle = Object.assign({}, HUDTextStyle, {fontSize: HUDTitleFontSize});
export const HUDTextStyleGameOver = Object.assign({}, HUDTextStyle, {fontSize: HUDGameOverFontSize});
export const HUDTextStyleSlot = Object.assign({}, HUDTextStyle, {
    fontSize: HUDSlotFontSize,
    lineHeight: HUDSlotFontSize - 2,
    fill: 0xeeeeee
});

export const HUDKeyBindFontsize = 13;
export const HUDKeyBindTextStyle = Object.assign({}, HUDTextStyle, {fontSize: HUDKeyBindFontsize});

export const HUDKeyBindSize = 20;
export const HUDGuideOffsetX = 15;
export const HUDGuideOffsetY = 0;
export const HUDGuideKeyOffsetX = 4;
export const HUDGuideKeyOffsetY = 4;
export const healthBarLength = 5;

export function getInanimateItemLabelTextStyle() {
    return Object.assign({}, HUDTextStyle, {fontSize: Game.TILESIZE / 3.3, strokeThickness: 3});
}