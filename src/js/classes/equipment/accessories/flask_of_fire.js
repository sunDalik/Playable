import {ACCESSORY_TYPE, DAMAGE_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {AccessoriesSpriteSheet, EffectsSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {TileElement} from "../../tile_elements/tile_element";
import {Game} from "../../../game";
import {easeOutQuad} from "../../../utils/math_utils";
import {randomChoice, randomInt} from "../../../utils/random_utils";

export class FlaskOfFire extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["flask_of_fire.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.type = ACCESSORY_TYPE.FLASK_OF_FIRE;
        this.name = "Flask of Fire";
        this.description = "Deal additional 0.5 damage whenever you attack with a non-magical weapon\nThis damage ignores your attack multiplier";
        this.rarity = RARITY.C;
    }

    onEnemyDamage(wielder, enemy, damageType) {
        if (damageType === DAMAGE_TYPE.PHYSICAL && !enemy.dead) {
            enemy.damage(wielder, 0.5, 0, 0, DAMAGE_TYPE.HAZARDAL);
            this.animateFire(enemy);
        }
    }

    animateFire(enemy) {
        //stolen from necromancy
        const fire = new TileElement(EffectsSpriteSheet["fire_effect.png"], enemy.tilePosition.x, enemy.tilePosition.y);
        Game.world.addChild(fire);
        fire.position.x += randomInt(Game.TILESIZE / 10, Game.TILESIZE / 3) * randomChoice([-1, 1]);
        fire.position.y -= randomInt(-Game.TILESIZE / 4, Game.TILESIZE / 3);
        fire.width = fire.height = Game.TILESIZE / 3;
        const initSize = fire.width;
        const sizeChange = Game.TILESIZE / 4;
        const startPosY = fire.position.y;
        const posYEndChange = -Game.TILESIZE / 2;
        fire.zIndex = enemy.zIndex + 1;

        const animationTime = 9;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            fire.position.y = startPosY + easeOutQuad(counter / animationTime) * posYEndChange;
            fire.height = fire.width = initSize + easeOutQuad(counter / animationTime) * sizeChange;
            if (counter >= animationTime * 3 / 4) {
                fire.alpha = 1 - easeOutQuad((counter - animationTime * 3 / 4) / (animationTime / 4));
            }

            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(fire);
                fire.destroy();
            }
        };

        Game.app.ticker.add(animation);
    }
}