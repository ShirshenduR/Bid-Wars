from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Item, Bid
from .serializers import (
    UserRegistrationSerializer, UserSerializer, LoginSerializer,
    ItemSerializer, BidSerializer, BidHistorySerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Only admin users can create items
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Only admin users can create items")
        serializer.save(created_by=self.request.user)


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Only admin users can update/delete items
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not (hasattr(self.request, 'user') and 
                   self.request.user.is_authenticated and 
                   self.request.user.role == 'admin'):
                self.permission_denied(self.request, message="Only admin users can modify items")
        return super().get_permissions()


class BidListCreateView(generics.ListCreateAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        item_id = self.request.query_params.get('item_id')
        if item_id:
            return Bid.objects.filter(item_id=item_id)
        return Bid.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Only player users can place bids
        if self.request.user.role != 'player':
            raise permissions.PermissionDenied("Only player users can place bids")
        serializer.save(user=self.request.user)


class ItemBidHistoryView(generics.ListAPIView):
    serializer_class = BidHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        item_id = self.kwargs['item_id']
        return Bid.objects.filter(item_id=item_id).order_by('-bid_time')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_highest_bid(request, item_id):
    """Get current highest bid for an item"""
    try:
        item = Item.objects.get(id=item_id)
        highest_bid = item.bids.order_by('-bid_amount').first()
        
        if highest_bid:
            data = {
                'current_highest_bid': float(highest_bid.bid_amount),
                'current_highest_bidder': highest_bid.user.username,
                'bid_time': highest_bid.bid_time
            }
        else:
            data = {
                'current_highest_bid': float(item.starting_price),
                'current_highest_bidder': None,
                'bid_time': None
            }
        
        return Response(data)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_items(request):
    """Get all active items for bidding"""
    items = Item.objects.filter(is_active=True)
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_item_status(request, item_id):
    """Toggle item active status (admin only)"""
    if request.user.role != 'admin':
        return Response({'error': 'Only admin users can toggle item status'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        item = Item.objects.get(id=item_id)
        item.is_active = not item.is_active
        item.save()
        
        return Response({
            'message': f'Item {"activated" if item.is_active else "deactivated"} successfully',
            'is_active': item.is_active
        })
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
