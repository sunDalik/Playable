"use strict";

function isNotAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (GameState.gameMap[tilePositionY][tilePositionX].wall === false) {
            return true
        }
    }
    return false;
}

function isNotOutOfMap(tilePositionX, tilePositionY) {
    if (tilePositionX <= GameState.gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= GameState.gameMap.length - 1 && tilePositionY >= 0) {
            return true
        }
    }
    return false;
}

function isEnemy(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = GameState.gameMap[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.ENEMY) {
            return true
        }
    }
    return false;
}

function getPlayerOnTile(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = GameState.gameMap[tilePositionY][tilePositionX].entity;
        if (tileEntity != null && tileEntity.role === ROLE.PLAYER) return tileEntity;
    }
    return null;
}