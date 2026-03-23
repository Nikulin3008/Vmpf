class Library:
    def __init__(self):
        # Початковий порожній список книг
        self.books = []

    def add_book(self, book_title):
        self.books.append(book_title)
        print(f"Книга '{book_title}' додана до бібліотеки.")

    def remove_book(self, book_title):
        if book_title in self.books:
            self.books.remove(book_title)
            print(f"Книга '{book_title}' видалена.")
        else:
            print(f"Книгу '{book_title}' не знайдено.")

    def display_all_books(self):
        if not self.books:
            print("Бібліотека порожня.")
        else:
            print("Список усіх книг у бібліотеці:")
            for index, book in enumerate(self.books, 1):
                print(f"{index}. {book}")

# Демонстрація роботи
my_library = Library()
my_library.add_book("Кобзар")
my_library.add_book("Тіні забутих предків")
my_library.display_all_books()
my_library.remove_book("Кобзар")
my_library.display_all_books()