import {Game} from "../../../game";
import {BAG_ITEM_TYPE, RARITY} from "../../../enums";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {get8Directions} from "../../../utils/map_utils";
import {createFadingAttack, shakeScreen} from "../../../animations";
import {getPlayerOnTile, isDiggable, isEnemy, isObelisk, isWallTrap} from "../../../map_checks";
import * as PIXI from "pixi.js";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {TileElement} from "../../tile_elements/tile_element";
import {BagSpriteSheet} from "../../../loader";
import {ShadowTileElement} from "../../tile_elements/shadow_tile_element";
import {BagEquipment} from "../bag_equipment";

export class Bomb extends BagEquipment {
    constructor() {
        super();
        this.texture = BagSpriteSheet["bomb.png"];
        this.type = BAG_ITEM_TYPE.BOMB;
        this.name = "Bomb";
        this.description = "Creates explosion that destroys walls\nIt also deals 3 damage to enemies and 1 damage to players that got caught in the blast";
        this.fuseDelay = 3;
        this.currentFuseDelay = this.fuseDelay;
        this.bombAtk = 3;
        this.friendlyFire = 1;
        this.sprite = null;
        this.rarity = RARITY.C;
    }

    useItem(wielder) {
        super.useItem();
        const placedBomb = new Bomb();
        placedBomb.sprite = new ShadowTileElement(BagSpriteSheet["bomb_ticking.png"], wielder.tilePosition.x, wielder.tilePosition.y);
        Game.world.addChild(placedBomb.sprite);
        Game.updateList.push(placedBomb);
    }

    update() {
        if (this.currentFuseDelay <= 0) {
            for (const dir of get8Directions().concat({x: 0, y: 0})) {
                const posX = this.sprite.tilePosition.x + dir.x;
                const posY = this.sprite.tilePosition.y + dir.y;
                const sprite = new TileElement(PIXI.Texture.WHITE, posX, posY);
                sprite.tint = 0xfa794d;
                if (isEnemy(posX, posY)) {
                    Game.map[posY][posX].entity.damage(this, this.bombAtk, 0, 0, false, true);
                }
                if (isWallTrap(posX, posY)) {
                    Game.map[posY][posX].entity.die(this);
                }
                if (isDiggable(posX, posY)) {
                    Game.world.removeTile(posX, posY);
                }
                if (isObelisk(posX, posY)) {
                    Game.map[posY][posX].entity.destroy();
                }
                if (Game.map[posY][posX].hazard) {
                    Game.map[posY][posX].hazard.removeFromWorld();
                }
                for (let i = Game.bullets.length - 1; i >= 0; i--) {
                    if (Game.bullets[i].tilePosition.x === posX && Game.bullets[i].tilePosition.y === posY) {
                        Game.bullets[i].die();
                    }
                }
                const player = getPlayerOnTile(posX, posY);
                if (player) {
                    player.damage(this.friendlyFire, sprite, false, true);
                }
                createFadingAttack(sprite, 9);
                shakeScreen(5, 1, 40);
            }
            lightPlayerPosition(Game.player);
            lightPlayerPosition(Game.player2);
            removeObjectFromArray(this, Game.updateList);
            Game.world.removeChild(this.sprite);
            Game.world.removeChild(this.sprite.shadow);
        } else {
            this.currentFuseDelay--;
            if (this.currentFuseDelay === 0) {
                this.sprite.tint = 0xff7777;
            }
        }
    }
}