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
import {getRandomInt} from "../../../utils/random_utils";
import {isEmpty, isEntity, isInanimate} from "../../../map_checks";
import {getRandomChestDrop, getRandomWeapon} from "../../../utils/pool_utils";
import {Pedestal} from "../../inanimate_objects/pedestal";
import {getCardinalDirections} from "../../../utils/map_utils";
import {INANIMATE_TYPE, ROLE} from "../../../enums";

export class Boss extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.boss = true;
        this.name = "";
        this.drops = [];
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
        if (Game.bossNoDamage) this.spawnRewards(2);
        else this.spawnRewards(1);
    }

    updateIntentIcon() {
        return false;
    }

    //todo: make it SYMMETRICAL
    spawnRewards(number) {
        const attemptMax = 1000;
        const getRandomPointInEndRoom = (prop, attempt) => {
            const center = Game.endRoomBoundaries[0][prop] + Math.floor((Game.endRoomBoundaries[1][prop] - Game.endRoomBoundaries[0][prop]) / 2);
            const negOffset = center - Game.endRoomBoundaries[0][prop] - 1;
            const posOffset = Game.endRoomBoundaries[1][prop] - center - 1;
            const getOffsetConsideringAttempt = offset => Math.max(2, Math.floor(offset * (attempt / (attemptMax * 0.75))));
            return getRandomInt(center - getOffsetConsideringAttempt(negOffset), center + getOffsetConsideringAttempt(posOffset));
        };

        for (let i = 0; i < number; i++) {
            let attempt = 0;
            while (attempt++ < attemptMax) {
                const x = getRandomPointInEndRoom("x", attempt);
                const y = getRandomPointInEndRoom("y", attempt);
                if (isEmpty(x, y)) {
                    let pedestalNearby = false;
                    for (const dir of getCardinalDirections()) {
                        if (isEntity(x + dir.x, y + dir.y, ROLE.INANIMATE, INANIMATE_TYPE.PEDESTAL)) {
                            pedestalNearby = true;
                            break;
                        }
                    }
                    if (pedestalNearby) continue;

                    let item;
                    if (Math.random() < 0.5) item = getRandomChestDrop();
                    else item = getRandomWeapon();
                    Game.world.addInanimate(new Pedestal(x, y, item));
                    break;
                }
            }
        }
    }
}