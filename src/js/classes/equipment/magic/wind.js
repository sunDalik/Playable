import {Game} from "../../../game";
import {EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums/enums";
import {EffectsSpriteSheet, MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {TileElement} from "../../tile_elements/tile_element";
import {toRadians} from "../../../utils/math_utils";
import {fadeOutAndDie} from "../../../animations";
import {castWind} from "../../../special_move_logic";

export class Wind extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_wind.png"];
        this.id = EQUIPMENT_ID.WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.radius = 3;
        this.crystal = false;
        this.atk = 1;
        this.uses = this.maxUses = 5;
        this.name = "Wind";
        this.description = `Push away all enemies in radius ${this.radius} by 2 tiles\nIf an enemy can't be pushed enough it takes ${this.atk} damage`;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const blowDistance = 2;
        castWind(wielder, this.radius, blowDistance, wielder.getAtk(this), this.crystal);
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