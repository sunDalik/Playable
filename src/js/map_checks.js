import {Game} from "./game"
import {TILE_TYPE, ROLE, INANIMATE_TYPE} from "./enums";

export function isDiggable(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].tileType === TILE_TYPE.WALL) {
            return true
        }
    }
    return false;
}

export function isAnyWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].tileType === TILE_TYPE.WALL
            || Game.map[tilePositionY][tilePositionX].tileType === TILE_TYPE.SUPER_WALL
            || Game.map[tilePositionY][tilePositionX].entity && Game.map[tilePositionY][tilePositionX].entity.role === ROLE.WALL_TRAP) {
            return true
        }
    }
    return false;
}

export function isNotAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL
            && Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.SUPER_WALL
            && !(Game.map[tilePositionY][tilePositionX].entity && Game.map[tilePositionY][tilePositionX].entity.role === ROLE.WALL_TRAP)) {
            return true
        }
    }
    return false;
}

export function isNotOutOfMap(tilePositionX, tilePositionY) {
    return tilePositionX <= Game.map[0].length - 1 && tilePositionX >= 0 &&
        tilePositionY <= Game.map.length - 1 && tilePositionY >= 0;
}

export function isEnemy(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity && tileEntity.role === ROLE.ENEMY) {
            return true
        }
    }
    return false;
}

//umm refactor these please...
export function isWallTrap(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity && tileEntity.role === ROLE.WALL_TRAP) {
            return true
        }
    }
    return false;
}

export function isInanimate(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity && tileEntity.role === ROLE.INANIMATE) {
            return true
        }
    }
    return false;
}

export function isBullet(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        const tileEntity2 = Game.map[tilePositionY][tilePositionX].secondaryEntity;
        if (tileEntity && tileEntity.role === ROLE.BULLET || tileEntity2 && tileEntity2.role === ROLE.BULLET) {
            return true
        }
    }
    return false;
}

export function getBullet(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        const tileEntity2 = Game.map[tilePositionY][tilePositionX].secondaryEntity;
        if (tileEntity && tileEntity.role === ROLE.BULLET) return tileEntity;
        else if (tileEntity2 && tileEntity2.role === ROLE.BULLET) return tileEntity2
    }
    return null;
}

export function isAnyWallOrInanimate(tilePositionX, tilePositionY) {
    return isAnyWall(tilePositionX, tilePositionY) || isInanimate(tilePositionX, tilePositionY);
}

export function isRelativelyEmpty(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (isNotAWall(tilePositionX, tilePositionY)
            && (tileEntity === null || tileEntity.role === ROLE.PLAYER || tileEntity.role === ROLE.BULLET)) {
            return true
        }
    }
    return false;
}

export function canBeFliedOverByBullet(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (isNotAWall(tilePositionX, tilePositionY)
            && (tileEntity === null || tileEntity.role === ROLE.BULLET
                || tileEntity.role === ROLE.INANIMATE && tileEntity.type === INANIMATE_TYPE.FIRE_GOBLET && tileEntity.standing === false)) {
            return true
        }
    }
    return false;
}

export function isEmpty(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].entity === null && isNotAWall(tilePositionX, tilePositionY)) {
            return true
        }
    }
    return false;
}

export function isLit(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        return Game.map[tilePositionY][tilePositionX].lit;
    }
    return false;
}

export function getPlayerOnTile(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity && tileEntity.role === ROLE.PLAYER) return tileEntity;
    }
    return null;
}

export function isObelisk(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity && tileEntity.role === ROLE.INANIMATE && tileEntity.type === INANIMATE_TYPE.OBELISK) {
            return true
        }
    }
    return false;
}