import {Game} from "../../../game";
import {ENEMY_TYPE, EQUIPMENT_ID, RARITY, ROLE} from "../../../enums/enums";
import {isDiggable, isEnemy, isEntity} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub} from "../../../animations";
import {ToolsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";

export class Pickaxe extends Weapon {
    constructor() {
        super();
        this.texture = ToolsSpriteSheet["pickaxe.png"];
        this.id = EQUIPMENT_ID.PICKAXE;
        this.atk = 1;
        this.name = "Pickaxe";
        this.description = "Can dig walls and attack enemies\nCan dig even if put in the \"Extra\" slot";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        const attackTile = {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + dirY};
        if (isEnemy(attackTile.x, attackTile.y)) {
            const enemy = Game.map[attackTile.y][attackTile.x].entity;
            const atk = wielder.getAtk(this);
            createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 3, 90, 1);
            createPlayerAttackTile(attackTile);
            enemy.damage(wielder, atk, dirX, dirY);

            if (enemy.type === ENEMY_TYPE.MUD_BLOCK) {
                const dirs = dirX !== 0 ? [{x: 0, y: 1}, {x: 0, y: -1}] : [{x: 1, y: 0}, {x: -1, y: 0}];
                for (const dir of dirs) {
                    const newAttackTile = {x: attackTile.x + dir.x, y: attackTile.y + dir.y};
                    if (isEntity(newAttackTile.x, newAttackTile.y, ROLE.ENEMY, ENEMY_TYPE.MUD_BLOCK)) {
                        createPlayerAttackTile(newAttackTile);
                        Game.map[newAttackTile.y][newAttackTile.x].entity.damage(wielder, atk, dirX, dirY);
                    }
                }
            }
            return true;
        } else return false;
    }

    use(wielder, dirX, dirY) {
        const digTile = {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + dirY};
        if (isDiggable(digTile.x, digTile.y)) {
            //todo ?. operator
            if (Game.map[digTile.y][digTile.x].entity && Game.map[digTile.y][digTile.x].entity.role === ROLE.WALL_TRAP) {
                Game.world.removeTile(digTile.x, digTile.y, wielder, false);
                Game.map[digTile.y][digTile.x].entity.die();
            } else {
                Game.world.removeTile(digTile.x, digTile.y, wielder);
            }
            if (wielder.weapon && wielder.weapon.id === this.id && wielder.secondHand && wielder.secondHand.id === this.id) {
                createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 3, 90, 1, 0.5);
                wielder.step(dirX, dirY);
            } else {
                createWeaponAnimationClub(wielder, this, dirX, dirY, 8, 3, 90, 1);
            }
            createPlayerAttackTile(digTile);
            return true;
        } else return false;
    }
}