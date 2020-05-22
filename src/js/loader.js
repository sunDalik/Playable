import {Game} from "./game";

export let CommonSpriteSheet, FCEnemiesSpriteSheet, DTEnemiesSpriteSheet, RUEnemiesSpriteSheet,
    ParanoidEelSpriteSheet, GotLSpriteSheet, IntentsSpriteSheet, InanimatesSpriteSheet,
    WeaponsSpriteSheet, AchievementsSpriteSheet, HUDSpriteSheet,
    BulletsSpriteSheet, ToolsSpriteSheet, ShieldsSpriteSheet, ArmorSpriteSheet, FootwearSpriteSheet,
    HeadWearSpriteSheet, BagSpriteSheet, MagicSpriteSheet;

export function loadAll(afterLoad) {
    Game.loader
        .add("src/images/wall.png")
        .add("src/images/key.png")
        .add("src/images/player2.png")

        //todo create effects spritesheet
        .add("src/images/effects/spike.png")
        .add("src/images/effects/poison_bubble.png")
        .add("src/images/effects/dark_poison_bubble.png")
        .add("src/images/effects/fire_effect.png")
        .add("src/images/effects/fire_effect_small.png")
        .add("src/images/effects/dark_fire_effect.png")
        .add("src/images/effects/dark_fire_effect_small.png")
        .add("src/images/effects/blue_fire_effect.png")
        .add("src/images/effects/web_effect.png")
        .add("src/images/effects/thunder_effect.png")

        .add("src/images/inanimates/chest.png") //todo move to spritesheet
        .add("src/images/inanimates/chest_opened.png") //todo move to spritesheet
        .add("src/images/player_hd.png")
        .add("src/images/player2_hd.png")
        .add("src/images/icons/obelisk_sacrifice.png")

        .add("src/images/one_time/life_fruit.png")
        .add("src/images/one_time/heart_shaped_key.png")

        .add("src/textures/common.json")
        .add("src/textures/intents.json")
        .add("src/textures/achievements.json")
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