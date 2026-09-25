import time

def print_slow(text):
    for char in text:
        print(char, end='', flush=True)
        time.sleep(0.03)
    print()

def show_status(visibility, fatigue, inventory):
    print("\n--- СТАТУС ---")
    print(f"Заметность: {visibility}/100")
    print(f"Усталость: {fatigue}/100")
    print(f"Инвентарь: {', '.join(inventory) if inventory else 'пусто'}")
    print("-------------\n")

def corridor_scene(visibility, fatigue, inventory):
    print_slow("Ты в коридоре. Впереди слышен голос учителя. Слева — спортзал, справа — библиотека.")
    choice = input("Что делаешь? (1: тихо в спортзал | 2: в библиотеку | 3: спрятаться за шкафом): ")
    if choice == "1":
        visibility += 10
        fatigue += 5
        return "sport", visibility, fatigue, inventory
    elif choice == "2":
        visibility += 5
        return "library", visibility, fatigue, inventory
    else:
        visibility -= 20
        return "corridor_hide", visibility, fatigue, inventory

def sport_scene(visibility, fatigue, inventory):
    print_slow("В спортзале темно. Ты видишь ключ на подоконнике.")
    if "ключ" not in inventory:
        take = input("Взять ключ? (да/нет): ")
        if take.lower() == "да":
            inventory.append("ключ")
            print_slow("Ключ у тебя!")
    choice = input("Куда дальше? (1: в коридор | 2: через окно во двор): ")
    if choice == "2" and "ключ" in inventory:
        return "win", visibility, fatigue, inventory
    return "corridor", visibility, fatigue, inventory

def library_scene(visibility, fatigue, inventory):
    print_slow("В библиотеке тихо. Друг шепчет: «Охранник идёт сюда, прячься!»")
    visibility += 20
    choice = input("Где спрятаться? (1: за стеллажом | 2: под столом): ")
    if choice == "1":
        visibility -= 15
    else:
        visibility -= 10
    return "library_safe", visibility, fatigue, inventory

def game_loop():
    visibility = 20
    fatigue = 0
    inventory = []
    current_location = "corridor"

    print_slow("Побег из школы: 2 сезон, 2 серия — Погоня")
    print_slow("Твоя задача — сбежать, не попавшись учителям и охранникам.\n")

    while True:
        show_status(visibility, fatigue, inventory)

        if visibility >= 100:
            print_slow("Тебя заметили! Учитель схватил тебя за рукав… Конец.")
            break
        if fatigue >= 100:
            print_slow("Ты слишком устал, ноги не держат. Тебя поймали. Конец.")
            break

        if current_location == "corridor":
            current_location, visibility, fatigue, inventory = corridor_scene(visibility, fatigue, inventory)
        elif current_location == "sport":
            current_location, visibility, fatigue, inventory = sport_scene(visibility, fatigue, inventory)
        elif current_location == "library":
            current_location, visibility, fatigue, inventory = library_scene(visibility, fatigue, inventory)
        elif current_location == "win":
            print_slow("Ты открыл запасной выход ключом и выбежал на улицу! Свобода! Победа!")
            break
        elif current_location == "corridor_hide":
            print_slow("Ты затаился за шкафом. Учитель прошёл мимо, не заметив тебя.")
            current_location = "corridor"
        elif current_location == "library_safe":
            print_slow("Охранник прошёл мимо. Ты можешь двигаться дальше.")
            choice = input("Куда теперь? (1: коридор | 2: столовая): ")
            if choice == "1":
                current_location = "corridor"
            else:
                current_location = "canteen"

game_loop()
