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
import {deactivateBossMode, dropItem} from "../../../game_logic";
import {randomInt, randomShuffle} from "../../../utils/random_utils";
import {getPlayerOnTile, isEnemy} from "../../../map_checks";
import {getRandomChestDrop, getRandomWeapon} from "../../../utils/pool_utils";
import {Pedestal} from "../../inanimate_objects/pedestal";
import {HealingPotion} from "../../equipment/bag/healing_potion";

export class Boss extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.boss = true;
        this.name = "";
        this.phases = 1;
        this.currentPhase = 1;
        this.drops = [];
        this.assignRandomDrops();
        Game.boss = this;
        Game.world.removeChild(this.healthContainer);
    }

    onBossModeActivate() {
    }

    static getBossRoomStats() {
        return {width: randomInt(10, 12), height: randomInt(10, 12)};
    }

    onMoveFrame() {
        this.placeShadow();
    }

    redrawHealth() {
        removeAllChildrenFromContainer(HUD.bossHealth, true);
        const healthArray = getHealthArray(this);
        HUD.bossHealth.position.y = Game.app.renderer.screen.height - bossHeartSize - bottomBossHeartOffset;
        HUD.bossHealth.position.x = Game.app.renderer.screen.width / 2 - (healthArray.length * (bossHeartSize + bossHeartOffset) - bossHeartOffset) / 2;
        for (let i = 0; i < healthArray.length; ++i) {
            const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
            heart.height = heart.width = bossHeartSize;
            heart.position.x = i * (bossHeartSize + bossHeartOffset);
            HUD.bossHealth.addChild(heart);
        }
        if (this.phases - this.currentPhase > 0) {
            const phaseCounter = new PIXI.Text(`x${this.phases - this.currentPhase + 1}`, HUDTextStyleTitle);
            phaseCounter.position.x = healthArray.length * (bossHeartSize + bossHeartOffset) + bossHeartSize / 2;
            phaseCounter.position.y = (bossHeartSize - phaseCounter.height) / 2;
            HUD.bossHealth.addChild(phaseCounter);
        }
        const text = new PIXI.Text(this.name, HUDTextStyleTitle);
        text.position.y = -text.height - 10;
        HUD.bossHealth.addChild(text);
    }

    die(source) {
        if (this.currentPhase < this.phases) {
            this.currentPhase++;
            this.health = this.maxHealth = this.getPhaseHealth(this.currentPhase);
            this.redrawHealth();
            this.changePhase(this.currentPhase);
        } else {
            super.die(source);
            removeAllChildrenFromContainer(HUD.bossHealth, true);
            deactivateBossMode();
            if (Game.bossNoDamage) this.spawnRewards(2);
            else this.spawnRewards(1);
            for (const drop of this.drops) {
                dropItem(drop, this.tilePosition.x, this.tilePosition.y);
            }
        }
    }

    getPhaseHealth(phase) {
        return this.maxHealth;
    }

    changePhase(newPhase) {
    }

    updateIntentIcon() {
        return false;
    }

    setStunIcon() {
        return false;
    }

    spawnRewards(number) {
        const centerX = Game.endRoomBoundaries[0].x + Math.floor((Game.endRoomBoundaries[1].x - Game.endRoomBoundaries[0].x + 1) / 2);
        const centerY = Game.endRoomBoundaries[0].y + Math.floor((Game.endRoomBoundaries[1].y - Game.endRoomBoundaries[0].y + 1) / 2);
        const configurations = randomShuffle([
            [{x: centerX - 1, y: centerY}, {x: centerX + 1, y: centerY}],
            [{x: centerX - 1, y: centerY - 1}, {x: centerX + 1, y: centerY + 1}],
            [{x: centerX + 1, y: centerY - 1}, {x: centerX - 1, y: centerY + 1}]]);
        for (const config of configurations) {
            if (!getPlayerOnTile(config[0].x, config[0].y) && !getPlayerOnTile(config[1].x, config[1].y)) {
                randomShuffle(config);
                for (let i = 0; i < Math.min(2, number); i++) {
                    const x = config[i].x;
                    const y = config[i].y;
                    if (isEnemy(x, y)) {
                        Game.map[y][x].entity.die();
                    }
                    const item = Math.random() < 0.6 ? getRandomChestDrop() : getRandomWeapon();
                    Game.world.addInanimate(new Pedestal(x, y, item));
                }
                break;
            }
        }
    }

    assignRandomDrops() {
        const healingPotionsAmount = randomInt(2, 3);
        for (let i = 0; i < healingPotionsAmount; i++) {
            this.drops.push(new HealingPotion());
        }
    }
}