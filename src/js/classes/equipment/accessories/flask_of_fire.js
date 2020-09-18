import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet, EffectsSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {createSmallOffsetParticle} from "../../../animations";

export class FlaskOfFire extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["flask_of_fire.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.FLASK_OF_FIRE;
        this.name = "Flask of Fire";
        this.description = "Deal additional 0.5 damage whenever you attack with a non-magical weapon\nThis damage ignores your attack multiplier";
        this.rarity = RARITY.C;
    }

    onEnemyDamage(wielder, enemy, damageType) {
        if (damageType === DAMAGE_TYPE.PHYSICAL_WEAPON && !enemy.dead) {
            createSmallOffsetParticle(EffectsSpriteSheet["fire_effect.png"], enemy.tilePosition);
            enemy.damage(wielder, 0.5, 0, 0, DAMAGE_TYPE.HAZARDAL);
        }
    }
}