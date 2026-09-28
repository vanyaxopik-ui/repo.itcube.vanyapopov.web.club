from game import GameState

def print_state(state: GameState):
    print(f"\n--- Параметры ---")
    print(f"Усталость: {state.fatigue}/100")
    print(f"Голод: {state.hunger}/100")
    print(f"Внимание: {state.attention}/100\n")

def main():
    state = GameState()
    while True:
        print_state(state)
        event = state.get_current_event()
        if not event:
            print("Ошибка: событие не найдено.")
            break

        print(event["text"])

        if not event.get("choices"):
            print("\nИгра окончена.")
            break

        for i, c in enumerate(event["choices"], 1):
            print(f"{i}. {c['text']}")

        try:
            choice = int(input("\nТвой выбор (цифра): ")) - 1
            if not state.apply_choice(choice):
                print("Неверный выбор, попробуй снова.")
                continue
        except ValueError:
            print("Вводи цифру.")
            continue

        if state.is_end():
            print("\nИгра окончена.")
            break

if __name__ == "__main__":
    main()
