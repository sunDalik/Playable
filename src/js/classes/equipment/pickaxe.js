"use strict";

class Pickaxe {
    constructor() {
        this.texture = Game.resources["src/images/tools/pickaxe.png"].texture;
        this.type = TOOL_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
        this.atk = 0;
    }

    //maybe write use() { } ?
}