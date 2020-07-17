import {Game} from "../../../game";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {EQUIPMENT_ID, RARITY} from "../../../enums";
import {Boomeraxe} from "./boomeraxe";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {TileElement} from "../../tile_elements/tile_element";
import {Z_INDEXES} from "../../../z_indexing";
import {easeOutQuad} from "../../../utils/math_utils";

export class Prismaxe extends Boomeraxe {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["prismaxe.png"];
        this.id = EQUIPMENT_ID.PRISMAXE;
        this.atk = 1;
        this.prismAtk = 0.5;
        this.name = "Prismaxe";
        this.description = "Range 3\nAttack 1 in melee\nAttack 0.5 in ranged\nUpon attacking releases 3 prismaxes that deal 0.5 damage";
        this.rarity = RARITY.A;
    }

    attack(wielder, dirX, dirY) {
        for (let range = 1; range <= 3; range++) {
            const atkPos = {x: wielder.tilePosition.x + dirX * range, y: wielder.tilePosition.y + dirY * range};
            if (isAnyWall(atkPos.x, atkPos.y)) {
                break;
            }
            if (isEnemy(atkPos.x, atkPos.y) && isLit(atkPos.x, atkPos.y)) {
                const atk = this.getAtk(wielder, range);
                Game.map[atkPos.y][atkPos.x].entity.damage(wielder, atk, dirX, dirY);
                this.createAnimation(wielder, dirX * range, dirY * range);
                createPlayerAttackTile(atkPos);

                this.createPrism(wielder, atkPos, dirX, dirY, this.getGreenColor());
                if (dirX !== 0) {
                    this.createPrism(wielder, atkPos, dirX, -1, this.getRedColor());
                    this.createPrism(wielder, atkPos, dirX, 1, this.getBlueColor());
                } else {
                    this.createPrism(wielder, atkPos, -1, dirY, this.getRedColor());
                    this.createPrism(wielder, atkPos, 1, dirY, this.getBlueColor());
                }
                return true;
            }
        }

        return false;
    }

    createPrism(wielder, startTile, dirX, dirY, color) {
        const endTile = {x: startTile.x + dirX, y: startTile.y + dirY};
        if (isEnemy(endTile.x, endTile.y)) {
            const atk = wielder.getAtk(this, this.prismAtk);
            Game.map[endTile.y][endTile.x].entity.damage(wielder, atk, dirX, dirY);
        }

        const projectile = new TileElement(WeaponsSpriteSheet["prismaxe_projectile.png"], startTile.x, startTile.y);
        projectile.setOwnZIndex(Z_INDEXES.ENEMY + 1);
        Game.world.addChild(projectile);
        projectile.tint = color;
        projectile.alpha = 0.7;
        projectile.angle = randomInt(0, 180);

        const initPosition = {x: projectile.position.x, y: projectile.position.y};
        const endChange = {x: Game.TILESIZE * dirX, y: Game.TILESIZE * dirY};
        let angleStep = 15;
        if (dirX < 0) {
            projectile.scale.x *= -1;
            angleStep *= -1;
        }
        const flyTime = 8 * Math.max(Math.abs(dirX), Math.abs(dirY));
        const stayTime = 8;
        let counter = 0;

        createPlayerAttackTile(endTile, flyTime + stayTime);

        const animation = delta => {
            counter += delta;
            projectile.angle += angleStep;
            if (counter < flyTime) {
                projectile.position.x = initPosition.x + endChange.x * easeOutQuad(counter / flyTime);
                projectile.position.y = initPosition.y + endChange.y * easeOutQuad(counter / flyTime);
            } else if (counter < flyTime + stayTime) {
                projectile.position.x = initPosition.x + endChange.x;
                projectile.position.y = initPosition.y + endChange.y;
            } else {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(projectile);
            }
        };

        Game.app.ticker.add(animation);
    }

    getRedColor() {
        return randomChoice([0xed1b24, 0xffaa01, 0xe2e73f]);
    }

    getGreenColor() {
        return randomChoice([0x73e02a, 0x2ae02a, 0x2ae07b]);
    }

    getBlueColor() {
        return randomChoice([0x53c8ca, 0x3f4c9d, 0xaa73b9]);
    }

    getAtk(wielder, range) {
        if (range === 1) {
            return wielder.getAtk(this, this.atk);
        } else {
            return wielder.getAtk(this, this.atk / 2);
        }
    }
}