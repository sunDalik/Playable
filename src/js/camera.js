import {Game} from "./game"
import {drawGrid, drawOther} from "./drawing/draw_init";
import {camera} from "./classes/game/camera";

//this function is used when we change tile size and want to scale map accordingly
export function redrawTiles() {
    Game.world.removeChild(Game.grid);
    Game.grid = drawGrid();
    for (const graphic of Game.otherGraphics) {
        Game.world.removeChild(graphic);
    }
    Game.otherGraphics = [];

    for (const enemy of Game.enemies) {
        if (!enemy.dead) enemy.redrawHealth();
    }

    for (const tile of Game.tiles) {
        tile.fitToTile();
        tile.place();
    }

    for (const hazard of Game.hazards) {
        hazard.fitToTile();
        hazard.place();
    }

    drawOther();
    camera.center()
}