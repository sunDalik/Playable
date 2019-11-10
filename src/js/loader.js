"use strict";

function loadAll() {
    Game.loader
        .add("src/images/player.png")
        .add("src/images/player2.png")
        .add("src/images/player_moved.png")
        .add("src/images/player2_moved.png")
        .add("src/images/fire.png")
        .add("src/images/wall.png")
        .add("src/images/super_wall.png")
        .add("src/images/void.png") //put all blocks into blocks folder
        .add("src/images/exit.png")
        .add("src/images/player_attack.png")
        .add("src/images/player2_attack.png")
        .add("src/images/weapon_particle.png")

        .add("src/images/hazards/poison.png")

        .add("src/images/enemy_attack.png")
        .add("src/images/enemies/roller.png")
        .add("src/images/enemies/roller_b.png")
        .add("src/images/enemies/star.png")
        .add("src/images/enemies/star_b.png")
        .add("src/images/enemies/spider.png")
        .add("src/images/enemies/spider_b.png")
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

        .add("src/images/tools/pickaxe.png")

        .add("src/images/armor/basic.png")

        .add("src/images/other/statue.png")
        .add("src/images/other/statue_knife.png")
        .add("src/images/other/statue_ninja_knife.png")
        .add("src/images/other/statue_sword.png")
        .add("src/images/other/statue_bow.png")

        .add("src/images/other/chest.png")
        .add("src/images/other/chest_opened.png")

        .add("src/images/other/grail.png")
        .add("src/images/other/grail_white.png")
        .add("src/images/other/grail_dark.png")
        .add("src/images/other/grail_gray.png")
        .add("src/images/other/obelisk.png")
        .add("src/images/other/obelisk_used.png")
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
        .load(setup);
}