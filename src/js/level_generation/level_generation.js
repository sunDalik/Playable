import {Game} from "../game";
import {STAGE} from "../enums";
import {generateExperimental} from "./standard_generation";

export function generateLevel() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            return generateExperimental();
        case STAGE.DARK_TUNNEL:
            return [];
        case STAGE.RUINS:
            return [];
        default:
            return [];
    }
}