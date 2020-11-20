import {Game} from "./game";

export let CommonSpriteSheet, FCEnemiesSpriteSheet, DTEnemiesSpriteSheet, RUEnemiesSpriteSheet, DCEnemiesSpriteSheet,
    ParanoidEelSpriteSheet, GotLSpriteSheet, IntentsSpriteSheet, InanimatesSpriteSheet,
    WeaponsSpriteSheet, AchievementsSpriteSheet, HUDSpriteSheet,
    BulletsSpriteSheet, ToolsSpriteSheet, ShieldsSpriteSheet, ArmorSpriteSheet, FootwearSpriteSheet,
    HeadWearSpriteSheet, BagSpriteSheet, MagicSpriteSheet, EffectsSpriteSheet, OneTimeSpriteSheet,
    AccessoriesSpriteSheet, LunaticLeaderSpriteSheet,
    FCTilesetSpriteSheet, DTTilesetSpriteSheet, RUTilesetSpriteSheet, DCTilesetSpriteSheet,
    DiscordSpriteSheet, ScorpionQueenSpriteSheet, MarbleChessSpriteSheet, MMTilesetSpriteSheet;

export function loadAll(afterLoad) {
    Game.loader
        .add("src/images/player_hd.png")
        .add("src/images/player2_hd.png")
        .add("src/images/npc/shopkeeper.png")
        .add("src/images/inanimates/shop_stand.png")
        .add("src/images/icons/obelisk_sacrifice.png")

        .add("src/textures/common.json")
        .add("src/textures/fc_tileset.json")
        .add("src/textures/dt_tileset.json")
        .add("src/textures/ru_tileset.json")
        .add("src/textures/dc_tileset.json")
        .add("src/textures/mm_tileset.json")
        .add("src/textures/effects.json")
        .add("src/textures/intents.json")
        .add("src/textures/achievements.json")

        .add("src/textures/fc_enemies.json")
        .add("src/textures/dt_enemies.json")
        .add("src/textures/ru_enemies.json")
        .add("src/textures/dc_enemies.json")

        .add("src/textures/paranoid_eel.json")
        .add("src/textures/gotl.json")
        .add("src/textures/lunatic_leader.json")
        .add("src/textures/scorpion_queen.json")
        .add("src/textures/marble_chess.json")

        .add("src/textures/bullets.json")
        .add("src/textures/hud.json")
        .add("src/textures/inanimates.json")

        .add("src/textures/weapons.json")
        .add("src/textures/tools.json")
        .add("src/textures/shields.json")
        .add("src/textures/headwear.json")
        .add("src/textures/armor.json")
        .add("src/textures/footwear.json")
        .add("src/textures/bag.json")
        .add("src/textures/one_time.json")
        .add("src/textures/accessories.json")
        .add("src/textures/magic.json")
        .add("src/textures/discord_logos.json")

        .add("src/textures/explosion_animation-0.json")
        .add("src/textures/explosion_animation-1.json")

        .load(() => {
            setSpriteSheets();
            afterLoad();
        });
}

function setSpriteSheets() {
    CommonSpriteSheet = Game.loader.resources["src/textures/common.json"].textures;
    FCEnemiesSpriteSheet = Game.loader.resources["src/textures/fc_enemies.json"].textures;
    DTEnemiesSpriteSheet = Game.loader.resources["src/textures/dt_enemies.json"].textures;
    RUEnemiesSpriteSheet = Game.loader.resources["src/textures/ru_enemies.json"].textures;
    DCEnemiesSpriteSheet = Game.loader.resources["src/textures/dc_enemies.json"].textures;
    ParanoidEelSpriteSheet = Game.loader.resources["src/textures/paranoid_eel.json"].textures;
    GotLSpriteSheet = Game.loader.resources["src/textures/gotl.json"].textures;
    IntentsSpriteSheet = Game.loader.resources["src/textures/intents.json"].textures;
    InanimatesSpriteSheet = Game.loader.resources["src/textures/inanimates.json"].textures;
    WeaponsSpriteSheet = Game.loader.resources["src/textures/weapons.json"].textures;
    AchievementsSpriteSheet = Game.loader.resources["src/textures/achievements.json"].textures;
    ArmorSpriteSheet = Game.loader.resources["src/textures/armor.json"].textures;
    FootwearSpriteSheet = Game.loader.resources["src/textures/footwear.json"].textures;
    HeadWearSpriteSheet = Game.loader.resources["src/textures/headwear.json"].textures;
    MagicSpriteSheet = Game.loader.resources["src/textures/magic.json"].textures;
    ToolsSpriteSheet = Game.loader.resources["src/textures/tools.json"].textures;
    ShieldsSpriteSheet = Game.loader.resources["src/textures/shields.json"].textures;
    HUDSpriteSheet = Game.loader.resources["src/textures/hud.json"].textures;
    BagSpriteSheet = Game.loader.resources["src/textures/bag.json"].textures;
    BulletsSpriteSheet = Game.loader.resources["src/textures/bullets.json"].textures;
    EffectsSpriteSheet = Game.loader.resources["src/textures/effects.json"].textures;
    OneTimeSpriteSheet = Game.loader.resources["src/textures/one_time.json"].textures;
    AccessoriesSpriteSheet = Game.loader.resources["src/textures/accessories.json"].textures;
    LunaticLeaderSpriteSheet = Game.loader.resources["src/textures/lunatic_leader.json"].textures;
    FCTilesetSpriteSheet = Game.loader.resources["src/textures/fc_tileset.json"].textures;
    DTTilesetSpriteSheet = Game.loader.resources["src/textures/dt_tileset.json"].textures;
    RUTilesetSpriteSheet = Game.loader.resources["src/textures/ru_tileset.json"].textures;
    DCTilesetSpriteSheet = Game.loader.resources["src/textures/dc_tileset.json"].textures;
    MMTilesetSpriteSheet = Game.loader.resources["src/textures/mm_tileset.json"].textures;
    DiscordSpriteSheet = Game.loader.resources["src/textures/discord_logos.json"].textures;
    ScorpionQueenSpriteSheet = Game.loader.resources["src/textures/scorpion_queen.json"].textures;
    MarbleChessSpriteSheet = Game.loader.resources["src/textures/marble_chess.json"].textures; //maybe should have just one spritesheet for both marble enemies and marble chess?
}