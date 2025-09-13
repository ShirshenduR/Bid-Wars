from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Item, Bid


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class ItemSerializer(serializers.ModelSerializer):
    current_highest_bid = serializers.ReadOnlyField()
    current_highest_bidder = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(read_only=True)
    bid_count = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ('id', 'title', 'description', 'starting_price', 'created_at', 
                 'is_active', 'created_by', 'current_highest_bid', 
                 'current_highest_bidder', 'bid_count')
        read_only_fields = ('created_at', 'created_by')

    def get_current_highest_bidder(self, obj):
        bidder = obj.current_highest_bidder
        return bidder.username if bidder else None

    def get_bid_count(self, obj):
        return obj.bids.count()


class BidSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    item_title = serializers.CharField(source='item.title', read_only=True)

    class Meta:
        model = Bid
        fields = ('id', 'item', 'user', 'bid_amount', 'bid_time', 'item_title')
        read_only_fields = ('user', 'bid_time')

    def validate_bid_amount(self, value):
        item = self.initial_data.get('item')
        if item:
            try:
                item_obj = Item.objects.get(id=item)
                if not item_obj.is_active:
                    raise serializers.ValidationError("Cannot bid on inactive items")
                
                current_highest = item_obj.current_highest_bid
                if value <= current_highest:
                    raise serializers.ValidationError(
                        f"Bid must be higher than current highest bid of ${current_highest}"
                    )
            except Item.DoesNotExist:
                raise serializers.ValidationError("Invalid item")
        
        return value


class BidHistorySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Bid
        fields = ('id', 'user', 'bid_amount', 'bid_time')