import {Game} from "./game"
import {TILE_TYPE, ROLE} from "./enums";

export function isAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].tileType === TILE_TYPE.WALL) {
            return true
        }
    }
    return false;
}

export function isNotAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL && Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.SUPER_WALL) {
            return true
        }
    }
    return false;
}

export function isNotOutOfMap(tilePositionX, tilePositionY) {
    if (tilePositionX <= Game.map[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= Game.map.length - 1 && tilePositionY >= 0) {
            return true
        }
    }
    return false;
}

export function isEnemy(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.ENEMY) {
            return true
        }
    }
    return false;
}

export function isInanimate(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.INANIMATE) {
            return true
        }
    }
    return false;
}


export function isRelativelyEmpty(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL
            && Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.SUPER_WALL
            && (tileEntity === null || tileEntity.role === ROLE.PLAYER)) {
            return true
        }
    }
    return false;
}

export function isEmpty(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].entity === null && Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL
            && Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.SUPER_WALL) {
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
        if (tileEntity != null && tileEntity.role === ROLE.PLAYER) return tileEntity;
    }
    return null;
}