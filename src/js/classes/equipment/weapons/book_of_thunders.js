import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isEnemy, isLit} from "../../../map_checks";
import {Game} from "../../../game";
import {createThunderAnimation} from "../../../animations";
import {randomShuffle} from "../../../utils/random_utils";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class BookOfThunders extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_thunders.png"]);
        this.id = EQUIPMENT_ID.BOOK_OF_THUNDERS;
        this.atk = 1;
        this.uses = this.maxUses = 5;
        this.focusTime = 4;
        this.primaryColor = 0xdec356;
        this.holdTime = 20;
        this.name = "Book of Thunders";
        this.description = "Casts a thunder on the closest enemy in a direction\nHas enormous area of effect\nThunder applies 1 stun";
        this.rarity = RARITY.A;
        this.range = 5;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        const enemy = this.getEnemy(wielder, dirX, dirY);
        if (enemy === null) return false;
        enemy.addStun(1);
        this.damageEnemies([enemy], wielder, wielder.getAtk(this), dirX, dirY, DAMAGE_TYPE.MAGICAL_WEAPON);
        createThunderAnimation(enemy);
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
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