from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='Назва категорії')

    def __str__(self):
        return self.name

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('дебет', 'Дебет'),
        ('кредит', 'Кредит'),
    )

    description = models.CharField(max_length=255, verbose_name='Опис')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES, verbose_name='Тип')
    
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категорія', null=True)

    def __str__(self):
        return f"{self.description} | {self.amount} грн ({self.transaction_type})"