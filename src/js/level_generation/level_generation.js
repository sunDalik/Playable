import {Game} from "../game";
import {STAGE} from "../enums";
import {generateStandard, setupGenerator} from "./standard_generation";
import {FCEnemySets} from "./enemy_sets";
import {Settings} from "./settings";

export function generateLevel() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            setupGenerator(new Settings(30, 40, 30, 40, FCEnemySets));
            return generateStandard();
        case STAGE.DARK_TUNNEL:
            return [];
        case STAGE.RUINS:
            return [];
        default:
            return [];
    }
}