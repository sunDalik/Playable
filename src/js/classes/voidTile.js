"use strict";

class VoidTile extends FullTileElement {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(GameState.resources["src/images/void.png"].texture, tilePositionX, tilePositionY);
    }
}