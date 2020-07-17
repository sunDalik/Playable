import {EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums";
import {EffectsSpriteSheet, MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {isBullet, isEmpty, isEnemy, isNotAWall, isNotOutOfMap, tileInsideTheBossRoom} from "../../../map_checks";
import {Game} from "../../../game";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {otherPlayer, tileDistance} from "../../../utils/game_utils";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {camera} from "../../game/camera";
import {TileElement} from "../../tile_elements/tile_element";
import {easeOutQuad, toRadians} from "../../../utils/math_utils";
import {fadeOutAndDie} from "../../../animations";

export class Escape extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_escape.png"];
        this.id = EQUIPMENT_ID.ESCAPE;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.uses = this.maxUses = 6;
        this.name = "Escape";
        this.description = "Teleports both characters to a random safe location not too far away from you\nIf can't find a safe tile, it will stun enemies around you";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const range = 10;
        const safeTiles = [];
        //todo separate players sometimes??
        for (let i = wielder.tilePosition.y - range; i <= wielder.tilePosition.y + range; i++) {
            for (let j = wielder.tilePosition.x - range; j <= wielder.tilePosition.x + range; j++) {
                if (isNotOutOfMap(j, i) && isNotAWall(j, i) && Game.map[i][j].lit && isEmpty(j, i)
                    && Game.map[i][j].hazard === null && this.noEnemiesInRange({x: j, y: i}, 2)
                    && (Game.bossFight === false || tileInsideTheBossRoom(j, i))) {
                    safeTiles.push({x: j, y: i});
                }
            }
        }
        if (safeTiles.length === 0) {
            const stunRange = 2;
            for (let i = wielder.tilePosition.y - stunRange; i <= wielder.tilePosition.y + stunRange; i++) {
                for (let j = wielder.tilePosition.x - stunRange; j <= wielder.tilePosition.x + stunRange; j++) {
                    if (isEnemy(j, i)) {
                        Game.map[i][j].entity.addStun(3);
                    }
                }
            }
            this.createSmokeAnimation(wielder.tilePosition.x, wielder.tilePosition.y);
        } else {
            const tile = randomChoice(safeTiles);
            const cameraTime = Math.max(tileDistance({tilePosition: {x: tile.x, y: tile.y}}, wielder),
                otherPlayer(wielder).dead ? 0 :
                    tileDistance({tilePosition: {x: tile.x, y: tile.y}}, otherPlayer(wielder)));
            this.createSmokeAnimation(wielder.tilePosition.x, wielder.tilePosition.y);
            wielder.setTilePosition(tile.x, tile.y);
            lightPlayerPosition(wielder);
            if (!otherPlayer(wielder).dead) {
                this.createSmokeAnimation(otherPlayer(wielder).tilePosition.x, otherPlayer(wielder).tilePosition.y);
                otherPlayer(wielder).setTilePosition(tile.x, tile.y);
                lightPlayerPosition(otherPlayer(wielder));
            }
            this.createSmokeAnimation(tile.x, tile.y);
            camera.moveToCenter(cameraTime);
        }
        this.uses--;
        return true;
    }

    createSmokeAnimation(x, y) {
        const particlesAmount = 4;
        for (let i = 0; i < particlesAmount; i++) {
            const smokeParticle = new TileElement(EffectsSpriteSheet["smoke_effect.png"], x, y);
            smokeParticle.angle = -90 + randomInt(0, 360 / particlesAmount) + i * (360 / particlesAmount);
            Game.world.addChild(smokeParticle);
            const initSize = Game.TILESIZE * 0.8;
            const finalSize = Game.TILESIZE * 1.2;
            smokeParticle.width = smokeParticle.height = initSize;
            const animationTime = 20;
            const startSpeed = Game.TILESIZE / animationTime;
            smokeParticle.x += Game.TILESIZE / 2 * Math.cos(toRadians(smokeParticle.angle * -1));
            smokeParticle.y -= Game.TILESIZE / 2 * Math.sin(toRadians(smokeParticle.angle * -1));
            const initPos = smokeParticle.position;
            let counter = 0;

            const animation = delta => {
                counter += delta;
                if (counter <= animationTime) {
                    smokeParticle.width = smokeParticle.height = initSize + (finalSize - initSize) * easeOutQuad(counter / animationTime);
                    smokeParticle.position.y = initPos.y - (startSpeed - easeOutQuad(counter / animationTime) * startSpeed) *
                        Math.sin(toRadians(smokeParticle.angle * -1));
                    smokeParticle.position.x = initPos.x + (startSpeed - easeOutQuad(counter / animationTime) * startSpeed) *
                        Math.cos(toRadians(smokeParticle.angle * -1));
                } else {
                    Game.app.ticker.remove(animation);
                    fadeOutAndDie(smokeParticle);
                }
            };
            Game.app.ticker.add(animation);
        }
    }

    noEnemiesInRange(tile, range) {
        for (let i = tile.y - range; i <= tile.y + range; i++) {
            for (let j = tile.x - range; j <= tile.x + range; j++) {
                if (isBullet(j, i) || isEnemy(j, i)) return false;
            }
        }
        return true;
    }
}