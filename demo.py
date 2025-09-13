#!/usr/bin/env python
"""
Demo script to showcase the Bid Wars application functionality
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bidwars.settings')
django.setup()

from bidding.models import User, Item, Bid
from decimal import Decimal

def run_demo():
    print("🎯 Bid Wars Demo")
    print("=" * 50)
    
    # Create demo users if they don't exist
    admin_user, created = User.objects.get_or_create(
        username='demo_admin',
        defaults={
            'email': 'admin@bidwars.com',
            'role': 'admin',
            'is_staff': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Created demo admin user: demo_admin / admin123")
    
    player1, created = User.objects.get_or_create(
        username='bidder1',
        defaults={
            'email': 'bidder1@bidwars.com',
            'role': 'player'
        }
    )
    if created:
        player1.set_password('player123')
        player1.save()
        print("✅ Created demo player: bidder1 / player123")
    
    player2, created = User.objects.get_or_create(
        username='bidder2',
        defaults={
            'email': 'bidder2@bidwars.com',
            'role': 'player'
        }
    )
    if created:
        player2.set_password('player123')
        player2.save()
        print("✅ Created demo player: bidder2 / player123")
    
    # Create demo items
    item1, created = Item.objects.get_or_create(
        title='Vintage Guitar',
        defaults={
            'description': 'A beautiful 1960s Fender Stratocaster in excellent condition.',
            'starting_price': Decimal('500.00'),
            'created_by': admin_user,
            'is_active': True
        }
    )
    if created:
        print("✅ Created item: Vintage Guitar")
    
    item2, created = Item.objects.get_or_create(
        title='Rare Painting',
        defaults={
            'description': 'An original oil painting from a famous local artist.',
            'starting_price': Decimal('200.00'),
            'created_by': admin_user,
            'is_active': True
        }
    )
    if created:
        print("✅ Created item: Rare Painting")
    
    # Create demo bids
    bids_data = [
        (item1, player1, Decimal('550.00')),
        (item1, player2, Decimal('600.00')),
        (item1, player1, Decimal('650.00')),
        (item2, player2, Decimal('250.00')),
        (item2, player1, Decimal('300.00')),
    ]
    
    for item, user, amount in bids_data:
        bid, created = Bid.objects.get_or_create(
            item=item,
            user=user,
            bid_amount=amount,
            defaults={}
        )
        if created:
            print(f"✅ {user.username} bid ${amount} on {item.title}")
    
    print("\n🏆 Current Auction Status:")
    print("-" * 30)
    
    for item in Item.objects.filter(is_active=True):
        highest_bid = item.current_highest_bid
        highest_bidder = item.current_highest_bidder
        print(f"📦 {item.title}")
        print(f"   Starting Price: ${item.starting_price}")
        print(f"   Current Highest: ${highest_bid}")
        print(f"   Top Bidder: {highest_bidder.username if highest_bidder else 'None'}")
        print(f"   Total Bids: {item.bids.count()}")
        print()
    
    print("🚀 Demo complete! You can now:")
    print("1. Start the Django server: python manage.py runserver")
    print("2. Start the React app: cd frontend && npm start")
    print("3. Login with any of the demo accounts:")
    print("   - Admin: demo_admin / admin123")
    print("   - Player: bidder1 / player123")
    print("   - Player: bidder2 / player123")

if __name__ == '__main__':
    run_demo()