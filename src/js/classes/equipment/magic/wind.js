import {Game} from "../../../game";
import {DAMAGE_TYPE, EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums";
import {isBullet, isEmpty, isEnemy, isNotOutOfMap} from "../../../map_checks";
import {EffectsSpriteSheet, MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {randomChoice} from "../../../utils/random_utils";
import {tileDistanceDiagonal} from "../../../utils/game_utils";
import {TileElement} from "../../tile_elements/tile_element";
import {toRadians} from "../../../utils/math_utils";
import {fadeOutAndDie} from "../../../animations";

export class Wind extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_wind.png"];
        this.id = EQUIPMENT_ID.WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.radius = 3;
        this.crystal = false;
        this.slideTime = 2;
        this.atk = 1;
        this.uses = this.maxUses = 5;
        this.name = "Wind";
        this.description = `Push away all enemies in radius ${this.radius} by 2 tiles\nIf an enemy can't be pushed enough it takes ${this.atk} damage`;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const blowDistance = 2;
        for (let r = this.radius; r >= 0; r--) {
            for (let x = -this.radius; x <= this.radius; x++) {
                for (let y = -this.radius; y <= this.radius; y++) {
                    const tile = {x: wielder.tilePosition.x + x, y: wielder.tilePosition.y + y};
                    if (Math.abs(x) + Math.abs(y) === r && isNotOutOfMap(tile.x, tile.y)) {
                        const hazard = Game.map[tile.y][tile.x].hazard;
                        if (hazard && this.crystal) {
                            hazard.removeFromWorld();
                        }
                        if (this.crystal && isBullet(x, y)) {
                            for (let i = Game.bullets.length - 1; i >= 0; i--) {
                                if (Game.bullets[i].tilePosition.x === tile.x && Game.bullets[i].tilePosition.y === tile.y) {
                                    Game.bullets[i].die();
                                }
                            }
                        }
                        if (isEnemy(tile.x, tile.y)) {
                            const enemy = Game.map[tile.y][tile.x].entity;
                            enemy.stun += 2;
                            const direction = {
                                x: Math.sign(enemy.tilePosition.x - wielder.tilePosition.x),
                                y: Math.sign(enemy.tilePosition.y - wielder.tilePosition.y)
                            };
                            if (direction.x === 0) direction.x = randomChoice([-1, 1]);
                            if (direction.y === 0) direction.y = randomChoice([-1, 1]);
                            let newTilePosition = {x: enemy.tilePosition.x, y: enemy.tilePosition.y};
                            let succeeded = false;
                            for (let i = 0; i < blowDistance; i++) {
                                succeeded = false;
                                for (const dir of [direction, {x: direction.x, y: 0}, {x: 0, y: direction.y}]) {
                                    if (isEmpty(newTilePosition.x + dir.x, newTilePosition.y + dir.y)) {
                                        succeeded = true;
                                        newTilePosition.x += dir.x;
                                        newTilePosition.y += dir.y;
                                        break;
                                    }
                                }
                                if (!succeeded) {
                                    break;
                                }
                            }
                            const animationTime = this.slideTime * tileDistanceDiagonal({
                                tilePosition: {
                                    x: newTilePosition.x,
                                    y: newTilePosition.y
                                }
                            }, enemy);
                            if (succeeded) {
                                enemy.slide(newTilePosition.x - enemy.tilePosition.x, newTilePosition.y - enemy.tilePosition.y, null, null, animationTime);
                            } else {
                                enemy.slide(newTilePosition.x - enemy.tilePosition.x, newTilePosition.y - enemy.tilePosition.y, null, () => {
                                    enemy.slideBump(direction.x, direction.y, null, null, this.slideTime);
                                    enemy.damage(wielder, wielder.getAtk(this), direction.x, direction.y, DAMAGE_TYPE.MAGICAL);
                                }, animationTime);
                            }
                        }
                    }
                }
            }
        }
        this.animateWind(wielder.tilePosition.x, wielder.tilePosition.y);
        this.uses--;
        return true;
    }

    animateWind(x, y) {
        const particlesAmount = this.crystal ? 6 : 4;
        for (let i = 0; i < particlesAmount; i++) {
            const texture = this.crystal ? EffectsSpriteSheet["crystal_wind_effect.png"] : EffectsSpriteSheet["leaf_effect.png"];
            const windParticle = new TileElement(texture, x, y);
            windParticle.angle = (360 / particlesAmount) / 2 + i * (360 / particlesAmount);
            const formulaAngle = () => {
                return toRadians(windParticle.angle * -1 - 90);
            };
            Game.world.addChild(windParticle);
            windParticle.width = windParticle.height = Game.TILESIZE;
            const animationTime = 12;
            windParticle.x += Game.TILESIZE / 2 * Math.cos(formulaAngle());
            windParticle.y -= Game.TILESIZE / 2 * Math.sin(formulaAngle());
            const angleStep = -25;
            let radius = Game.TILESIZE / 2;
            windParticle.position.set(windParticle.getTilePositionX() + Math.cos(formulaAngle()) * radius,
                windParticle.getTilePositionY() - Math.sin(formulaAngle()) * radius);
            const radiusStep = (Game.TILESIZE * 2.5 - radius) / animationTime;
            let counter = 0;

            const animation = delta => {
                counter += delta;
                if (counter <= animationTime) {
                    windParticle.angle += angleStep * delta;
                    radius += radiusStep * delta;
                    windParticle.position.set(windParticle.getTilePositionX() + Math.cos(formulaAngle()) * radius,
                        windParticle.getTilePositionY() - Math.sin(formulaAngle()) * radius);
                } else {
                    Game.app.ticker.remove(animation);
                    fadeOutAndDie(windParticle);
                }
            };
            Game.app.ticker.add(animation);
        }
    }
}