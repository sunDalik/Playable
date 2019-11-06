"use strict";

function isNotAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL) {
            return true
        }
    }
    return false;
}

function isNotOutOfMap(tilePositionX, tilePositionY) {
    if (tilePositionX <= Game.map[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= Game.map.length - 1 && tilePositionY >= 0) {
            return true
        }
    }
    return false;
}

function isEnemy(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.ENEMY) {
            return true
        }
    }
    return false;
}

function isInanimate(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.INANIMATE) {
            return true
        }
    }
    return false;
}


function isRelativelyEmpty(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL
            && (tileEntity === null || tileEntity.role === ROLE.PLAYER)) {
            return true
        }
    }
    return false;
}

function isEmpty(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (Game.map[tilePositionY][tilePositionX].entity === null && Game.map[tilePositionY][tilePositionX].tileType !== TILE_TYPE.WALL) {
            return true
        }
    }
    return false;
}

function isLit(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        return Game.map[tilePositionY][tilePositionX].lit;
    }
    return false;
}

function getPlayerOnTile(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = Game.map[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.PLAYER) return tileEntity;
    }
    return null;
}