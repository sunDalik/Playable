"use strict";

class WallTile extends FullTileElement {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(GameState.resources["src/images/wall.png"].texture, tilePositionX, tilePositionY);
    }
}