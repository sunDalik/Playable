import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab, runDestroyAnimation} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";
import {TileElement} from "../../tile_elements/tile_element";
import {easeOutQuad} from "../../../utils/math_utils";

export class DoubleGlaive {
    constructor() {
        this.texture = WeaponsSpriteSheet["double_glaive.png"];
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.type = WEAPON_TYPE.DOUBLE_GLAIVE;
        this.atk = 1;
        this.name = "Double glaive";
        this.description = "1 atk at range 2 or 2 atk at range 1";
        this.rarity = RARITY.A;
        this.scaleModifier = 1.2
    }

    attack(wielder, dirX, dirY) {
        const attackTileX1 = wielder.tilePosition.x + dirX;
        const attackTileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        if (isEnemy(attackTileX1, attackTileY1)) {
            const atk = wielder.getAtkWithWeapon(this, this.atk * 2);
            this.spin(wielder, dirX, dirY);
            createPlayerAttackTile({x: attackTileX1, y: attackTileY1});
            Game.map[attackTileY1][attackTileX1].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            const atk = wielder.getAtkWithWeapon(this);
            createWeaponAnimationStab(wielder, this, dirX * 2, dirY * 2, 7, 3, this.scaleModifier);
            createPlayerAttackTile({x: attackTileX2, y: attackTileY2});
            Game.map[attackTileY2][attackTileX2].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        }
        return false;
    }

    spin(wielder, dirX, dirY) {
        const weaponSprite = new TileElement(this.texture, wielder.tilePosition.x, wielder.tilePosition.y);
        weaponSprite.position.set(wielder.getTilePositionX() + dirX * wielder.width / 2, wielder.getTilePositionY() + dirY * wielder.height / 2);
        Game.world.addChild(weaponSprite);
        wielder.animationSubSprites.push(weaponSprite);
        weaponSprite.setScaleModifier(this.scaleModifier);
        weaponSprite.zIndex = wielder.zIndex + 1;

        const animationTime = 10;
        const spinAngle = 180;
        let counter = 0;

        const animation = delta => {
            counter += delta;
            weaponSprite.angle = easeOutQuad(counter / animationTime) * spinAngle;
            if (counter >= animationTime) {
                Game.world.removeChild(weaponSprite);
                Game.app.ticker.remove(animation);
            }
        };

        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x + 1,
            y: statueLeftHandPoint.y,
            angle: 90,
            scaleModifier: this.scaleModifier
        };
    }
}