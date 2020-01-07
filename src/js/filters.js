import {ColorReplaceFilter, OutlineFilter, DotFilter, KawaseBlurFilter} from "pixi-filters";
import * as PIXI from "pixi.js";

export const ITEM_OUTLINE_FILTER = new OutlineFilter(2, 0xFFFFFF);
ITEM_OUTLINE_FILTER.resolution = 2;

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