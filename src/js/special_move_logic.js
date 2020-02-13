import {isEmpty} from "./map_checks";
import {Game} from "./game";

export function blowAwayInDirection(source, offset, slideTime = 5) {
    if (isEmpty(source.x + offset.x + Math.sign(offset.x), source.y + offset.y + Math.sign(offset.y))) {
        Game.map[source.y + offset.y][source.x + offset.x].entity.slide(Math.sign(offset.x), Math.sign(offset.y), null, null, slideTime);
    } else {
        if (offset.x === 0) {
            if (isEmpty(source.x + offset.x - 1, source.y + offset.y)) {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slide(-1, 0, null, null, slideTime);
            } else if (isEmpty(source.x + offset.x + 1, source.y + offset.y)) {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slide(1, 0, null, null, slideTime);
            } else {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slideBump(0, Math.sign(offset.y), null, null, slideTime);
            }
        } else if (offset.y === 0) {
            if (isEmpty(source.x + offset.x, source.y + offset.y - 1)) {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slide(0, -1, null, null, slideTime);
            } else if (isEmpty(source.x + offset.x, source.y + offset.y + 1)) {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slide(0, 1, null, null, slideTime);
            } else {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slideBump(Math.sign(offset.x), 0, null, null, slideTime);
            }
        } else {
            if (isEmpty(source.x + offset.x, source.y + offset.y + Math.sign(offset.y))) {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slide(0, Math.sign(offset.y), null, null, slideTime);
            } else if (isEmpty(source.x + offset.x + Math.sign(offset.x), source.y + offset.y)) {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slide(Math.sign(offset.x), 0, null, null, slideTime);
            } else {
                Game.map[source.y + offset.y][source.x + offset.x].entity.slideBump(Math.sign(offset.x), 0, null, null, slideTime);
            }
        }
    }
}