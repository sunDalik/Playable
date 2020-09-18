import {InanimatesSpriteSheet} from "../../../loader";
import {Shrine} from "./shrine";
import {createFadingText, shakeScreen} from "../../../animations";
import {getRandomNonWeaponItem} from "../../../utils/pool_utils";
import {drawStatsForPlayer} from "../../../drawing/draw_hud";

export class ShrineOfImp extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_imp.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Imp";
        this.description = "Get 2 random items\nLose 0.5 defense";
        this.working = true;
        this.setScaleModifier(1.17);
    }

    interact(player) {
        if (this.working) {
            for (let i = 0; i < 2; i++) {
                const item = getRandomNonWeaponItem();
                this.dropItemOnFreeTile(item);
            }
            shakeScreen();
            this.working = false;
            this.textObj.text = "";
            this.texture = InanimatesSpriteSheet["shrine_of_imp_activated.png"];
            player.defBase -= 0.5;
            drawStatsForPlayer(player);
            createFadingText("Contract signed", this.position.x, this.position.y);
            this.successfullyActivate();
        }
    }

    onUpdate() {
        if (this.working) {
            super.onUpdate();
        } else {
            this.filters = [];
        }
    }
}