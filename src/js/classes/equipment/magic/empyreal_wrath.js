import {EQUIPMENT_ID} from "../../../enums/enums";
import {MagicSpriteSheet} from "../../../loader";
import {Thunderstorm} from "./thunderstorm";
import {setTickTimeout, tileDistance} from "../../../utils/game_utils";
import {createEmpyrealWrathAnimation} from "../../../animations";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class EmpyrealWrath extends Thunderstorm {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_empyreal_wrath.png"];
        this.id = EQUIPMENT_ID.EMPYREAL_WRATH;
        this.uses = this.maxUses = 6;
        this.name = "Empyreal Wrath";
        this.description = `Upgrade to Thunderstorm\nIf there are not enough enemies around you, empyreal strikes will damage some enemies multiple times but subsequent strikes only deal half dmg`;
        this.thundersAmount = 12;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const vulnerableEnemies = this.getVulnerableEnemies(wielder);
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
                if (iteration === 1) enemy.addStun(3);
                let atk = iteration === 1 ? this.atk : this.atk / 2;
                atk = wielder.getAtk(this, atk);
                enemy.damage(wielder, atk, 0, 0, DAMAGE_TYPE.MAGICAL);
                thundersAmount--;
            }
        }
        if (vulnerableEnemies.length !== 0) this.uses--;
        return true;
    }
}

EmpyrealWrath.requiredMagic = Thunderstorm;