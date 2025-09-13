from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('player', 'Player'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='player')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Item(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    starting_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    max_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)], null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_items')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def current_highest_bid(self):
        """Get the current highest bid for this item"""
        highest_bid = self.bids.order_by('-bid_amount').first()
        return highest_bid.bid_amount if highest_bid else self.starting_price

    @property
    def current_highest_bidder(self):
        """Get the current highest bidder for this item"""
        highest_bid = self.bids.order_by('-bid_amount').first()
        return highest_bid.user if highest_bid else None


class Bid(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='bids')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    bid_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    bid_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-bid_time']
        unique_together = ['item', 'user', 'bid_amount']  # Prevent duplicate bids

    def __str__(self):
        return f"{self.user.username} bid ₹{self.bid_amount} on {self.item.title}"

    def clean(self):
        """Validate that bid is within valid range"""
        if not self.item.is_active:
            raise ValidationError("Cannot bid on inactive items")
        
        current_highest = self.item.current_highest_bid
        max_amt = self.item.max_amount if self.item.max_amount else None
        
        if self.bid_amount <= current_highest:
            raise ValidationError(f"Bid must be higher than current highest bid of ₹{current_highest}")
        if max_amt and self.bid_amount > max_amt:
            raise ValidationError(f"Bid cannot exceed max amount ₹{max_amt}")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
