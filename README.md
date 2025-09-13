# Bid Wars - Web-based Auction System

A complete web-based bidding/auction application built with Django (backend) and React (frontend).

## Features

### Backend (Django)
- JWT-based authentication system
- Role-based access control (Admin/Player)
- RESTful API with Django REST Framework
- SQLite database
- Real-time bid validation
- Complete CRUD operations for items and bids

### Frontend (React)
- Modern UI with Tailwind CSS
- TypeScript for type safety
- Role-based navigation and views
- Real-time updates via polling (every 3 seconds)
- Responsive design
- Authentication with JWT tokens

### User Roles

#### Admin Users
- Create and manage auction items
- Set starting prices and descriptions
- Activate/deactivate auctions
- View all bids and winners
- Access to admin dashboard

#### Player Users
- View active auctions
- Place bids on items
- View bid history
- See real-time updates on current highest bids
- Access to bidding interface

## Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/d576d291-caf9-4ed6-a76e-4e21266d1f52)

### Registration Page
![Registration Page](https://github.com/user-attachments/assets/3f716a46-adb5-4c88-bbdd-63b19c17ec7f)

### Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/77301d39-3468-442d-9d40-fc94f24acd86)

### Create Item Form
![Create Item Form](https://github.com/user-attachments/assets/557cf035-fe0b-427d-b975-48ea95e5acd9)

### Admin Dashboard with Item
![Admin Dashboard with Item](https://github.com/user-attachments/assets/2f85e6e8-8693-44b3-a951-e61908b91a38)

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup (Django)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bid-Wars
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (admin)**
   ```bash
   python manage.py createsuperuser
   # Follow prompts to create admin user
   ```

6. **Start Django development server**
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://localhost:8000/`

### Frontend Setup (React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start React development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000/`

### Default Users

After running migrations, you can create users via the registration page or Django admin:

- **Admin User**: Use Django's `createsuperuser` command or register with role "Admin"
- **Player Users**: Register through the web interface with role "Player"

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile

### Items
- `GET /api/items/` - List all items
- `POST /api/items/` - Create new item (admin only)
- `GET /api/items/{id}/` - Get item details
- `PUT /api/items/{id}/` - Update item (admin only)
- `DELETE /api/items/{id}/` - Delete item (admin only)
- `GET /api/items/active/` - List active items
- `POST /api/items/{id}/toggle-status/` - Toggle item status (admin only)
- `GET /api/items/{id}/highest-bid/` - Get current highest bid
- `GET /api/items/{id}/bids/` - Get bid history for item

### Bids
- `GET /api/bids/` - List user's bids
- `POST /api/bids/` - Place new bid (players only)
- `GET /api/bids/?item_id={id}` - Get bids for specific item

## Technology Stack

### Backend
- **Framework**: Django 5.2.6
- **API**: Django REST Framework 3.16.1
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (easily configurable for PostgreSQL/MySQL)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 3.3.0
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Build Tool**: Create React App

## Development Features

### Real-time Updates
- Frontend polls the backend every 3 seconds for live bid updates
- Automatic refresh of item status and bid information
- Real-time winner announcement when auctions end

### Security
- JWT token-based authentication
- Role-based access control
- CORS configuration for cross-origin requests
- Input validation and sanitization
- SQL injection protection via Django ORM

### Data Validation
- Bid amount validation (must be higher than current highest)
- Item status validation (can't bid on inactive items)
- User role validation (only admins can create items, only players can bid)
- Form validation on both frontend and backend

## Usage Examples

### Creating an Auction (Admin)
1. Login with admin credentials
2. Navigate to Admin Dashboard
3. Click "Create New Item"
4. Fill in item details and starting price
5. Submit to create active auction

### Placing Bids (Player)
1. Login with player credentials
2. View active auctions on the bidding page
3. Enter bid amount (must be higher than current highest)
4. Submit bid
5. See real-time updates of new bids

### Managing Auctions (Admin)
1. View all items in admin dashboard
2. See current highest bids and bidder information
3. Activate/deactivate auctions
4. View detailed bid history
5. Declare winners when auctions end

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use environment variables for sensitive settings
2. **Database**: Switch to PostgreSQL or MySQL for production
3. **Static Files**: Configure static file serving (Django + Nginx)
4. **Security**: Update SECRET_KEY, set DEBUG=False, configure ALLOWED_HOSTS
5. **HTTPS**: Use SSL certificates for secure connections
6. **WebSockets**: Consider implementing WebSockets for true real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.