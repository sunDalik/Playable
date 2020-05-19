import {redrawSlotContents} from "../../../drawing/draw_hud";
import {SLOT} from "../../../enums";
import {Equipment} from "../equipment";
import * as PIXI from "pixi.js";
import {Game} from "../../../game";
import {Z_INDEXES} from "../../../z_indexing";
import {easeInQuad} from "../../../utils/math_utils";

export class AbstractShield extends Equipment {
    constructor() {
        super();
    }

    activate(wielder) {
        if (this.uses <= 0) return false;
        this.uses--;
        this.animateShield(wielder);
        redrawSlotContents(wielder, SLOT.EXTRA);
        return true;
    }

    onBlock(source, wielder) {
    }

    onNextLevel(player) {
        this.uses += Math.ceil(this.maxUses / 2);
        if (this.uses > this.maxUses) this.uses = this.maxUses;
        redrawSlotContents(player, SLOT.EXTRA);
    }

    animateShield(wielder) {
        const shieldSprite = new PIXI.Sprite(this.texture);
        shieldSprite.anchor.set(0.5, 0.5);
        shieldSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        const initSize = Game.TILESIZE * 0.5;
        const bigSize = Game.TILESIZE * 1.7;
        const finalSize = Game.TILESIZE * 1.1;
        shieldSprite.width = shieldSprite.height = initSize;
        shieldSprite.zIndex = wielder.zIndex + Z_INDEXES.PLAYER_PRIMARY - Z_INDEXES.PLAYER + 1;
        Game.world.addChild(shieldSprite);
        const animationTimeS = 4;
        const animationTimeB = 4;
        const stayTime = 6;
        let counter = 0;

        wielder.cancelAnimation();
        wielder.animationSubSprites.push(shieldSprite);

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter <= animationTimeS) {
                shieldSprite.width = shieldSprite.height = initSize + easeInQuad(counter / animationTimeS) * (bigSize - initSize);
            } else if (counter <= animationTimeS + animationTimeB) {
                shieldSprite.width = shieldSprite.height = bigSize - easeInQuad((counter - animationTimeS) / animationTimeB) * (bigSize - finalSize);
            } else {
                shieldSprite.width = shieldSprite.height = finalSize;
            }
            if (counter >= animationTimeS + animationTimeB + stayTime) {
                Game.app.ticker.remove(animation);
                wielder.cancelAnimation();
            }
        };
        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }
}