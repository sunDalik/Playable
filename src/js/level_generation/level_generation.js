import {generateEntryBasedLevel} from "./entry_based";
import {Game} from "../game";
import {STAGE} from "../enums";
import {generateOpenSpaceLevel} from "./open_space";

export function generateLevel() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
        case STAGE.DARK_TUNNEL:
            return generateEntryBasedLevel();
        case STAGE.RUINS:
            return generateOpenSpaceLevel();
        default:
            return generateEntryBasedLevel();
    }
}