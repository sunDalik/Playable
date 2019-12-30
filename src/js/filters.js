import {OutlineFilter} from "pixi-filters";
import * as PIXI from "pixi.js";

export const ITEM_OUTLINE_FILTER = new OutlineFilter(2, 0xFFFFFF);
ITEM_OUTLINE_FILTER.resolution = 2;

export const HIT_FILTER = new PIXI.filters.ColorMatrixFilter();
HIT_FILTER.resolution = 2;
HIT_FILTER.matrix = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
HIT_FILTER.alpha = 0.4;