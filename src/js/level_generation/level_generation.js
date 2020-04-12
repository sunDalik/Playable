import {generateEntryBasedLevel} from "./entry_based";
import {Game} from "../game";
import {STAGE} from "../enums";
import {generateOpenSpaceLevel} from "./open_space";
import {generateExperimental} from "./experimental_generation";

export function generateLevel() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            if (Game.experimentalFeatures) return generateExperimental();
            else return generateEntryBasedLevel();
        case STAGE.DARK_TUNNEL:
            return generateEntryBasedLevel();
        case STAGE.RUINS:
            return generateOpenSpaceLevel();
        default:
            return generateEntryBasedLevel();
    }
}