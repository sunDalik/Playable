import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY, STAGE} from "../../../enums/enums";
import {isAnyWall, isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {EffectsSpriteSheet, WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {FireHazard} from "../../hazards/fire";
import {setTickTimeout, tileDistance} from "../../../utils/game_utils";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class BookOfFlames extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_flames.png"]);
        this.id = EQUIPMENT_ID.BOOK_OF_FLAMES;
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
        const tiles = this.getTiles(wielder, dirX, dirY);
        const enemies = [];
        for (const tile of tiles) {
            if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)) {
                enemies.push(Game.map[tile.y][tile.x].entity);
            }
        }
        if (enemies.length === 0) return false;
        this.damageEnemies(enemies, wielder, wielder.getAtk(this), dirX, dirY, DAMAGE_TYPE.MAGICAL_WEAPON);
        for (const tile of tiles) {
            if (isNotAWall(tile.x, tile.y)) {
                const timeout = (tileDistance(wielder, {tilePosition: {x: tile.x, y: tile.y}}) - 1) * 2;
                if (timeout > 0) {
                    setTickTimeout(() => {this.createBlueFire(tile);}, timeout);
                } else {
                    this.createBlueFire(tile);
                }
            }
        }
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;

    }

    getTiles(wielder, dirX, dirY) {
        let attackTiles;
        if (dirX !== 0) {
            attackTiles = [{x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x + dirX * 2, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX * 3, y: wielder.tilePosition.y}];
        } else {
            attackTiles = [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY * 2},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY * 3}];
        }
        if (isAnyWall(attackTiles[0].x, attackTiles[0].y)) return [];
        if (isAnyWall(attackTiles[3].x, attackTiles[3].y)) removeObjectFromArray(attackTiles[4], attackTiles);
        return attackTiles;
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