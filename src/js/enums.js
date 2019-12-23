export const ENEMY_TYPE = Object.freeze({
    ROLLER: 0,
    ROLLER_RED: 1,
    STAR: 2,
    STAR_RED: 3,
    SPIDER: 4,
    SPIDER_GRAY: 5,
    SNAIL: 6,
    SNAIL_SPIKY: 7,
    EEL: 8,
    POISON_EEL: 9,
    DARK_EEL: 10,
    SPIDER_RED: 11,
    SPIDER_GREEN: 12,
    FROG: 13,
    FROG_FIRE: 14,
    FROG_KING: 15,
    FROG_KING_FIRE: 16,
    MUSHROOM: 17,
    SMALL_MUSHROOM: 18,
    ALLIGATOR: 19,
    RABBIT: 20,
    LASER_TURRET: 21,
    SPIKY_WALL_TRAP: 22
});
export const RABBIT_TYPE = Object.freeze({
    ENERGY: 0,
    ELECTRIC: 1,
    FIRE: 2,
    POISON: 3
});

export const MAGIC_ALIGNMENT = Object.freeze({GRAY: 0, WHITE: 1, DARK: 2});
export const MAGIC_TYPE = Object.freeze({
    FIREBALL: 0,
    AURA: 1,
    SPIKES: 2,
    TELEPORT: 3,
    NECROMANCY: 4,
    PETRIFICATION: 5,
    WIND: 6,
    ABYSSAL_SPIT: 7
});

export const STAGE = Object.freeze({
    FLOODED_CAVE: 0,
    DARK_TUNNEL: 1,
    RUINS: 2,
    LABYRINTH: 3,
    FINALE: 4,
    CANYON: 5,
    ARENA: 6
});
export const TILE_TYPE = Object.freeze({VOID: 0, NONE: 1, WALL: 2, PATH: 3, ENTRY: 4, SUPER_WALL: 5, EXIT: 6});
export const ROLE = Object.freeze({ENEMY: 0, PLAYER: 1, INANIMATE: 2, BULLET: 3, WALL_TRAP: 4});
export const INANIMATE_TYPE = Object.freeze({STATUE: 0, OBELISK: 1, GRAIL: 2, CHEST: 3, ACCUMULATOR: 4});

export const EQUIPMENT_TYPE = Object.freeze({WEAPON: 0, HEAD: 1, ARMOR: 2, FOOT: 3, SHIELD: 5, TOOL: 6, MAGIC: 7});
export const WEAPON_TYPE = Object.freeze({
    KNIFE: 0,
    SWORD: 1,
    NINJA_KNIFE: 2,
    BOW: 3,
    BOOK_OF_FLAMES: 4,
    SCYTHE: 5,
    MAIDEN_DAGGER: 6,
    HAMMER: 7,
    PICKAXE: 8
});
export const HEAD_TYPE = Object.freeze({WIZARD_HAT: 0, SEER_CIRCLET: 1, VAMPIRE_CROWN: 2});
export const ARMOR_TYPE = Object.freeze({BASIC: 0, WIZARD_ROBE: 1, WINGS: 2, HEAVY: 3, ELECTRIC: 4});
export const FOOTWEAR_TYPE = Object.freeze({ADVENTURER: 0, DAMAGING: 1, DARK: 2, OLD_BALLET_SHOES: 3});
export const SHIELD_TYPE = Object.freeze({PASSIVE: 0, STUNNING: 1, SPIKY: 2, ARMORING: 3});
export const TOOL_TYPE = Object.freeze({TORCH: 0});

export const DIRECTIONS = Object.freeze({CARDINAL: 0, DIAGONAL: 1});

export const HAZARD_TYPE = Object.freeze({POISON: 0, FIRE: 1, DARK_POISON: 2, DARK_FIRE: 3});

export const MAP_SYMBOLS = Object.freeze({
    NONE: "",
    WALL: "w",
    SUPER_WALL: "sw",
    VOID: "v",
    ENTRY: "entry",
    PATH: "path",
    EXIT: "exit",
    START: "start",
    ROLLER: "r",
    ROLLER_RED: "rb",
    STAR: "s",
    STAR_RED: "sb",
    SPIDER: "spi",
    SPIDER_GRAY: "spib",
    SPIDER_RED: "spider_red",
    SPIDER_GREEN: "spider_green",
    SNAIL: "sna",
    SNAIL_SPIKY: "snab",
    EEL: "eel",
    EEL_DARK: "eel_dark",
    EEL_POISON: "eel_poison",
    FROG: "frog",
    FROG_FIRE: "frog_fire",
    FROG_KING: "frog_king",
    FROG_KING_FIRE: "frog_king_fire",
    MUSHROOM: "mushroom",
    MUSHROOM_SMALL: "mushroom_small",
    ALLIGATOR: "alligator",
    ALLIGATOR_ENERGY: "alligator_energy",
    ALLIGATOR_ELECTRIC: "alligator_electric",
    ALLIGATOR_FIRE: "alligator_fire",
    ALLIGATOR_POISON: "alligator_poison",
    RABBIT_ENERGY: "rabbit_energy",
    RABBIT_ELECTRIC: "rabbit_electric",
    RABBIT_FIRE: "rabbit_fire",
    RABBIT_POISON: "rabbit_poison",
    LASER_TURRET: "laser_turret",
    SPIKY_WALL_TRAP: "swt",
    STATUE: "statue",
    CHEST: "chest",
    OBELISK: "obelisk",
    TORCH: "torch"
});