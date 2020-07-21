import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY, SLOT} from "../../../enums/enums";
import {isAnyWall, isEmpty, isEnemy, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {ENCHANTMENT_TYPE} from "../../../enums/equipment_modifiers";

export class MaidenShortSword extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["maiden_dagger.png"];
        this.id = EQUIPMENT_ID.MAIDEN_SHORT_SWORD;
        this.atk = 1.25;
        this.name = "Maiden's Short Sword";
        this.description = "Attack 1.25\nIf you wield two of these, it attacks 3 enemies in front of you, moves you and deals 2.5 damage to the middle enemy";
        this.rarity = RARITY.B;
    }

    onWear(player) {
        //player.voluntaryDamage(0.25);
    }

    // todo if extra maiden dagger is enchanted with divine you should display its attack instead of the weapon attack on the hud
    attack(wielder, tileDirX, tileDirY) {
        if (wielder[SLOT.EXTRA] && wielder[SLOT.EXTRA].id === this.id) {
            const ATStepX = tileDirX === 0 ? 1 : 0;
            const ATStepY = tileDirY === 0 ? 1 : 0;
            const atkDict = [{enemy: null, atk: this.atk},
                {enemy: null, atk: this.atk * 2},
                {enemy: null, atk: this.atk}];
            const playerStepPosition = {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + tileDirY};
            const atkPositions = [
                {x: wielder.tilePosition.x + tileDirX - ATStepX, y: wielder.tilePosition.y + tileDirY - ATStepY},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x + tileDirX + ATStepX, y: wielder.tilePosition.y + tileDirY + ATStepY}];
            let foundEnemy = false;
            for (let i = 0; i < atkPositions.length; i++) {
                const atkPos = atkPositions[i];
                if (isEnemy(atkPos.x, atkPos.y)) {
                    foundEnemy = true;
                    const entity = Game.map[atkPos.y][atkPos.x].entity;
                    if (entity.movable) {
                        entity.cancelAnimation();
                        if (isEmpty(atkPos.x + tileDirX, atkPos.y + tileDirY)) {
                            entity.step(tileDirX, tileDirY);
                        } else {
                            entity.bump(tileDirX, tileDirY);
                            if (isAnyWall(atkPos.x + tileDirX, atkPos.y + tileDirY)) {
                                atkDict[i].atk++;
                            }
                        }
                    }
                    atkDict[i].enemy = entity;
                }
            }

            if (!foundEnemy) return false;
            if (isRelativelyEmpty(playerStepPosition.x, playerStepPosition.y)) {
                wielder.step(tileDirX, tileDirY);
            } else {
                wielder.bump(tileDirX, tileDirY);
            }
            const amplitude = 180;
            createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 10, amplitude, 1.15,
                135, {x: 1, y: 0}, 1, amplitude / 2 + 30);
            createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 10, amplitude, 1.15,
                135, {x: 1, y: 0}, -1, amplitude / 2 + 30);


            // if second maiden's dagger is enchanted with divine call atk method on them instead
            let weapon = this;
            if (wielder[SLOT.EXTRA].enchantment === ENCHANTMENT_TYPE.DIVINE) weapon = wielder[SLOT.EXTRA];

            weapon.damageEnemies(atkDict.filter(entry => entry.enemy !== null).map(entry => entry.enemy),
                wielder, 0, tileDirX, tileDirY, DAMAGE_TYPE.PHYSICAL_WEAPON, atkDict);
            for (const attackTile of atkPositions) {
                createPlayerAttackTile(attackTile);
            }
            return true;
        } else {
            const attackTileX = wielder.tilePosition.x + tileDirX;
            const attackTileY = wielder.tilePosition.y + tileDirY;
            const atk = wielder.getAtk(this);
            if (isEnemy(attackTileX, attackTileY)) {
                createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 5, 55, 1.15, 135, {x: 1, y: 0});
                createPlayerAttackTile({x: attackTileX, y: attackTileY});
                this.damageEnemies([Game.map[attackTileY][attackTileX].entity], wielder, atk, tileDirX, tileDirY);
                return true;
            } else return false;
        }
    }
}