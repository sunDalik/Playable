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
    SUMMON_CIRCLE: 33,
    SPIDER_SMALL: 34,
    HEX_EYE: 35,
    BLADE_DEMON: 36,
    EXPLOSIVE_PIXIE: 37,
    FIRE_SNAIL: 38
});

export const RABBIT_TYPE = Object.freeze({
    ELECTRIC: 1,
    FIRE: 2,
    POISON: 3
});

export const MAGIC_ALIGNMENT = Object.freeze({GRAY: 0, WHITE: 1, DARK: 2});

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
    OBELISK: 1,
    GRAIL: 2,
    CHEST: 3,
    ACCUMULATOR: 4,
    FIRE_GOBLET: 5,
    PEDESTAL: 6
});

export const EQUIPMENT_TYPE = Object.freeze({
    WEAPON: 0,
    HEAD: 1,
    ARMOR: 2,
    FOOT: 3,
    SHIELD: 5,
    TOOL: 6, //hmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
    MAGIC: 7,
    BAG_ITEM: 8,

    ONE_TIME: 9,

    KEY: 10,
    ACCESSORY: 11
});

export const SLOT = Object.freeze({
    WEAPON: "weapon",
    EXTRA: "secondHand",
    HEADWEAR: "headwear",
    ARMOR: "armor",
    FOOTWEAR: "footwear",
    MAGIC1: "magic1",
    MAGIC2: "magic2",
    MAGIC3: "magic3",
    BAG: "bag",
    ACCESSORY: "accessory"
});

export const EQUIPMENT_ID = Object.freeze({
    KNIFE: 0,
    LONG_SWORD: 1,
    ASSASSIN_DAGGER: 2,
    BOW: 3,
    BOOK_OF_FLAMES: 4,
    SCYTHE: 5,
    MAIDEN_SHORT_SWORD: 6,
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
    DOUBLE_GLAIVE: 17,
    GOLDEN_DAGGER: 18,
    BOOMERAXE: 19,
    PRISMAXE: 20,
    CERBERUS_BOW: 21,
    WIZARD_HAT: 22,
    SEER_CIRCLET: 23,
    VAMPIRE_CROWN: 24,
    BATTLE_HELMET: 25,
    BLADE_CROWN: 26,
    WITCH_HAT: 27,
    LEATHER_ARMOR: 28,
    WIZARD_ROBE: 29,
    WINGS: 30,
    HEAVY_ARMOR: 31,
    ELECTRIC_ARMOR: 32,
    BRONZE_ARMOR: 33,
    ADVENTURER_BOOTS: 34,
    DAMAGING_BOOTS: 35,
    DARK_BOOTS: 36,
    OLD_BALLET_SHOES: 37,
    POSSESSED_SANDALS: 38,
    GOLDEN_SHIELD: 39,
    STUNNING_SHIELD: 40,
    SPIKY_SHIELD: 41,
    SHIELD: 42,
    FELL_STAR_SHIELD: 43,
    TORCH: 44,
    BOMB: 45,
    HEALING_POTION: 46,
    LIFE_FRUIT: 47,
    HEART_SHAPED_KEY: 48,
    VIAL_OF_ICHOR: 49,
    FLASK_OF_FIRE: 50,
    WEAPON_MASTER_EMBLEM: 51,
    HERO_KEY: 52,
    QUIVER_OF_THE_FOREST_SPIRIT: 53,
    LIGHT: 54,
    SUN_BLESSING: 55,
    SPIKES: 56,
    NECROMANCY: 57,
    WIND: 58,
    ABYSSAL_SPIT: 59,
    IMMORTALITY: 60,
    VAMPIRE_SPIKES: 61,
    INFERNAL_SPIKES: 62,
    TRANSCENDENCE: 63,
    CRYSTAL_WIND: 64,
    CRYSTAL_GUARDIAN: 65,
    ESCAPE: 66,
    DEFENSE_LINK: 67,
    ATTACK_LINK: 68,
    THUNDERSTORM: 69,
    EMPYREAL_WRATH: 70
});

export const DAMAGE_TYPE = Object.freeze({
    PHYSICAL: 0,
    MAGICAL: 1,
    HAZARDAL: 2
});

export const DIRECTIONS = Object.freeze({CARDINAL: 0, DIAGONAL: 1});

export const PLANE = Object.freeze({HORIZONTAL: 0, VERTICAL: 1});

export const HAZARD_TYPE = Object.freeze({POISON: 0, FIRE: 1, DARK_POISON: 2, DARK_FIRE: 3});

export const RARITY = Object.freeze({
    C: {label: "C", color: 0xffffff, chanceFrom: 0, chanceTo: 0, num: 0},
    B: {label: "B", color: 0x94c9f2, chanceFrom: 0, chanceTo: 0, num: 1},
    A: {label: "A", color: 0x84f081, chanceFrom: 0, chanceTo: 0, num: 2},
    S: {label: "S", color: 0xf5e476, chanceFrom: 0, chanceTo: 0, num: 3},
    UNIQUE: {label: "Unique", color: 0xffffff, chanceFrom: 0, chanceTo: 0, num: 0}
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