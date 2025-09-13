from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Item URLs
    path('items/', views.ItemListCreateView.as_view(), name='item-list-create'),
    path('items/<int:pk>/', views.ItemDetailView.as_view(), name='item-detail'),
    path('items/active/', views.get_active_items, name='active-items'),
    path('items/<int:item_id>/toggle-status/', views.toggle_item_status, name='toggle-item-status'),
    path('items/<int:item_id>/highest-bid/', views.get_current_highest_bid, name='current-highest-bid'),
    path('items/<int:item_id>/bids/', views.ItemBidHistoryView.as_view(), name='item-bid-history'),
    
    # Bid URLs
    path('bids/', views.BidListCreateView.as_view(), name='bid-list-create'),
]