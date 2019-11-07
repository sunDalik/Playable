"use strict";

class SuperWallTile extends FullTileElement {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(Game.resources["src/images/super_wall.png"].texture, tilePositionX, tilePositionY);
    }
}