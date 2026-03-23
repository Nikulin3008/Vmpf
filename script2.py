def is_prime():
    num_str = input("Введіть число для перевірки на простоту: ")

    if num_str.isdigit():
        num = int(num_str)
        if num < 2:
            print(f"Число {num} не є простим.")
            return

        is_prime_bool = True
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                is_prime_bool = False
                break

        if is_prime_bool:
            print(f"Число {num} — просте.")
        else:
            print(f"Число {num} — складене.")
    else:
        print("Введене значення не є числом.")


is_prime()