import {Game} from "../game";
import {STAGE} from "../enums/enums";
import {generateStandard, setupGenerator} from "./standard_generation";
import {DTBossSets, DTEnemySets, FCBossSets, FCEnemySets, RUBossSets, RUEnemySets} from "./enemy_sets";
import {Settings} from "./settings";

export function generateLevel() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            setupGenerator(new Settings(30, 40, 30, 40, FCEnemySets, FCBossSets));
            return generateStandard();
        case STAGE.DARK_TUNNEL:
            setupGenerator(new Settings(40, 55, 20, 25, DTEnemySets, DTBossSets));
            return generateStandard();
        case STAGE.RUINS:
            setupGenerator(new Settings(40, 50, 40, 50, RUEnemySets, RUBossSets, true));
            return generateStandard();
        default:
            return generateStandard();
    }
}