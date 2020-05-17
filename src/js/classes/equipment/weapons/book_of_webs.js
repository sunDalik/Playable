import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {Game} from "../../../game";
import {setTickTimeout, tileDistance} from "../../../utils/game_utils";
import {TileElement} from "../../tile_elements/tile_element";
import {createPlayerAttackTile} from "../../../animations";

export class BookOfWebs extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_webs.png"]);
        this.type = WEAPON_TYPE.BOOK_OF_WEBS;
        this.atk = 2;
        this.uses = this.maxUses = 1;
        this.focusTime = 3;
        this.primaryColor = 0x3f3f3f;
        this.holdTime = 20;
        this.name = "Book of Webs";
        this.description = "Range 6\nAttack 2\nCasts 3 web lines";
        this.rarity = RARITY.A;
        this.range = 6;
        this.diagonalRange = 4;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        const enemies = [];
        const tiles = this.getTiles(wielder, dirX, dirY);
        for (const tile of tiles) {
            if (isEnemy(tile.x, tile.y)) {
                enemies.push(Game.map[tile.y][tile.x].entity);
            }
        }
        if (enemies.length === 0) return false;
        const atk = wielder.getAtkWithWeapon(this);
        for (const enemy of enemies) {
            enemy.damage(wielder, atk, dirX, dirY, this.magical);
        }
        for (const tile of tiles) {
            const timeout = tileDistance(wielder, {tilePosition: {x: tile.x, y: tile.y}}) - 1;
            if (timeout > 0) {
                setTickTimeout(() => {this.createWebEffect(tile);}, timeout);
            } else {
                this.createWebEffect(tile);
            }
        }
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }

    createWebEffect(tile) {
        const appearTime = 4;
        const stayTime = 6;

        createPlayerAttackTile(tile, appearTime + stayTime + appearTime / 2);

        const webSprite = new TileElement(Game.resources["src/images/effects/web_effect.png"].texture, tile.x, tile.y, true);
        Game.world.addChild(webSprite);
        let counter = 0;
        const finalScale = webSprite.scale.x * 1.2;
        webSprite.scale.x = webSprite.scale.y = 0;
        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            if (counter < appearTime) {
                webSprite.scale.x = webSprite.scale.y = counter / appearTime * finalScale;
            } else if (counter >= appearTime && counter < appearTime + stayTime) {
                webSprite.scale.x = webSprite.scale.y = finalScale;
            } else if (counter >= appearTime + stayTime) {
                webSprite.scale.x = webSprite.scale.y = Math.max(finalScale - (counter - appearTime - stayTime) / appearTime * finalScale, 0);
            } else {
                Game.world.removeChild(webSprite);
                Game.app.ticker.remove(animation);
            }
        };

        Game.app.ticker.add(animation);
    }

    getTiles(wielder, dirX, dirY) {
        const tiles = [];
        for (let r = 1; r <= this.range; r++) {
            const tile = {x: wielder.tilePosition.x + dirX * r, y: wielder.tilePosition.y + dirY * r};
            if (isAnyWall(tile.x, tile.y) || !isLit(tile.x, tile.y)) break;
            tiles.push(tile);
        }
        for (let r = 1; r <= this.diagonalRange; r++) {
            const tile = dirX !== 0 ? {x: wielder.tilePosition.x + dirX * r, y: wielder.tilePosition.y + r}
                : {x: wielder.tilePosition.x + r, y: wielder.tilePosition.y + dirY * r};
            if (isAnyWall(tile.x, tile.y) || !isLit(tile.x, tile.y)) break;
            tiles.push(tile);
        }
        for (let r = 1; r <= this.diagonalRange; r++) {
            const tile = dirX !== 0 ? {x: wielder.tilePosition.x + dirX * r, y: wielder.tilePosition.y - r}
                : {x: wielder.tilePosition.x - r, y: wielder.tilePosition.y + dirY * r};
            if (isAnyWall(tile.x, tile.y) || !isLit(tile.x, tile.y)) break;
            tiles.push(tile);
        }
        return tiles;
    }
}