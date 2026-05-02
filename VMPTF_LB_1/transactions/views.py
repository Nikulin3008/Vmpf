from django.shortcuts import render
from django.db.models import Sum
from .models import Transaction, Category

def index(request):
    transactions = Transaction.objects.all()
    categories = Category.objects.all()

    
    search_query = request.GET.get('search')
    if search_query:
        transactions = transactions.filter(description__icontains=search_query)

    
    category_id = request.GET.get('category')
    if category_id:
        transactions = transactions.filter(category_id=category_id)

    

    #4
    income = Transaction.objects.filter(transaction_type='дебет').aggregate(Sum('amount'))['amount__sum'] or 0
    expenses = Transaction.objects.filter(transaction_type='кредит').aggregate(Sum('amount'))['amount__sum'] or 0
    balance = income - expenses

    return render(request, 'transactions/index.html', {
        'transactions': transactions,
        'categories': categories,
        'balance': balance
    })