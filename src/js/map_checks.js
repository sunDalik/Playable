import {Game} from "./game"
import {TILE_TYPE, ROLE, INANIMATE_TYPE} from "./enums";

export function isNotOutOfMap(tilePosX, tilePosY) {
    return tilePosX <= Game.map[0].length - 1 && tilePosX >= 0 &&
        tilePosY <= Game.map.length - 1 && tilePosY >= 0;
}

export function isDiggable(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        if (Game.map[tilePosY][tilePosX].tileType === TILE_TYPE.WALL) {
            return true
        }
    }
    return false;
}

export function isAnyWall(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        if (Game.map[tilePosY][tilePosX].tileType === TILE_TYPE.WALL
            || Game.map[tilePosY][tilePosX].tileType === TILE_TYPE.SUPER_WALL
            || Game.map[tilePosY][tilePosX].entity && Game.map[tilePosY][tilePosX].entity.role === ROLE.WALL_TRAP) {
            return true
        }
    }
    return false;
}

export function isNotAWall(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        if (Game.map[tilePosY][tilePosX].tileType !== TILE_TYPE.WALL
            && Game.map[tilePosY][tilePosX].tileType !== TILE_TYPE.SUPER_WALL
            && !(Game.map[tilePosY][tilePosX].entity && Game.map[tilePosY][tilePosX].entity.role === ROLE.WALL_TRAP)) {
            return true
        }
    }
    return false;
}

export function isEnemy(tilePosX, tilePosY) {
    return isEntity(tilePosX, tilePosY, ROLE.ENEMY);
}

export function isWallTrap(tilePosX, tilePosY) {
    return isEntity(tilePosX, tilePosY, ROLE.WALL_TRAP);
}

export function isInanimate(tilePosX, tilePosY) {
    return isEntity(tilePosX, tilePosY, ROLE.INANIMATE);
}

export function isObelisk(tilePosX, tilePosY) {
    return isEntity(tilePosX, tilePosY, ROLE.INANIMATE, INANIMATE_TYPE.OBELISK);
}

export function isBullet(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        const tileEntity = Game.map[tilePosY][tilePosX].entity;
        const tileEntity2 = Game.map[tilePosY][tilePosX].secondaryEntity;
        if (tileEntity && tileEntity.role === ROLE.BULLET || tileEntity2 && tileEntity2.role === ROLE.BULLET) {
            return true
        }
    }
    return false;
}

export function isAnyWallOrInanimate(tilePosX, tilePosY) {
    return isAnyWall(tilePosX, tilePosY) || isInanimate(tilePosX, tilePosY);
}

export function isRelativelyEmpty(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        const entity = Game.map[tilePosY][tilePosX].entity;
        if (isNotAWall(tilePosX, tilePosY)
            && (entity === null || entity.role === ROLE.PLAYER || entity.role === ROLE.BULLET)) {
            return true
        }
    }
    return false;
}

export function canBeFliedOverByBullet(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        const entity = Game.map[tilePosY][tilePosX].entity;
        if (isNotAWall(tilePosX, tilePosY)
            && (entity === null || entity.role === ROLE.BULLET
                || entity.role === ROLE.INANIMATE && entity.type === INANIMATE_TYPE.FIRE_GOBLET && entity.standing === false)) {
            return true
        }
    }
    return false;
}

export function isEmpty(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        if (Game.map[tilePosY][tilePosX].entity === null && isNotAWall(tilePosX, tilePosY)) {
            return true
        }
    }
    return false;
}

export function isLit(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        if (Game.darkTiles[tilePosY][tilePosX].visible === false || Game.darkTiles[tilePosY][tilePosX].alpha < 1) {
            return true;
        }
    }
    return false;
}

export function getPlayerOnTile(tilePosX, tilePosY) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        const entity = Game.map[tilePosY][tilePosX].entity;
        if (entity && entity.role === ROLE.PLAYER) return entity;
    }
    return null;
}

export function isEntity(tilePosX, tilePosY, role, type = null) {
    if (isNotOutOfMap(tilePosX, tilePosY)) {
        const entity = Game.map[tilePosY][tilePosX].entity;
        if (entity && entity.role === role && (type === null || entity.type === type)) {
            return true
        }
    }
    return false;
}

//boss room checks
export function areWeInTheBossRoom() {
    return (Game.player.tilePosition.x >= Game.endRoomBoundaries[0].x && Game.player.tilePosition.y >= Game.endRoomBoundaries[0].y
        && Game.player.tilePosition.x <= Game.endRoomBoundaries[1].x && Game.player.tilePosition.y <= Game.endRoomBoundaries[1].y || Game.player.dead)
        && (Game.player2.tilePosition.x >= Game.endRoomBoundaries[0].x && Game.player2.tilePosition.y >= Game.endRoomBoundaries[0].y
            && Game.player2.tilePosition.x <= Game.endRoomBoundaries[1].x && Game.player2.tilePosition.y <= Game.endRoomBoundaries[1].y || Game.player2.dead)
        && (!Game.player.dead || !Game.player2.dead);
}

export function amIInTheBossRoom(player) {
    return player.tilePosition.x >= Game.endRoomBoundaries[0].x && player.tilePosition.y >= Game.endRoomBoundaries[0].y
        && player.tilePosition.x <= Game.endRoomBoundaries[1].x && player.tilePosition.y <= Game.endRoomBoundaries[1].y
        && !player.dead;
}

export function tileInsideTheBossRoom(x, y) {
    return x >= Game.endRoomBoundaries[0].x && y >= Game.endRoomBoundaries[0].y
        && x <= Game.endRoomBoundaries[1].x && y <= Game.endRoomBoundaries[1].y;
}