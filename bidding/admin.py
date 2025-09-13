from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Item, Bid


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'date_joined')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'starting_price', 'current_highest_bid', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active', 'created_at', 'created_by')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('item', 'user', 'bid_amount', 'bid_time')
    list_filter = ('bid_time', 'item', 'user')
    readonly_fields = ('bid_time',)
    ordering = ('-bid_time',)
