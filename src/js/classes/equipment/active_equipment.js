import {Equipment} from "./equipment";
import {redrawSlotContents} from "../../drawing/draw_hud";

//maybe merge it with equipment somehow? not sure
export class ActiveEquipment extends Equipment {
    constructor() {
        super();
        this._uses = this.maxUses = 0;
    }

    set uses(value) {
        this._uses = value;
        if (this.wielder) redrawSlotContents(this.wielder, this.wielder.getSlotNameOfItem(this));
    }

    get uses() {
        return this._uses;
    }
}