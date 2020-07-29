import {
    AdjustmentFilter,
    ColorOverlayFilter,
    ColorReplaceFilter,
    DotFilter,
    GlowFilter,
    KawaseBlurFilter,
    OutlineFilter
} from "pixi-filters";
import * as PIXI from "pixi.js";

export const ITEM_OUTLINE_FILTER = new OutlineFilter(2, 0xFFFFFF);
ITEM_OUTLINE_FILTER.padding = 3;
ITEM_OUTLINE_FILTER.resolution = 2;

export const ITEM_OUTLINE_FILTER_SMALL = new OutlineFilter(1, 0xFFFFFF);
ITEM_OUTLINE_FILTER_SMALL.padding = 2;
ITEM_OUTLINE_FILTER_SMALL.resolution = 2;

export const GRAIL_TEXT_WHITE_FILTER = new GlowFilter({
    distance: 9,
    outerStrength: 4,
    innerStrength: 0,
    color: 0xffffff,
    quality: 0.3
});
GRAIL_TEXT_WHITE_FILTER.padding = 9;
GRAIL_TEXT_WHITE_FILTER.resolution = 2;

export const GRAIL_TEXT_DARK_FILTER = new GlowFilter({
    distance: 8,
    outerStrength: 3,
    innerStrength: 0,
    color: 0x000000,
    quality: 0.3
});
GRAIL_TEXT_DARK_FILTER.padding = 8;
GRAIL_TEXT_DARK_FILTER.resolution = 2;

export const MILD_DARK_GLOW_FILTER = new GlowFilter({
    distance: 4,
    outerStrength: 2,
    innerStrength: 0,
    color: 0x000000,
    quality: 0.3
});
MILD_DARK_GLOW_FILTER.padding = 4;
MILD_DARK_GLOW_FILTER.resolution = 2;

export const MILD_WHITE_GLOW_FILTER = new GlowFilter({
    distance: 5,
    outerStrength: 3,
    innerStrength: 0,
    color: 0xffffff,
    quality: 0.3
});
MILD_WHITE_GLOW_FILTER.padding = 5;
MILD_WHITE_GLOW_FILTER.resolution = 2;


export const BIG_DARK_GLOW_FILTER = new GlowFilter({
    distance: 9,
    outerStrength: 8,
    innerStrength: 0,
    color: 0x000000,
    quality: 0.3
});
BIG_DARK_GLOW_FILTER.padding = 10;
BIG_DARK_GLOW_FILTER.resolution = 2;

export const BIG_WHITE_GLOW_FILTER = new GlowFilter({
    distance: 9,
    outerStrength: 9,
    innerStrength: 0,
    color: 0xffffff,
    quality: 0.3
});
BIG_WHITE_GLOW_FILTER.padding = 10;
BIG_WHITE_GLOW_FILTER.resolution = 2;


export const WARNING_BULLET_OUTLINE_FILTER = new OutlineFilter(1, 0x81D0DA);
WARNING_BULLET_OUTLINE_FILTER.resolution = 2;

export const HIT_FILTER = new PIXI.filters.ColorMatrixFilter();
HIT_FILTER.resolution = 2;
HIT_FILTER.matrix = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
HIT_FILTER.alpha = 0.4;

export const BLACK_INVERT_FILTER = new ColorReplaceFilter([0, 0, 0], [1, 1, 1], 1);
BLACK_INVERT_FILTER.resolution = 2;

export const INVERT_FILTER = new PIXI.filters.ColorMatrixFilter();
INVERT_FILTER.negative();
INVERT_FILTER.resolution = 2;

export const DESATURATE_FILTER = new PIXI.filters.ColorMatrixFilter();
DESATURATE_FILTER.desaturate();
DESATURATE_FILTER.resolution = 2;

export const DEATH_FILTER = new DotFilter(2);
DEATH_FILTER.resolution = 2;

export const GAME_OVER_BLUR_FILTER = new KawaseBlurFilter(0.5);
GAME_OVER_BLUR_FILTER.maxBlur = 0.5;
GAME_OVER_BLUR_FILTER.resolution = 2;

export const WALL_TRAP_BASE_FILTER = new AdjustmentFilter({brightness: 1.5});
WALL_TRAP_BASE_FILTER.resolution = 2;

export const BLACK_COLOR_OVERLAY = new ColorOverlayFilter([0, 0, 0]);
BLACK_COLOR_OVERLAY.resolution = 2;


export const DIVINE_FILTER = new GlowFilter({
    distance: 10,
    outerStrength: 4,
    innerStrength: 0,
    color: 0x5ff0f0,
    quality: 0.3
});
DIVINE_FILTER.padding = 10;
DIVINE_FILTER.resolution = 2;

export const CURSED_FILTER = new OutlineFilter(2, 0xea4155);
CURSED_FILTER.padding = 3;
CURSED_FILTER.resolution = 2;

export const NIGHTMARE_FILTER_1 = new OutlineFilter(2, 0x7b77a8);
NIGHTMARE_FILTER_1.padding = 2;
NIGHTMARE_FILTER_1.resolution = 2;

export const NIGHTMARE_FILTER_2 = new GlowFilter({
    distance: 7,
    outerStrength: 2,
    innerStrength: 0,
    color: 0x7b77a8,
    quality: 0.3
});
NIGHTMARE_FILTER_2.padding = 7;
NIGHTMARE_FILTER_2.resolution = 2;