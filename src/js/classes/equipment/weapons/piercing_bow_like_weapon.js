import {Game} from "../../../game";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile} from "../../../animations";
import {BowLikeWeapon} from "./bow_like_weapon";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class PiercingBowLikeWeapon extends BowLikeWeapon {
    constructor(texture) {
        super(texture);
        this.piercingBow = true;
    }

    attack(wielder, dirX, dirY) {
        let attacked = false;
        const enemiesToAttack = [null];
        let lastRange = 1;
        for (let range = 1; range <= this.range; range++) {
            const atkPos = {x: wielder.tilePosition.x + dirX * range, y: wielder.tilePosition.y + dirY * range};
            if (isAnyWall(atkPos.x, atkPos.y)) {
                break;
            }
            if (isEnemy(atkPos.x, atkPos.y) && isLit(atkPos.x, atkPos.y)) {
                enemiesToAttack[range] = Game.map[atkPos.y][atkPos.x].entity;
                attacked = true;
            } else enemiesToAttack[range] = null;
            lastRange = range;
        }

        if (!attacked) return false;
        else {
            this.createBowAnimation(wielder, dirX * lastRange, dirY * lastRange);
            const atkDict = enemiesToAttack.map((e, i) => {
                return {enemy: e, atk: this.getAtk(wielder, i)};
            });
            this.damageEnemies(enemiesToAttack.filter(e => e !== null && e !== undefined), wielder, 0, dirX, dirY, DAMAGE_TYPE.PHYSICAL_WEAPON, atkDict);
            for (let range = 1; range <= lastRange; range++) {
                createPlayerAttackTile({
                    x: wielder.tilePosition.x + dirX * range,
                    y: wielder.tilePosition.y + dirY * range
                }, this.getArrowAnimationTime(range, 0) * 1.5 + 2);
            }
            return true;
        }
    }
}