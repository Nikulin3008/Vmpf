class Calculator:
    # Клас з методами для арифметичних операцій
    def add(self, x, y):
        return x + y

    def subtract(self, x, y):
        return x - y

    def multiply(self, x, y):
        return x * y

    def divide(self, x, y):
        if y == 0:
            return "Помилка: ділення на нуль!"
        return x / y

# Використання класу
calc = Calculator()
a, b = 15, 3
print(f"Результати для чисел {a} та {b}:")
print(f"Додавання: {calc.add(a, b)}")
print(f"Ділення: {calc.divide(a, b)}")
print(f"Віднімання: {calc.subtract(a, b)}")
print(f"Множення: {calc.multiply(a, b)}")