export const ENEMY_TYPE = Object.freeze({
    ROLLER: 0,
    ROLLER_B: 1,
    STAR: 2,
    STAR_B: 3,
    SPIDER: 4,
    SPIDER_B: 5,
    SNAIL: 6,
    SNAIL_B: 7,
    EEL: 8,
    POISON_EEL: 9,
    DARK_EEL: 10
});

export const MAGIC_ALIGNMENT = Object.freeze({GRAY: 0, WHITE: 1, DARK: 2});
export const MAGIC_TYPE = Object.freeze({
    NONE: 0,
    FIREBALL: 1,
    AURA: 2,
    SPIKES: 3,
    TELEPORT: 4,
    NECROMANCY: 5,
    PETRIFICATION: 6
});

export const STAGE = Object.freeze({FLOODED_CAVE: 0, DARK_TUNNEL: 1, RUINS: 2, DUNNO: 3, FINALE: 4});
export const TILE_TYPE = Object.freeze({VOID: 0, NONE: 1, WALL: 2, PATH: 3, ENTRY: 4, SUPER_WALL: 5, EXIT: 6});
export const ROLE = Object.freeze({ENEMY: 0, PLAYER: 1, INANIMATE: 2});
export const INANIMATE_TYPE = Object.freeze({STATUE: 0, OBELISK: 1, GRAIL: 2, CHEST: 3, ACCUMULATOR: 4});

export const EQUIPMENT_TYPE = Object.freeze({WEAPON: 0, HEAD: 1, ARMOR: 2, FOOT: 3, SHIELD: 5, TOOL: 6});
export const WEAPON_TYPE = Object.freeze({NONE: 0, KNIFE: 1, SWORD: 2, NINJA_KNIFE: 3, BOW: 4});
export const HEAD_TYPE = Object.freeze({NONE: 0, WIZARD_HAT: 1, SEER_CIRCLET: 2});
export const ARMOR_TYPE = Object.freeze({NONE: 0, BASIC: 1, WIZARD_ROBE: 2});
export const FOOTWEAR_TYPE = Object.freeze({NONE: 0, DIAGONAL: 1, ANTI_HAZARD: 2, DAMAGING: 3});
export const SHIELD_TYPE = Object.freeze({NONE: 0, PARRY: 1, PASSIVE: 2, STUNNING: 3, SPIKY: 4, ARMORING: 5});
export const TOOL_TYPE = Object.freeze({NONE: 0, PICKAXE: 1});

export const DIRECTIONS = Object.freeze({CARDINAL: 0, DIAGONAL: 1});
