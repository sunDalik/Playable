import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums";
import {isEnemy, isLit, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {TileElement} from "../../tile_elements/tile_element";
import {easeOutQuad} from "../../../utils/math_utils";
import {Weapon} from "../weapon";

export class DoubleGlaive  extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["double_glaive.png"];
        this.id = EQUIPMENT_ID.DOUBLE_GLAIVE;
        this.atk = 1;
        this.name = "Double glaive";
        this.description = "Range 2\nAttack 1\nDouble attack in close combat";
        this.rarity = RARITY.A;
        this.scaleModifier = 1.2
    }

    attack(wielder, dirX, dirY) {
        const attackTileX1 = wielder.tilePosition.x + dirX;
        const attackTileY1 = wielder.tilePosition.y + dirY;
        const attackTileX2 = wielder.tilePosition.x + dirX * 2;
        const attackTileY2 = wielder.tilePosition.y + dirY * 2;
        if (isEnemy(attackTileX1, attackTileY1)) {
            const atk = wielder.getAtk(this, this.atk * 2);
            this.spin(wielder, dirX, dirY);
            createPlayerAttackTile({x: attackTileX1, y: attackTileY1});
            Game.map[attackTileY1][attackTileX1].entity.damage(wielder, atk, dirX, dirY, false);
            return true;
        } else if (isEnemy(attackTileX2, attackTileY2) && isRelativelyEmpty(attackTileX1, attackTileY1) && isLit(attackTileX2, attackTileY2)) {
            const atk = wielder.getAtk(this);
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
}