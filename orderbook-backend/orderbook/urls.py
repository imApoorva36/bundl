from django.urls import path
from . import views

urlpatterns = [
    path('orders/active/', views.get_active_orders, name='get_active_orders'),
    path('orders/', views.submit_order, name='submit_order'),
    path('orders/<str:order_hash>/', views.get_order_by_hash, name='get_order_by_hash'),
    path('orders/<str:order_hash>/cancel/', views.cancel_order, name='cancel_order'),
    path('orders/<str:order_hash>/status/', views.get_order_status, name='get_order_status'),
    path('orders/maker/<str:maker_address>/', views.get_orders_by_maker, name='get_orders_by_maker'),
    path('orderbook/', views.get_orderbook, name='get_orderbook'),
]