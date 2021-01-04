import {Game} from "../game";
import {PLAY_MODE, STAGE} from "../enums/enums";
import {generateStandard, setupGenerator} from "./standard_generation";
import {
    DCBossSets,
    DCEnemySets,
    DTBossSets,
    DTEnemySets,
    FCBossSets,
    FCEnemySets,
    MMBossSets,
    MMEnemySets,
    RUBossSets,
    RUEnemySets
} from "./enemy_sets";
import {Settings} from "./settings";
import {generateTutorialLevel} from "../tutorial/tutorial_generation";
import {generateVoid} from "./void_generation";

export function generateLevel() {
    if (Game.playMode === PLAY_MODE.TUTORIAL) return generateTutorialLevel();

    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            setupGenerator(new Settings(30, 40, 30, 40, FCEnemySets, FCBossSets));
            return generateStandard();
        case STAGE.DRY_CAVE:
            setupGenerator(new Settings(30, 40, 30, 40, DCEnemySets, DCBossSets));
            return generateStandard();
        case STAGE.DARK_TUNNEL:
            setupGenerator(new Settings(40, 55, 20, 25, DTEnemySets, DTBossSets));
            return generateStandard();
        case STAGE.MARBLE_MAUSOLEUM:
            setupGenerator(new Settings(40, 55, 20, 25, MMEnemySets, MMBossSets));
            return generateStandard();
        case STAGE.RUINS:
            setupGenerator(new Settings(40, 50, 40, 50, RUEnemySets, RUBossSets, true));
            return generateStandard();
        case STAGE.IMP_BATTLE:
            return generateVoid();
        default:
            return generateStandard();
    }
}