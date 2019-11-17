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
        .add("src/images/exit.png")
        .add("src/images/player_attack.png")
        .add("src/images/player2_attack.png")

        .add("src/images/hazards/poison.png")

        .add("src/images/enemy_attack.png")
        //make different folders for enemies? based on what? on their stage maybe? dunno...
        .add("src/images/enemies/roller.png")
        .add("src/images/enemies/roller_b.png")
        .add("src/images/enemies/star.png")
        .add("src/images/enemies/star_b.png")
        .add("src/images/enemies/spider.png")
        .add("src/images/enemies/spider_b.png")
        .add("src/images/enemies/spider_green.png")
        .add("src/images/enemies/spider_red.png")
        .add("src/images/enemies/snail.png")
        .add("src/images/enemies/snail_b.png")
        .add("src/images/enemies/eel.png")
        .add("src/images/enemies/eel_poison.png")
        .add("src/images/enemies/eel_dark.png")

        .add("src/images/HUD/heart_full.png")
        .add("src/images/HUD/heart_75.png")
        .add("src/images/HUD/heart_half.png")
        .add("src/images/HUD/heart_25.png")
        .add("src/images/HUD/heart_empty.png")
        .add("src/images/HUD/slot_weapon.png")
        .add("src/images/HUD/slot_second_hand.png")
        .add("src/images/HUD/slot_magic.png")
        .add("src/images/HUD/slot_armor.png")
        .add("src/images/HUD/slot_head.png")
        .add("src/images/HUD/slot_feet.png")

        .add("src/images/weapons/knife.png")
        .add("src/images/weapons/ninja_knife.png")
        .add("src/images/weapons/sword.png")
        .add("src/images/weapons/bow.png")
        .add("src/images/weapons/book_of_flames.png")
        .add("src/images/weapons/scythe.png")
        .add("src/images/weapons/maiden_dagger.png")

        .add("src/images/tools/pickaxe.png")

        .add("src/images/shields/stunning.png")
        .add("src/images/shields/passive.png")
        .add("src/images/shields/spiky.png")

        .add("src/images/armor/basic.png")
        .add("src/images/armor/wizard_robe.png")

        .add("src/images/footwear/anti_hazard.png")
        .add("src/images/footwear/damaging.png")

        .add("src/images/headwear/seer_circlet.png")
        .add("src/images/headwear/wizard_hat.png")

        .add("src/images/other/statue.png")
        .add("src/images/other/statue_knife.png")
        .add("src/images/other/statue_ninja_knife.png")
        .add("src/images/other/statue_sword.png")
        .add("src/images/other/statue_bow.png")
        .add("src/images/other/statue_book_of_flames.png")
        .add("src/images/other/statue_maiden_dagger.png")
        .add("src/images/other/statue_maiden_dagger_2.png")
        .add("src/images/other/statue_scythe.png")

        .add("src/images/other/chest.png")
        .add("src/images/other/chest_opened.png")

        .add("src/images/other/grail.png")
        .add("src/images/other/grail_white.png")
        .add("src/images/other/grail_dark.png")
        .add("src/images/other/grail_gray.png")
        .add("src/images/other/obelisk.png")
        .add("src/images/other/obelisk_damaged.png")
        .add("src/images/other/obelisk_used.png")
        .add("src/images/other/obelisk_used_damaged.png")
        .add("src/images/other/obelisk_broken.png")

        .add("src/images/magic/aura.png")
        .add("src/images/magic/fireball.png")
        .add("src/images/magic/fireball_1.png")
        .add("src/images/magic/fireball_2.png")
        .add("src/images/magic/fireball_3.png")
        .add("src/images/magic/spikes.png")
        .add("src/images/magic/teleport.png")
        .add("src/images/magic/necromancy.png")
        .add("src/images/magic/petrification.png")

        .add("src/images/grid.png")
        .load(afterLoad);
}