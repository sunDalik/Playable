const ENEMY_TYPE = Object.freeze({
    ROLLER: 0,
    ROLLER_B: 1,
    STAR: 2,
    STAR_B: 3,
    SPIDER: 4,
    SPIDER_B: 5,
    SNAIL: 6,
    SNAIL_B: 7
});

const ROLE = Object.freeze({ENEMY: 0, PLAYER: 1});
const DIRECTIONS = Object.freeze({CARDINAL: 0, DIAGONAL: 1});

const TILE_TYPE = Object.freeze({NONE: 0, WALL: 1, VOID: 2, PATH: 3, ENTRY: 4});