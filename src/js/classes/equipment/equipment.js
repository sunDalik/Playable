import * as PIXI from "pixi.js";
import {RARITY} from "../../enums";

export class Equipment {
    constructor() {
        this.texture = PIXI.Texture.WHITE;
        this.name = "NAME";
        this.description = "DESCRIPTION";
        this.rarity = RARITY.C;
        this.wielder = null;
    }
}