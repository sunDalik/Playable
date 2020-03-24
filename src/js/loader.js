import {Game} from "./game";

export let CommonSpriteSheet;
export let FCEnemiesSpriteSheet;
export let DTEnemiesSpriteSheet;
export let RUEnemiesSpriteSheet;
export let CommonEnemiesSpriteSheet;
export let RabbitsSpriteSheet;
export let ParanoidEelSpriteSheet;
export let GotLSpriteSheet;
export let IntentsSpriteSheet;

export function loadAll(afterLoad) {
    Game.loader
        .add("src/images/wall.png")
        .add("src/textures/common.json")
        .add("src/images/player_hd.png")
        .add("src/images/player2_hd.png")
        //.add("src/images/follow_chain.png")

        .add("src/images/icons/swap_icon_1.png")
        .add("src/images/icons/swap_icon_2.png")
        .add("src/images/icons/chain_icon.png")
        .add("src/images/icons/unchain_icon.png")
        .add("src/images/icons/together_icon.png")
        .add("src/images/icons/obelisk_sacrifice.png")

        .add("src/textures/intents.json")

        .add("src/images/achievements/locked.png")
        .add("src/images/achievements/beat_fc.png")
        .add("src/images/achievements/beat_dt.png")
        .add("src/images/achievements/beat_any_boss_no_damage.png")

        .add("src/images/hazards/poison.png")
        .add("src/images/hazards/fire.png")
        .add("src/images/hazards/fire_small.png")
        .add("src/images/hazards/dark_poison.png")
        .add("src/images/hazards/dark_fire.png")
        .add("src/images/hazards/dark_fire_small.png")

        .add("src/textures/fc_enemies.json")
        .add("src/textures/dt_enemies.json")
        .add("src/textures/ru_enemies.json")
        .add("src/textures/rabbits.json")
        .add("src/textures/common_enemies.json")

        .add("src/textures/paranoid_eel.json")
        .add("src/textures/gotl.json")

        .add("src/images/bullets/electric_bullet.png")
        .add("src/images/bullets/fire_bullet.png")
        .add("src/images/bullets/big_fire_bullet.png")

        .add("src/images/HUD/heart_full.png")
        .add("src/images/HUD/heart_75.png")
        .add("src/images/HUD/heart_half.png")
        .add("src/images/HUD/heart_25.png")
        .add("src/images/HUD/heart_empty.png")

        .add("src/images/weapons/knife.png")
        .add("src/images/weapons/ninja_knife.png")
        .add("src/images/weapons/sword.png")
        .add("src/images/weapons/bow.png")
        .add("src/images/weapons/arrow.png")
        .add("src/images/weapons/book_of_flames.png")
        .add("src/images/weapons/book_of_flames_used_0.png")
        .add("src/images/weapons/book_of_flames_used_1.png")
        .add("src/images/weapons/book_of_flames_used_2.png")
        .add("src/images/weapons/book_of_flames_exhausted_0.png")
        .add("src/images/weapons/book_of_flames_exhausted_1.png")
        .add("src/images/weapons/book_of_flames_exhausted_2.png")
        .add("src/images/weapons/scythe.png")
        .add("src/images/weapons/spear.png")
        .add("src/images/weapons/maiden_dagger.png")
        .add("src/images/weapons/hammer.png")
        .add("src/images/weapons/pawn_swords.png")
        .add("src/images/weapons/pawn_sword_separate.png")
        .add("src/images/weapons/rusty_sword.png")
        .add("src/images/weapons/rusty_sword_broken.png")

        .add("src/images/tools/pickaxe.png")
        .add("src/images/tools/torch.png")

        .add("src/images/shields/stunning.png")
        .add("src/images/shields/passive.png")
        .add("src/images/shields/spiky.png")
        .add("src/images/shields/basic.png")
        .add("src/images/shields/fell_star_shield.png")

        .add("src/images/armor/basic.png")
        .add("src/images/armor/wizard_robe.png")
        .add("src/images/armor/wings.png")
        .add("src/images/armor/heavy.png")
        .add("src/images/armor/electric.png")

        .add("src/images/footwear/adventurer.png")
        .add("src/images/footwear/damaging.png")
        .add("src/images/footwear/dark.png")
        .add("src/images/footwear/old_ballet_shoes.png")

        .add("src/images/headwear/seer_circlet.png")
        .add("src/images/headwear/wizard_hat.png")
        .add("src/images/headwear/vampire_crown.png")
        .add("src/images/headwear/battle_helmet.png")
        .add("src/images/headwear/blade_crown.png")
        .add("src/images/headwear/blade_crown_blade.png")

        .add("src/images/bag/bomb.png")
        .add("src/images/bag/bomb_ticking.png")
        .add("src/images/bag/bomb_about_to_explode.png")
        .add("src/images/bag/small_healing_potion.png")

        .add("src/images/one_time/heart.png")

        .add("src/images/other/statue.png")
        .add("src/images/other/statue_knife.png")
        .add("src/images/other/statue_ninja_knife.png")
        .add("src/images/other/statue_sword.png")
        .add("src/images/other/statue_bow.png")
        .add("src/images/other/statue_book_of_flames.png")
        .add("src/images/other/statue_maiden_dagger.png")
        .add("src/images/other/statue_maiden_dagger_2.png")
        .add("src/images/other/statue_scythe.png")
        .add("src/images/other/statue_hammer.png")
        .add("src/images/other/statue_spear.png")
        .add("src/images/other/statue_shield.png")
        .add("src/images/other/statue_tool.png")
        .add("src/images/other/statue_pawn_swords.png")
        .add("src/images/other/statue_rusty_sword.png")

        .add("src/images/other/fire_goblet.png")
        .add("src/images/other/fire_goblet_fallen.png")
        .add("src/images/other/fire_goblet_shattered.png")

        .add("src/images/other/chest.png")
        .add("src/images/other/chest_opened.png")
        .add("src/images/other/pedestal.png")

        .add("src/images/other/grail.png")
        .add("src/images/other/obelisk.png")
        .add("src/images/other/obelisk_damaged.png")
        .add("src/images/other/obelisk_used.png")
        .add("src/images/other/obelisk_used_damaged.png")

        .add("src/images/magic/aura.png")
        .add("src/images/magic/eternal_cross.png")
        .add("src/images/magic/fireball.png")
        .add("src/images/magic/fireball_1.png")
        .add("src/images/magic/fireball_2.png")
        .add("src/images/magic/fireball_3.png")
        .add("src/images/magic/spikes.png")
        .add("src/images/magic/teleport.png")
        .add("src/images/magic/necromancy.png")
        .add("src/images/magic/petrification.png")
        .add("src/images/magic/wind.png")
        .add("src/images/magic/abyssal_spit.png")
        .add("src/images/magic/immortality.png")
        .load(() => {
            setSpriteSheets();
            afterLoad()
        });
}

function setSpriteSheets() {
    CommonSpriteSheet = Game.loader.resources["src/textures/common.json"].textures;
    FCEnemiesSpriteSheet = Game.loader.resources["src/textures/fc_enemies.json"].textures;
    DTEnemiesSpriteSheet = Game.loader.resources["src/textures/dt_enemies.json"].textures;
    RUEnemiesSpriteSheet = Game.loader.resources["src/textures/ru_enemies.json"].textures;
    CommonEnemiesSpriteSheet = Game.loader.resources["src/textures/common_enemies.json"].textures;
    RabbitsSpriteSheet = Game.loader.resources["src/textures/rabbits.json"].textures;
    ParanoidEelSpriteSheet = Game.loader.resources["src/textures/paranoid_eel.json"].textures;
    GotLSpriteSheet = Game.loader.resources["src/textures/gotl.json"].textures;
    IntentsSpriteSheet = Game.loader.resources["src/textures/intents.json"].textures;
}