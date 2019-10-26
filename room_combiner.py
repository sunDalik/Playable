import os

filesNumber = len([name for name in os.listdir("rooms") if os.path.isfile("rooms/" + name)])
roomsCombined = "const rooms = JSON.parse('["

for index, file in enumerate(os.listdir("rooms")):
    with open("rooms/" + file, "r") as f:
        roomsCombined += f.read()
    if index != filesNumber - 1:
        roomsCombined += ","

roomsCombined += "]');"

with open("src/js/rooms.js", "w") as f:
    f.write(roomsCombined)
