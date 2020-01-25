import {Game} from "./game";

export function loadAll(afterLoad) {
    Game.loader
        .add("src/images/player.png")
        .add("src/images/player2.png")
        .add("src/images/player_moved.png")
        .add("src/images/player2_moved.png")
        .add("src/images/fire.png")
        //put all blocks into blocks folder
        .add("src/images/wall.png")
        .add("src/images/super_wall.png")
        .add("src/images/boss_entry.png")
        .add("src/images/boss_entry_opened.png")
        .add("src/images/exit_text.png")
        .add("src/images/player_attack.png")
        .add("src/images/player2_attack.png")
        .add("src/images/follow_chain.png")
        .add("src/images/limit_chain.png")

        .add("src/images/icons/swap_icon_1.png")
        .add("src/images/icons/swap_icon_2.png")
        .add("src/images/icons/chain_icon.png")
        .add("src/images/icons/unchain_icon.png")
        .add("src/images/icons/together_icon.png")
        .add("src/images/icons/obelisk_sacrifice.png")

        .add("src/images/icons/intents/hourglass.png")
        .add("src/images/icons/intents/arrow_right.png")
        .add("src/images/icons/intents/fear.png")
        .add("src/images/icons/intents/anger.png")
        .add("src/images/icons/intents/neutral.png")
        .add("src/images/icons/intents/poison.png")
        .add("src/images/icons/intents/fire.png")
        .add("src/images/icons/intents/electricity.png")
        .add("src/images/icons/intents/question_mark.png")
        .add("src/images/icons/intents/eye.png")
        .add("src/images/icons/intents/spikes.png")
        .add("src/images/icons/intents/laser.png")
        .add("src/images/icons/intents/stun.png")
        .add("src/images/icons/intents/two_tiles_forward.png")
        .add("src/images/icons/intents/three_tiles_front.png")

        .add("src/images/hazards/poison.png")
        .add("src/images/hazards/fire.png")
        .add("src/images/hazards/fire_small.png")
        .add("src/images/hazards/dark_poison.png")
        .add("src/images/hazards/dark_fire.png")
        .add("src/images/hazards/dark_fire_small.png")

        //make different folders for enemies? based on what? on their stage maybe? dunno...
        .add("src/images/enemies/roller.png")
        .add("src/images/enemies/roller_b.png")
        .add("src/images/enemies/star.png")
        .add("src/images/enemies/star_b.png")
        .add("src/images/enemies/star_spike.png")
        .add("src/images/enemies/star_b_spike.png")
        .add("src/images/enemies/spider.png")
        .add("src/images/enemies/spider_b.png")
        .add("src/images/enemies/spider_green.png")
        .add("src/images/enemies/spider_red.png")
        .add("src/images/enemies/snail.png")
        .add("src/images/enemies/snail_spiky.png")
        .add("src/images/enemies/eel.png")
        .add("src/images/enemies/eel_poison.png")
        .add("src/images/enemies/eel_dark.png")
        .add("src/images/enemies/frog.png")
        .add("src/images/enemies/frog_fire.png")
        .add("src/images/enemies/frog_king.png")
        .add("src/images/enemies/frog_king_fire.png")
        .add("src/images/enemies/mushroom.png")
        .add("src/images/enemies/mushroom_walking.png")
        .add("src/images/enemies/mushroom_small.png")
        .add("src/images/enemies/mushroom_small_walking.png")
        .add("src/images/enemies/alligator_x.png")
        .add("src/images/enemies/alligator_x_hungry.png")
        .add("src/images/enemies/alligator_x_electric.png")
        .add("src/images/enemies/alligator_x_electric_shooting.png")
        .add("src/images/enemies/alligator_x_fire.png")
        .add("src/images/enemies/alligator_x_fire_shooting.png")
        .add("src/images/enemies/alligator_x_poison.png")
        .add("src/images/enemies/alligator_x_poison_shooting.png")
        .add("src/images/enemies/alligator_x_energy.png")
        .add("src/images/enemies/alligator_y.png")
        .add("src/images/enemies/alligator_y_hungry.png")
        .add("src/images/enemies/alligator_y_electric.png")
        .add("src/images/enemies/alligator_y_electric_shooting.png")
        .add("src/images/enemies/alligator_y_fire.png")
        .add("src/images/enemies/alligator_y_fire_shooting.png")
        .add("src/images/enemies/alligator_y_poison.png")
        .add("src/images/enemies/alligator_y_poison_shooting.png")
        .add("src/images/enemies/alligator_y_energy.png")
        .add("src/images/enemies/rabbit_x_energy.png")
        .add("src/images/enemies/rabbit_x_electric.png")
        .add("src/images/enemies/rabbit_x_fire.png")
        .add("src/images/enemies/rabbit_x_poison.png")
        .add("src/images/enemies/laser_turret_0.png")
        .add("src/images/enemies/laser_turret_after_attack.png")
        .add("src/images/enemies/laser_turret_awake.png")
        .add("src/images/enemies/laser_turret_triggered.png")
        .add("src/images/enemies/laser_turret_unready.png")
        .add("src/images/enemies/spiky_wall_trap_x.png")
        .add("src/images/enemies/spiky_wall_trap_top.png")
        .add("src/images/enemies/spiky_wall_trap_bottom.png")
        .add("src/images/enemies/spiky_wall_trap_attacked.png")
        .add("src/images/enemies/spiky_wall_trap_triggered.png")
        .add("src/images/enemies/spikes_right.png")
        .add("src/images/enemies/cocoon.png")
        .add("src/images/enemies/lizard_warrior.png")
        .add("src/images/enemies/lizard_warrior_triggered_wide_slash.png")
        .add("src/images/enemies/lizard_warrior_triggered_forward_pierce.png")
        .add("src/images/enemies/lizard_warrior_after_attack.png")

        .add("src/images/bosses/paranoid_eel/neutral.png")
        .add("src/images/bosses/paranoid_eel/neutral_2.png")
        .add("src/images/bosses/paranoid_eel/panic.png")
        .add("src/images/bosses/paranoid_eel/neutral_y.png")
        .add("src/images/bosses/paranoid_eel/neutral_y_2.png")
        .add("src/images/bosses/paranoid_eel/panic_y.png")
        .add("src/images/bosses/paranoid_eel/ready_to_spit.png")
        .add("src/images/bosses/paranoid_eel/ready_to_spit_poison.png")
        .add("src/images/bosses/paranoid_eel/ready_to_spit_y.png")
        .add("src/images/bosses/paranoid_eel/ready_to_spit_poison_y.png")
        .add("src/images/bosses/paranoid_eel/spitting.png")
        .add("src/images/bosses/paranoid_eel/spitting_y.png")
        .add("src/images/bosses/paranoid_eel/vertical_rush.png")
        .add("src/images/bosses/paranoid_eel/horizontal_rush.png")
        .add("src/images/bosses/paranoid_eel/sneeze.png")
        .add("src/images/bosses/paranoid_eel/sneeze_y.png")

        .add("src/images/bosses/guardian_of_the_light/neutral.png")
        .add("src/images/bosses/guardian_of_the_light/electric.png")
        .add("src/images/bosses/guardian_of_the_light/fire.png")
        .add("src/images/bosses/guardian_of_the_light/before_electric.png")
        .add("src/images/bosses/guardian_of_the_light/after_electric.png")
        .add("src/images/bosses/guardian_of_the_light/about_to_teleport.png")

        .add("src/images/bullets/electric_bullet.png")
        .add("src/images/bullets/fire_bullet.png")

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
        .load(afterLoad);
}