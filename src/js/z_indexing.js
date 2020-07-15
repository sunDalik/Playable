export const Z_INDEXES = Object.freeze({
    PLAYER_PRIMARY: 3,
    PLAYER: 1,
    ENEMY: 4,
    INTENT: 2,
    HEART: 0,
    META: 20,
    WALL: 0,
    HAZARD: -1,
    BULLET: 5,
    DOOR: 0,
    DARKNESS: 6,
    DARK_TUNNEL_DARKNESS: 16
});

export function getZIndexForLayer(y, wall = false) {
    const modifier = 10;
    if (wall) return y * modifier;
    else return y * modifier + 1;
}