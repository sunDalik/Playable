export const heartSize = 45;
export const heartBorderOffsetX = 30;
export const heartRowOffset = 0;
export const heartColOffset = 5;
export const heartYOffset = 25;
export const slotSize = 62;
export const slotOffsetFromHeartsY = 20;
export const slotsRowOffset = 15;
export const slotsColOffset = 15;
export const slotContentSizeMargin = 10;
export const slotBorderOffsetX = 15;
export const statsOffsetX = 15;
export const miniMapPixelSize = 5;

export const bossHeartSize = 35;
export const bossHeartOffset = 8;
export const bottomBossHeartOffset = 25;

export const HUDFontSize = 16;
export const HUDSlotFontSize = 12;
export const HUDBossFontSize = 18;
export const HUDTitleFontSize = 20;
export const HUDTextStyle = {
    fontSize: HUDFontSize,
    fill: 0xffffff,
    fontWeight: "bold",
    stroke: 0x333333,
    strokeThickness: 2,
    align: "center"
};

export const HUDTextStyleTitle = Object.assign({}, HUDTextStyle, {fontSize: HUDTitleFontSize});
export const HUDTextStyleBoss = Object.assign({}, HUDTextStyle, {fontSize: HUDBossFontSize});
export const HUDTextStyleSlot = Object.assign({}, HUDTextStyle, {
    fontSize: HUDSlotFontSize,
    lineHeight: HUDSlotFontSize - 2
});

export const HUDKeyBindFontsize = 13;
export const HUDKeyBindTextStyle = {
    fontSize: HUDKeyBindFontsize,
    fill: 0xffffff,
    fontWeight: "bold",
    stroke: 0x333333,
    strokeThickness: 2,
};

export const HUDKeyBindSize = 20;
export const HUDGuideOffsetX = 20;
export const HUDGuideOffsetY = -5;
export const HUDGuideKeyOffsetX = 7;
export const HUDGuideKeyOffsetY = 7;