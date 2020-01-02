import {Enemy} from "../enemy";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "../../../drawing/draw_utils";
import {Game} from "../../../game";
import {HUD} from "../../../drawing/hud_object";
import * as PIXI from "pixi.js";
import {
    bossHeartOffset,
    bossHeartSize,
    bottomBossHeartOffset,
    HUDTextStyleTitle
} from "../../../drawing/draw_constants";
import {deactivateBossMode} from "../../../game_logic";

export class Boss extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.boss = true;
        this.name = "";
        Game.boss = this;
        Game.world.removeChild(this.healthContainer);
    }

    moveHealthContainer() {
    }

    redrawHealth() {
        removeAllChildrenFromContainer(HUD.bossHealth);
        const healthArray = getHealthArray(this);
        HUD.bossHealth.position.y = Game.app.renderer.screen.height - bossHeartSize - bottomBossHeartOffset;
        HUD.bossHealth.position.x = Game.app.renderer.screen.width / 2 - (healthArray.length * (bossHeartSize + bossHeartOffset) - bossHeartOffset) / 2;
        for (let i = 0; i < healthArray.length; ++i) {
            const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
            heart.height = heart.width = bossHeartSize;
            heart.position.x = i * (bossHeartSize + bossHeartOffset);
            HUD.bossHealth.addChild(heart);
        }
        const text = new PIXI.Text(this.name, HUDTextStyleTitle);
        text.position.y = -text.height - 10;
        HUD.bossHealth.addChild(text);
    }

    die(source) {
        super.die(source);
        removeAllChildrenFromContainer(HUD.bossHealth);
        deactivateBossMode();
    }
}