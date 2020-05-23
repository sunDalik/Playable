import {Game} from "../../../game";
import {RARITY, STAGE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {EffectsSpriteSheet, WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {FireHazard} from "../../hazards/fire";
import {setTickTimeout} from "../../../utils/game_utils";

export class BookOfFlames extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_flames.png"]);
        this.type = WEAPON_TYPE.BOOK_OF_FLAMES;
        this.atk = 2;
        this.uses = this.maxUses = 2;
        this.focusTime = 3;
        this.primaryColor = 0x10afa6;
        this.holdTime = 20;
        this.name = "Book of Flames";
        this.description = "Attack 2\nAttacks in T shape";
        this.rarity = RARITY.S;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        let attackTiles = [];
        if (dirX !== 0) {
            attackTiles = [{x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x + dirX * 2, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX * 3, y: wielder.tilePosition.y}];
        } else if (dirY !== 0) {
            attackTiles = [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY * 2},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY * 3}];
        }
        if (attackTiles.length !== 5) return false;
        //maybe ranged attacks should be blocked by inanimates? who knows...
        if (isNotAWall(attackTiles[0].x, attackTiles[0].y) &&
            (isEnemy(attackTiles[0].x, attackTiles[0].y)
                || isEnemy(attackTiles[1].x, attackTiles[1].y)
                || isEnemy(attackTiles[2].x, attackTiles[2].y)
                || isEnemy(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[3].x, attackTiles[3].y)
                || isEnemy(attackTiles[4].x, attackTiles[4].y) && isNotAWall(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[4].x, attackTiles[4].y))) {

            const atk = wielder.getAtkWithWeapon(this);
            const enemiesToAttack = [];
            for (let i = 0; i < attackTiles.length; i++) {
                if (i === 3) {
                    if (!isLit(attackTiles[3].x, attackTiles[3].y)) continue;
                } else if (i === 4) {
                    if (!(isNotAWall(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[4].x, attackTiles[4].y))) continue;
                }
                const attackTile = attackTiles[i];
                if (isNotAWall(attackTile.x, attackTile.y)) {
                    let timeout;
                    if (i === 0) timeout = 0;
                    else if (i === 4) timeout = 2;
                    else timeout = 1;
                    timeout *= 2;
                    if (timeout > 0) {
                        setTickTimeout(() => {this.createBlueFire(attackTile);}, timeout);
                    } else {
                        this.createBlueFire(attackTile);
                    }
                }
                if (isEnemy(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity);
                }
            }

            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, dirX, dirY, this.magical);
            }
            this.uses--;
            this.updateTexture(wielder);
            this.holdBookAnimation(wielder, dirX, dirY);
            return true;
        } else return false;
    }

    createBlueFire(tile) {
        const blueFire = new BlueFireEffect(tile.x, tile.y);
        Game.world.addChild(blueFire);
        blueFire.startAnimation();
        if (Game.stage === STAGE.DARK_TUNNEL) {
            blueFire.maskLayer = {};
            Game.darkTiles[tile.y][tile.x].addLightSource(blueFire.maskLayer);
        }
        setTickTimeout(() => {
            blueFire.dead = true;
            if (blueFire.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
                Game.darkTiles[tile.y][tile.x].removeLightSource(blueFire.maskLayer);
            }
        }, 11);
    }
}

class BlueFireEffect extends FireHazard {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY, false);
        this.particleTexture = EffectsSpriteSheet["blue_fire_effect.png"];
        this.staticColor = 0x47007e;
        this.colorConstraints = {min: 0x009900, max: 0x00ac00};
    }

    getInitAnimationTime() {
        return 3;
    }
}