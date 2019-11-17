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
    FIREBALL: 0,
    AURA: 1,
    SPIKES: 2,
    TELEPORT: 3,
    NECROMANCY: 4,
    PETRIFICATION: 5
});

export const STAGE = Object.freeze({FLOODED_CAVE: 0, DARK_TUNNEL: 1, RUINS: 2, DUNNO: 3, FINALE: 4});
export const TILE_TYPE = Object.freeze({VOID: 0, NONE: 1, WALL: 2, PATH: 3, ENTRY: 4, SUPER_WALL: 5, EXIT: 6});
export const ROLE = Object.freeze({ENEMY: 0, PLAYER: 1, INANIMATE: 2});
export const INANIMATE_TYPE = Object.freeze({STATUE: 0, OBELISK: 1, GRAIL: 2, CHEST: 3, ACCUMULATOR: 4});

export const EQUIPMENT_TYPE = Object.freeze({WEAPON: 0, HEAD: 1, ARMOR: 2, FOOT: 3, SHIELD: 5, TOOL: 6, MAGIC: 7});
export const WEAPON_TYPE = Object.freeze({
    KNIFE: 0,
    SWORD: 1,
    NINJA_KNIFE: 2,
    BOW: 3,
    BOOK_OF_FLAMES: 4,
    SCYTHE: 5,
    MAIDEN_DAGGER: 6
});
export const HEAD_TYPE = Object.freeze({WIZARD_HAT: 0, SEER_CIRCLET: 1});
export const ARMOR_TYPE = Object.freeze({BASIC: 0, WIZARD_ROBE: 1});
export const FOOTWEAR_TYPE = Object.freeze({DIAGONAL: 0, ANTI_HAZARD: 1, DAMAGING: 2});
export const SHIELD_TYPE = Object.freeze({PARRY: 0, PASSIVE: 1, STUNNING: 2, SPIKY: 3, ARMORING: 4});
export const TOOL_TYPE = Object.freeze({PICKAXE: 0});

export const DIRECTIONS = Object.freeze({CARDINAL: 0, DIAGONAL: 1});
