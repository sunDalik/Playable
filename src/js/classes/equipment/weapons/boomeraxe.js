import {Game} from "../../../game";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {RARITY, WEAPON_TYPE} from "../../../enums";
import {getAngleForDirection} from "../../../utils/game_utils";

export class Boomeraxe extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["boomeraxe.png"];
        this.type = WEAPON_TYPE.BOOMERAXE;
        this.atk = 1;
        this.name = "Boomeraxe";
        this.description = "Range 3\nAttack 1 in melee\nAttack 0.5 at range 2\nAttack 0.25 at range 3";
        this.rarity = RARITY.C;
    }

    attack(wielder, dirX, dirY) {
        for (let range = 1; range <= 3; range++) {
            const atkPos = {x: wielder.tilePosition.x + dirX * range, y: wielder.tilePosition.y + dirY * range};
            if (isAnyWall(atkPos.x, atkPos.y) || !isLit(atkPos.x, atkPos.y)) {
                break;
            }
            if (isEnemy(atkPos.x, atkPos.y)) {
                const atk = this.getAtk(wielder, range);
                Game.map[atkPos.y][atkPos.x].entity.damage(wielder, atk, dirX, dirY);
                this.createAnimation(wielder, dirX * range, dirY * range);
                createPlayerAttackTile(atkPos);
                return true;
            }
        }

        return false;
    }

    createAnimation(wielder, atkOffsetX, atkOffsetY) {
        if (Math.max(Math.abs(atkOffsetX), Math.abs(atkOffsetY)) === 1) {
            this.createMeleeAnimation(wielder, atkOffsetX, atkOffsetY);
            return;
        }
        const weaponSprite = new TileElement(this.texture, wielder.tilePosition.x, wielder.tilePosition.y);
        weaponSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        Game.world.addChild(weaponSprite);
        wielder.animationSubSprites.push(weaponSprite);
        weaponSprite.zIndex = wielder.zIndex + 1;
        weaponSprite.angle = getAngleForDirection({x: Math.sign(atkOffsetX), y: Math.sign(atkOffsetY)}, -90);

        const initPosition = {x: weaponSprite.position.x, y: weaponSprite.position.y};
        const endChange = {x: Game.TILESIZE * atkOffsetX, y: Game.TILESIZE * atkOffsetY};
        let angleStep = 30;
        if (atkOffsetX < 0) {
            weaponSprite.scale.x *= -1;
            angleStep *= -1;
        }
        const flyTime = 3 * Math.max(Math.abs(atkOffsetX), Math.abs(atkOffsetY));
        const stayTime = 2;
        let counter = 0;

        const animation = delta => {
            counter += delta;
            weaponSprite.angle += angleStep;
            if (counter < flyTime) {
                weaponSprite.position.x = initPosition.x + endChange.x * (counter / flyTime);
                weaponSprite.position.y = initPosition.y + endChange.y * (counter / flyTime);
            } else if (counter < flyTime + stayTime) {
                weaponSprite.position.x = initPosition.x + endChange.x;
                weaponSprite.position.y = initPosition.y + endChange.y;
            } else if (counter < flyTime + stayTime + flyTime) {
                weaponSprite.position.x = initPosition.x + endChange.x - endChange.x * ((counter - flyTime - stayTime) / flyTime);
                weaponSprite.position.y = initPosition.y + endChange.y - endChange.y * ((counter - flyTime - stayTime) / flyTime);
            } else {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(weaponSprite);
            }
        };

        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }

    createMeleeAnimation(player, dirX, dirY) {
        let forceSwing = undefined;
        if (dirX === 1) forceSwing = 1;
        else if (dirX === -1) forceSwing = -1;
        createWeaponAnimationSwing(player, this, dirX, dirY, 7, 100, 1, -15, {x: 0, y: 1}, forceSwing, 100, false);
    }

    getAtk(wielder, range) {
        return wielder.getAtk(this, this.atk / range);
    }
}