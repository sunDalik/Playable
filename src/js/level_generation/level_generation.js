import {generateEntryBasedLevel} from "./entry_based";
import {Game} from "../game";
import {STAGE} from "../enums";

export function generateLevel() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
        case STAGE.DARK_TUNNEL:
            return generateEntryBasedLevel();
        default:
            return generateEntryBasedLevel();
    }
}