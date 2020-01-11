import {Game} from "../../../game"
import {BAG_ITEM_TYPE, EQUIPMENT_TYPE} from "../../../enums";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {get8Directions} from "../../../utils/map_utils";
import {FullTileElement} from "../../tile_elements/full_tile_element";
import {createFadingAttack} from "../../../animations";
import {getPlayerOnTile, isDiggable, isEnemy, isObelisk, isWallTrap} from "../../../map_checks";
import * as PIXI from "pixi.js";
import {lightPlayerPosition} from "../../../drawing/lighting";

export class Bomb {
    constructor() {
        this.texture = Game.resources["src/images/bag/bomb.png"].texture;
        this.type = BAG_ITEM_TYPE.BOMB;
        this.equipmentType = EQUIPMENT_TYPE.BAG_ITEM;
        this.name = "Bomb";
        this.description = "What will you explode with this?";
        this.amount = 1;
        this.fuseDelay = 3;
        this.currentFuseDelay = this.fuseDelay;
        this.bombAtk = 3;
        this.friendlyFire = 1;
        this.sprite = null;
    }

    useItem(player) {
        const placedBomb = new Bomb();
        placedBomb.sprite = new FullTileElement(Game.resources["src/images/bag/bomb_ticking.png"].texture, player.tilePosition.x, player.tilePosition.y);
        Game.world.addChild(placedBomb.sprite);
        Game.updateList.push(placedBomb);
        this.amount--;
    }

    update() {
        if (this.currentFuseDelay <= 0) {
            for (const dir of get8Directions().concat({x: 0, y: 0})) {
                const posX = this.sprite.tilePosition.x + dir.x;
                const posY = this.sprite.tilePosition.y + dir.y;
                const sprite = new FullTileElement(PIXI.Texture.WHITE, posX, posY);
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
                    player.damage(this.friendlyFire, this, false, true);
                }
                createFadingAttack(sprite, 9);
            }
            lightPlayerPosition(Game.player);
            lightPlayerPosition(Game.player2);
            removeObjectFromArray(this, Game.updateList);
            Game.world.removeChild(this.sprite);
        } else {
            this.currentFuseDelay--;
            if (this.currentFuseDelay === 0) {
                this.sprite.texture = Game.resources["src/images/bag/bomb_about_to_explode.png"].texture;
            }
        }
    }
}