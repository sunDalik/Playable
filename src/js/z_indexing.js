export const Z_INDEXES = Object.freeze({
    PLAYER_PRIMARY: 3,
    PLAYER: 1,
    ENEMY: 0,
    INTENT: 5,
    HEART: 0,
    TEXT: 0,
    DARKNESS: 10,
    WALL: 0
});

export function getZIndexForLayer(y, wall = false) {
    const modifier = 10;
    if (wall) return y * modifier;
    else return y * modifier + 1;
}