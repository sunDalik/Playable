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
    SPIKY_WALL_TRAP: 22,
    BALLET_SPIDER: 23,
    PARANOID_EEL: 24,
    GUARDIAN_OF_THE_LIGHT: 25,
    COCOON: 26,
    LIZARD_WARRIOR: 27,
    MUD_CUBE_ZOMBIE: 28,
    MUD_MAGE: 29,
    TELEPORT_MAGE: 30,
    WALL_SLIME: 31,
    PING_PONG_BUDDY: 32,
    SUMMON_CIRCLE: 33
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
    ABYSSAL_SPIT: 7,
    ETERNAL_CROSS: 8,
    IMMORTALITY: 9
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
export const TILE_TYPE = Object.freeze({VOID: 0, NONE: 1, WALL: 2, ENTRY: 4, SUPER_WALL: 5, EXIT: 6});
export const ROLE = Object.freeze({ENEMY: 0, PLAYER: 1, INANIMATE: 2, BULLET: 3, WALL_TRAP: 4});
export const INANIMATE_TYPE = Object.freeze({
    STATUE: 0,
    OBELISK: 1,
    GRAIL: 2,
    CHEST: 3,
    ACCUMULATOR: 4,
    FIRE_GOBLET: 5,
    PEDESTAL: 6
});

//uuuuuuuuuuuuuuuuhhhhhhhhhhhhhhhhhhhh it should probably contain a string value like "footwear"?
// and so you can easily get the slot by equipment type?? dunno yet
export const EQUIPMENT_TYPE = Object.freeze({
    WEAPON: 0,
    HEAD: 1,
    ARMOR: 2,
    FOOT: 3,
    SHIELD: 5,
    TOOL: 6,
    MAGIC: 7,
    BAG_ITEM: 8,

    //hmmm this is probably a stillborn idea and will be later changed into a passive type
    ONE_TIME: 9,

    KEY: 10
});
export const WEAPON_TYPE = Object.freeze({
    KNIFE: 0,
    LONG_SWORD: 1,
    ASSASSIN_DAGGER: 2,
    BOW: 3,
    BOOK_OF_FLAMES: 4,
    SCYTHE: 5,
    MAIDEN_DAGGER: 6,
    HAMMER: 7,
    PICKAXE: 8,
    SPEAR: 9,
    PAWN_SWORDS: 10,
    RUSTY_SWORD: 11,
    CROSSBOW: 12,
    DIVINE_BOW: 13,
    BOOK_OF_THUNDERS: 14,
    BOOK_OF_WEBS: 15,
    BOOK_OF_ICE: 16,
    DOUBLE_GLAIVE: 17
});
export const HEAD_TYPE = Object.freeze({
    WIZARD_HAT: 0,
    SEER_CIRCLET: 1,
    VAMPIRE_CROWN: 2,
    BATTLE_HELMET: 3,
    BLADE_CROWN: 4
});
export const ARMOR_TYPE = Object.freeze({BASIC: 0, WIZARD_ROBE: 1, WINGS: 2, HEAVY: 3, ELECTRIC: 4});
export const FOOTWEAR_TYPE = Object.freeze({ADVENTURER: 0, DAMAGING: 1, DARK: 2, OLD_BALLET_SHOES: 3});
export const SHIELD_TYPE = Object.freeze({PASSIVE: 0, STUNNING: 1, SPIKY: 2, BASIC: 3, FELL_STAR_SHIELD: 4});
export const TOOL_TYPE = Object.freeze({TORCH: 0});
export const BAG_ITEM_TYPE = Object.freeze({BOMB: 0, SMALL_HEALING_POTION: 1});
export const ONE_TIME_ITEM_TYPE = Object.freeze({HEART: 0});

export const DIRECTIONS = Object.freeze({CARDINAL: 0, DIAGONAL: 1});

export const PLANE = Object.freeze({HORIZONTAL: 0, VERTICAL: 1});

export const HAZARD_TYPE = Object.freeze({POISON: 0, FIRE: 1, DARK_POISON: 2, DARK_FIRE: 3});

export const RARITY = Object.freeze({
    C: {label: "C", color: 0xffffff, chanceFrom: 0, chanceTo: 0, num: 0},
    B: {label: "B", color: 0x94c9f2, chanceFrom: 0, chanceTo: 0, num: 1},
    A: {label: "A", color: 0x84f081, chanceFrom: 0, chanceTo: 0, num: 2},
    S: {label: "S", color: 0xf5e476, chanceFrom: 0, chanceTo: 0, num: 3},
    UNIQUE: {label: "Unique", color: 0xffffff, chanceFrom: 0, chanceTo: 0, num: 0},
});

export const LEVEL_SYMBOLS = Object.freeze({
    NONE: "",
    WALL: "w",
    SUPER_WALL: "sw",
    VOID: "v",
    ENTRY: "e"
});

export const STORAGE = Object.freeze({
    KEY_MOVE_UP_1P: "KeyMoveUp1",
    KEY_MOVE_LEFT_1P: "KeyMoveLeft1",
    KEY_MOVE_DOWN_1P: "KeyMoveDown1",
    KEY_MOVE_RIGHT_1P: "KeyMoveRight1",

    KEY_MOVE_UP_2P: "KeyMoveUp2",
    KEY_MOVE_LEFT_2P: "KeyMoveLeft2",
    KEY_MOVE_DOWN_2P: "KeyMoveDown2",
    KEY_MOVE_RIGHT_2P: "KeyMoveRight2",

    KEY_MAGIC_1_1P: "KeyMagic1Player1",
    KEY_MAGIC_2_1P: "KeyMagic2Player1",
    KEY_MAGIC_3_1P: "KeyMagic3Player1",

    KEY_MAGIC_1_2P: "KeyMagic1Player2",
    KEY_MAGIC_2_2P: "KeyMagic2Player2",
    KEY_MAGIC_3_2P: "KeyMagic3Player2",

    KEY_WEAPON_1P: "KeyWeaponPlayer1",
    KEY_WEAPON_2P: "KeyWeaponPlayer2",
    KEY_EXTRA_1P: "KeyExtraPlayer1",
    KEY_EXTRA_2P: "KeyExtraPlayer2",
    KEY_BAG_1P: "KeyBagPlayer1",
    KEY_BAG_2P: "KeyBagPlayer2",

    KEY_Z_SWITCH: "KeyZSwitch",
    KEY_MAP: "KeyMap",
    KEY_PAUSE: "KeyPause",

    SHOW_TIME: "ShowTimer",
    ACHIEVEMENTS: "Achievements",
    DISABLE_MOUSE: "DisableMouse",
    SHOW_FPS: "ShowFPS"
});

export const GAME_STATE = Object.freeze({MENU: 0, PLAYING: 1});

export const ACHIEVEMENT_ID = Object.freeze({BEAT_FC: 0, BEAT_DT: 1, BEAT_ANY_BOSS_NO_DAMAGE: 2});