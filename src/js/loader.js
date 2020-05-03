import {Game} from "./game";

export let CommonSpriteSheet, FCEnemiesSpriteSheet, DTEnemiesSpriteSheet, RUEnemiesSpriteSheet,
    ParanoidEelSpriteSheet, GotLSpriteSheet, IntentsSpriteSheet, InanimatesSpriteSheet,
    HazardsSpriteSheet, WeaponsSpriteSheet, AchievementsSpriteSheet, HUDSpriteSheet,
    BulletsSpriteSheet, ToolsSpriteSheet, ShieldsSpriteSheet, ArmorSpriteSheet, FootwearSpriteSheet,
    HeadWearSpriteSheet, BagSpriteSheet, MagicSpriteSheet;

export function loadAll(afterLoad) {
    Game.loader
        .add("src/images/wall.png")
        .add("src/images/key.png")
        .add("src/images/inanimates/chest.png") //todo move to spritesheet
        .add("src/images/inanimates/chest_opened.png") //todo move to spritesheet
        .add("src/images/player_hd.png")
        .add("src/images/player2_hd.png")
        .add("src/images/icons/obelisk_sacrifice.png")
        .add("src/images/one_time/heart.png")

        .add("src/textures/common.json")
        .add("src/textures/intents.json")
        .add("src/textures/achievements.json")
        .add("src/textures/hazards.json")
        .add("src/textures/fc_enemies.json")
        .add("src/textures/dt_enemies.json")
        .add("src/textures/ru_enemies.json")
        .add("src/textures/paranoid_eel.json")
        .add("src/textures/gotl.json")
        .add("src/textures/bullets.json")
        .add("src/textures/hud.json")
        .add("src/textures/weapons.json")
        .add("src/textures/tools.json")
        .add("src/textures/shields.json")
        .add("src/textures/armor.json")
        .add("src/textures/footwear.json")
        .add("src/textures/headwear.json")
        .add("src/textures/bag.json")
        .add("src/textures/inanimates.json")
        .add("src/textures/magic.json")

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
    ParanoidEelSpriteSheet = Game.loader.resources["src/textures/paranoid_eel.json"].textures;
    GotLSpriteSheet = Game.loader.resources["src/textures/gotl.json"].textures;
    IntentsSpriteSheet = Game.loader.resources["src/textures/intents.json"].textures;
    InanimatesSpriteSheet = Game.loader.resources["src/textures/inanimates.json"].textures;
    HazardsSpriteSheet = Game.loader.resources["src/textures/hazards.json"].textures;
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
}