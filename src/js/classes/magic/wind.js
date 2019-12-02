import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE, HAZARD_TYPE,} from "../../enums";
import {isEmpty, isEnemy} from "../../map_checks";

export class Wind {
    constructor() {
        this.texture = Game.resources["src/images/magic/wind.png"].texture;
        this.type = MAGIC_TYPE.WIND;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.radius = 3;
        this.slideTime = 5;
        this.maxUses = 5;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let r = this.radius; r >= 0; r--) {
            for (let x = -this.radius; x <= this.radius; x++) {
                for (let y = -this.radius; y <= this.radius; y++) {
                    if (Math.abs(x) + Math.abs(y) === r) {
                        const hazard = Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].hazard;
                        if (hazard && (hazard.type === HAZARD_TYPE.FIRE || hazard.type === HAZARD_TYPE.DARK_FIRE)) {
                            hazard.extinguish();
                        }
                        if (isEnemy(wielder.tilePosition.x + x, wielder.tilePosition.y + y)) {
                            Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.stun++;
                            if (isEmpty(wielder.tilePosition.x + x + Math.sign(x), wielder.tilePosition.y + y + Math.sign(y))) {
                                Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(Math.sign(x), Math.sign(y), null, null, this.slideTime);
                            } else {
                                if (x === 0) {
                                    if (isEmpty(wielder.tilePosition.x + x - 1, wielder.tilePosition.y + y)) {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(-1, 0, null, null, this.slideTime);
                                    } else if (isEmpty(wielder.tilePosition.x + x + 1, wielder.tilePosition.y + y)) {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(1, 0, null, null, this.slideTime);
                                    } else {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slideBump(0, Math.sign(y), null, null, this.slideTime);
                                    }
                                } else if (y === 0) {
                                    if (isEmpty(wielder.tilePosition.x + x, wielder.tilePosition.y + y - 1)) {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(0, -1, null, null, this.slideTime);
                                    } else if (isEmpty(wielder.tilePosition.x + x, wielder.tilePosition.y + y + 1)) {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(0, 1, null, null, this.slideTime);
                                    } else {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slideBump(Math.sign(x), 0, null, null, this.slideTime);
                                    }
                                } else {
                                    if (isEmpty(wielder.tilePosition.x + x, wielder.tilePosition.y + y + Math.sign(y))) {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(0, Math.sign(y), null, null, this.slideTime);
                                    } else if (isEmpty(wielder.tilePosition.x + x + Math.sign(x), wielder.tilePosition.y + y)) {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slide(Math.sign(x), 0, null, null, this.slideTime);
                                    } else {
                                        Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.slideBump(Math.sign(x), 0, null, null, this.slideTime);
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
        this.uses--;
        return true;
    }
}