import {DAMAGE_TYPE, EQUIPMENT_ID, RARITY} from "../../../enums";
import {EffectsSpriteSheet, WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {Game} from "../../../game";
import {TileElement} from "../../tile_elements/tile_element";
import {createPlayerAttackTile, fadeOutAndDie} from "../../../animations";
import {getAngleForDirection, pointTileDistance} from "../../../utils/game_utils";

export class BookOfIce extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_ice.png"]);
        this.id = EQUIPMENT_ID.BOOK_OF_ICE;
        this.atk = 1;
        this.uses = this.maxUses = 3;
        this.focusTime = 3;
        this.primaryColor = 0x6696d7;
        this.holdTime = 20;
        this.name = "Book of Ice";
        this.description = "Range 2\nAttacked enemy gets 4 stun";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        const enemy = this.getEnemy(wielder, dirX, dirY);
        if (enemy === null) return false;
        const tile = {x: enemy.tilePosition.x, y: enemy.tilePosition.y};
        this.shootIceBolt(wielder, tile, enemy);
        enemy.damage(wielder, wielder.getAtk(this), dirX, dirY, DAMAGE_TYPE.MAGICAL);
        enemy.addStun(4);
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }

    getEnemy(wielder, dirX, dirY) {
        for (let i = 1; i <= 2; i++) {
            const tile = {x: wielder.tilePosition.x + dirX * i, y: wielder.tilePosition.y + dirY * i};
            if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)
                && (i === 1 || isNotAWall(wielder.tilePosition.x + dirX, wielder.tilePosition.y + dirY))) {
                return Game.map[tile.y][tile.x].entity;
            }
        }
        return null;
    }

    shootIceBolt(wielder, tile, enemy) {
        const iceBolt = new TileElement(EffectsSpriteSheet["empyreal_wrath_effect.png"], wielder.tilePosition.x, wielder.tilePosition.y);
        iceBolt.setScaleModifier(1.2);
        iceBolt.tint = 0xbbeeee;
        iceBolt.zIndex = enemy.zIndex + 1;
        Game.world.addChild(iceBolt);
        iceBolt.angle = getAngleForDirection({
            x: Math.sign(tile.x - wielder.tilePosition.x),
            y: Math.sign(tile.y - wielder.tilePosition.y)
        }, -90);
        const animationTime = 3.5 * pointTileDistance(wielder.tilePosition, tile);
        const initPos = {x: iceBolt.position.x, y: iceBolt.position.y};
        const finalOffset = {
            x: (tile.x - wielder.tilePosition.x) * Game.TILESIZE * 1.1,
            y: (tile.y - wielder.tilePosition.y) * Game.TILESIZE * 1.1
        };
        let counter = 0;

        const animation = delta => {
            counter += delta;
            if (counter <= animationTime) {
                iceBolt.position.x = initPos.x + finalOffset.x * (counter / animationTime);
                iceBolt.position.y = initPos.y + finalOffset.y * (counter / animationTime);
            } else {
                Game.app.ticker.remove(animation);
                iceBolt.position.x = initPos.x + finalOffset.x;
                iceBolt.position.y = initPos.y + finalOffset.y;
                fadeOutAndDie(iceBolt, false, 6);
            }
        };

        Game.app.ticker.add(animation);
        createPlayerAttackTile(tile, animationTime);
    }
}