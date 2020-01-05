import * as PIXI from "pixi.js";
import {HUD} from "./hud_object";
import {HUDTextStyleGameOver} from "./draw_constants";

export const SUPER_HUD = new PIXI.Container();
SUPER_HUD.filters = [];
SUPER_HUD.zIndex = HUD.zIndex + 1;

SUPER_HUD.gameOverScreen = new PIXI.Container();
const text = new PIXI.Text("You were lost\nWanna try again?\nPress R to retry", HUDTextStyleGameOver);
SUPER_HUD.gameOverScreen.addChild(text);

SUPER_HUD.gameOverScreen.visible = false;
SUPER_HUD.addChild(SUPER_HUD.gameOverScreen);