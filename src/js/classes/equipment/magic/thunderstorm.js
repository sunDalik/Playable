import {DAMAGE_TYPE, EQUIPMENT_ID, MAGIC_ALIGNMENT, ROLE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {Game} from "../../../game";
import {setTickTimeout, tileDistance} from "../../../utils/game_utils";
import {createThunderAnimation} from "../../../animations";
import {randomInt} from "../../../utils/random_utils";

export class Thunderstorm extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_thunderstorm.png"];
        this.id = EQUIPMENT_ID.THUNDERSTORM;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 1.5;
        this.uses = this.maxUses = 5;
        this.horizontalRange = 7;
        this.verticalRange = 5;
        this.thundersAmount = 10;
        this.name = "Thunderstorm";
        this.description = `Damages up to ${this.thundersAmount} enemies in a huge area around you by ${this.atk}`;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const vulnerableEnemies = Game.enemies.filter(
            e => e.visible && e.role !== ROLE.WALL_TRAP
                && Math.abs(e.tilePosition.x - wielder.tilePosition.x) <= this.horizontalRange
                && Math.abs(e.tilePosition.y - wielder.tilePosition.y) <= this.verticalRange);
        vulnerableEnemies.sort((a, b) => tileDistance(a, wielder) - tileDistance(b, wielder));
        let thundersAmount = this.thundersAmount;
        for (const enemy of vulnerableEnemies) {
            if (thundersAmount <= 0) break;
            const randomTimeout = randomInt(0, 4);
            //maybe create a special function for it?
            if (randomTimeout === 0) createThunderAnimation(enemy);
            else setTickTimeout(() => createThunderAnimation(enemy), randomTimeout);
            enemy.stun++;
            enemy.damage(wielder, wielder.getAtk(this), 0, 0, DAMAGE_TYPE.MAGICAL);
            thundersAmount--;
        }
        if (vulnerableEnemies.length !== 0) this.uses--;
        return true;
    }
}