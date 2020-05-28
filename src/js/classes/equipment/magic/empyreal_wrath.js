import {MAGIC_TYPE, ROLE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Thunderstorm} from "./thunderstorm";
import {Game} from "../../../game";
import {setTickTimeout, tileDistance} from "../../../utils/game_utils";
import {createEmpyrealWrathAnimation} from "../../../animations";

export class EmpyrealWrath extends Thunderstorm {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_empyreal_wrath.png"];
        this.type = MAGIC_TYPE.EMPYREAL_WRATH;
        this.uses = this.maxUses = 6;
        this.name = "Empyreal Wrath";
        this.description = `EDIT`;
        this.thundersAmount = 12;
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
        let iteration = 0;
        while (thundersAmount > 0) {
            iteration++;
            if (!vulnerableEnemies.some(e => !e.dead)) break;
            for (const enemy of vulnerableEnemies) {
                if (enemy.dead) continue;
                if (thundersAmount <= 0) break;
                setTickTimeout(() => createEmpyrealWrathAnimation(enemy), (this.thundersAmount - thundersAmount) * 1.5);
                if (iteration === 1) enemy.stun += 3;
                const atk = iteration === 1 ? this.atk : this.atk / 2;
                enemy.damage(wielder, atk, 0, 0, true);
                thundersAmount--;
            }
        }
        if (vulnerableEnemies.length !== 0) this.uses--;
        return true;
    }
}

EmpyrealWrath.requiredMagic = Thunderstorm;