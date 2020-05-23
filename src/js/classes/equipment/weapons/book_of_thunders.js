import {RARITY, WEAPON_TYPE} from "../../../enums";
import {EffectsSpriteSheet, WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isEnemy, isLit} from "../../../map_checks";
import {Game} from "../../../game";
import {TileElement} from "../../tile_elements/tile_element";
import {createPlayerAttackTile} from "../../../animations";
import {randomInt, randomShuffle} from "../../../utils/random_utils";

export class BookOfThunders extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_thunders.png"]);
        this.type = WEAPON_TYPE.BOOK_OF_THUNDERS;
        this.atk = 1;
        this.uses = this.maxUses = 5;
        this.focusTime = 4;
        this.primaryColor = 0xdec356;
        this.holdTime = 20;
        this.name = "Book of Thunders";
        this.description = "Casts a thunder on the closest enemy in a direction\nHas enormous area of effect";
        this.rarity = RARITY.A;
        this.range = 5;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        const enemy = this.getEnemy(wielder, dirX, dirY);
        if (enemy === null) return false;
        const atk = wielder.getAtkWithWeapon(this);
        const tile = {x: enemy.tilePosition.x, y: enemy.tilePosition.y};
        enemy.damage(wielder, atk, dirX, dirY, this.magical);
        this.createThunderAnimation(tile, enemy);
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }

    createThunderAnimation(tile, enemy) {
        const strikeTime = 4;
        const angleStayTime = 3;

        createPlayerAttackTile(tile, strikeTime + angleStayTime * 2);

        const thunderSprite = new TileElement(EffectsSpriteSheet["thunder_effect.png"], tile.x, tile.y);
        thunderSprite.zIndex = enemy.zIndex + 1;
        Game.world.addChild(thunderSprite);
        thunderSprite.anchor.set(0.5, 1);
        thunderSprite.position.set(enemy.position.x, enemy.position.y);
        const offsetY = Game.TILESIZE * 0.75;
        thunderSprite.position.y -= offsetY;
        const initPos = thunderSprite.position.y;
        let counter = 0;
        let firstAngle = randomInt(12, 18);
        let secondAngle = randomInt(-12, -18);
        if (Math.random() < 0.5) [firstAngle, secondAngle] = [secondAngle, firstAngle];
        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            if (counter < strikeTime) {
                thunderSprite.position.y = initPos + counter / strikeTime * offsetY;
            } else if (counter >= strikeTime && counter < strikeTime + angleStayTime) {
                thunderSprite.position.y = initPos + offsetY;
                thunderSprite.angle = firstAngle;
            } else if (counter >= strikeTime + angleStayTime && counter < strikeTime + angleStayTime * 2) {
                thunderSprite.angle = secondAngle;
            } else {
                Game.world.removeChild(thunderSprite);
                Game.app.ticker.remove(animation);
            }
        };

        Game.app.ticker.add(animation);
    }

    getEnemy(wielder, dirX, dirY) {
        for (let i = 1; i <= this.range; i++) {
            let tile = {x: wielder.tilePosition.x + dirX * i, y: wielder.tilePosition.y + dirY * i};
            if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)) return Game.map[tile.y][tile.x].entity;
            for (let j = 1; j <= i; j++) {
                for (const sign of randomShuffle([-1, 1])) {
                    tile = dirX !== 0 ? {x: wielder.tilePosition.x + dirX * i, y: wielder.tilePosition.y + j * sign}
                        : {x: wielder.tilePosition.x + j * sign, y: wielder.tilePosition.y + dirY * i};
                    if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)) return Game.map[tile.y][tile.x].entity;
                }
            }
        }
        return null;
    }
}