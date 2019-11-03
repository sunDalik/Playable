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

const WEAPON_TYPE = Object.freeze({NONE: 0, KNIFE: 1, SWORD: 2, NINJA_KNIFE: 3});
const TOOL_TYPE = Object.freeze({NONE: 0, PICKAXE: 1});
const SHIELD_TYPE = Object.freeze({NONE: 0, PARRY: 1, PASSIVE: 2});
const MAGIC_TYPE = Object.freeze({NONE: 0, FIREBALL: 1, AURA: 2, SPIKES: 3});
const HEAD_TYPE = Object.freeze({NONE: 0, WIZARD_HAT: 1});
const ARMOR_TYPE = Object.freeze({NONE: 0, BASIC: 1});
const FOOTWEAR_TYPE = Object.freeze({NONE: 0, DIAGONAL: 1});
