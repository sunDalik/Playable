import os

def compileDirectoryIntoVariable(directory, variable):
    files_number = len([name for name in os.listdir(directory) if os.path.isfile(directory + name)])
    rooms_combined = "export const " + variable + " = JSON.parse('["

    for index, file in enumerate(os.listdir(directory)):
        with open(directory + file, "r") as f:
            rooms_combined += f.read()
        if index != files_number - 1:
            rooms_combined += ","
    rooms_combined += "]');\n"
    return rooms_combined

open("src/js/rooms.js", "w").close()
with open("src/js/rooms.js", "a+") as f:
    f.write(compileDirectoryIntoVariable("rooms/FC/normal_rooms/", "FCNormalRooms"))
    f.write(compileDirectoryIntoVariable("rooms/FC/statue_rooms/", "FCStatueRooms"))
    f.write(compileDirectoryIntoVariable("rooms/FC/obelisk_rooms/", "FCObeliskRooms"))
    f.write(compileDirectoryIntoVariable("rooms/FC/chest_rooms/", "FCChestRooms"))
    f.write(compileDirectoryIntoVariable("rooms/FC/boss_rooms/", "FCBossRooms"))

    f.write(compileDirectoryIntoVariable("rooms/DT/normal_rooms/", "DTNormalRooms"))
    f.write(compileDirectoryIntoVariable("rooms/DT/statue_rooms/", "DTStatueRooms"))
    f.write(compileDirectoryIntoVariable("rooms/DT/obelisk_rooms/", "DTObeliskRooms"))
    f.write(compileDirectoryIntoVariable("rooms/DT/chest_rooms/", "DTChestRooms"))
    f.write(compileDirectoryIntoVariable("rooms/DT/boss_rooms/", "DTBossRooms"))
