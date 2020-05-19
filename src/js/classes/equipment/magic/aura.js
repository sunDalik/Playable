import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Light} from "./light";
import * as PIXI from "pixi.js";
import {Z_INDEXES} from "../../../z_indexing";
import {Game} from "../../../game";
import {TileElement} from "../../tile_elements/tile_element";

export class Aura extends Light {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_aura.png"];
        this.type = MAGIC_TYPE.AURA;
        this.uses = this.maxUses = 6;
        this.name = "Aura";
        this.description = "EDIT";
        this.auraContainer = this.initAura();
        this.onMoveFrameSubscriber = (wielder, death = false) => this.moveAura(wielder, death);
        this.calculateRarity();
    }

    initAura() {
        const aura = new PIXI.Container();
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                if (!(x === 0 && y === 0) && Math.abs(x) + Math.abs(y) <= 2) {
                    const auraPiece = new TileElement(PIXI.Texture.WHITE, x, y, true);
                    auraPiece.tint = 0xc7f1f9;
                    auraPiece.alpha = 0.5;
                    aura.addChild(auraPiece);
                }
            }
        }
        aura.zIndex = Z_INDEXES.HAZARD;
        return aura;
    }

    onWear(wielder) {
        Game.world.addChild(this.auraContainer);
        super.onWear(wielder);
    }

    moveAura(wielder, death = false) {
        if (death) Game.world.removeChild(this.auraContainer);
        // sorry... I REALLY have no idea why do you set position like that but it works :(
        else this.auraContainer.position.set(wielder.position.x - Game.TILESIZE / 2, wielder.position.y - wielder.tallModifier / 2);
    }

    onDeath(wielder) {
        super.onDeath(wielder);
        Game.world.removeChild(this.auraContainer);
    }

    onRevive(wielder) {
        super.onRevive(wielder);
        Game.world.addChild(this.auraContainer);
    }

}

Aura.requiredMagic = Light;