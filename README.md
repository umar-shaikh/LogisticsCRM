# Logistics CRM

A full-featured **Logistics Customer Relationship Management** system built with **Laravel** (backend), **Angular 18** (frontend), and **MySQL** (database). Designed for logistics companies to manage shipments, customers, drivers, fleet, routes, and invoicing.

## Features

### Core Modules
| Module | Features |
|--------|----------|
| **Dashboard** | KPI cards, revenue charts, shipment status donut chart, recent shipments, top customers |
| **Shipments** | Full CRUD, status workflow (Pending > Confirmed > Picked Up > In Transit > Out for Delivery > Delivered), tracking history, assignment to driver/vehicle/route |
| **Customers** | Full CRUD, customer types (Individual, Corporate, E-commerce, Manufacturer), shipment count |
| **Drivers** | Full CRUD, license management, availability tracking, experience levels |
| **Vehicles** | Full CRUD, fleet management, driver assignment, maintenance tracking |
| **Routes** | Full CRUD, distance and duration, waypoints, route types (Local, Interstate, International) |
| **Invoices** | Auto-generation from shipments, payment tracking, status workflow (Draft > Sent > Paid/Overdue) |
| **Settings** | Profile management, password change, company settings |

### Key Features
- **Real-time shipment tracking** with progress visualizer
- **Interactive charts** (revenue bars, status donut)
- **Status workflows** with visual progress tracking
- **Responsive dark theme UI** - works on desktop, tablet, and mobile
- **Role-based access** (Super Admin, Admin, Manager, Staff)
- **Laravel Sanctum** authentication with Bearer tokens

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, TypeScript, Standalone Components |
| Backend | Laravel 11, PHP 8.3 |
| Database | MySQL 8.0 |
| Auth | Laravel Sanctum |
| API | RESTful JSON API |
| Styling | Custom CSS with CSS Variables (Dark Theme) |

## Project Structure

```
logistics-crm/
|
|-- angular-frontend/              # Angular Frontend
|   |-- src/
|   |   |-- app/
|   |   |   |-- components/        # Layout, Sidebar, Topbar
|   |   |   |-- pages/             # All page components
|   |   |   |   |-- dashboard/     # Dashboard with charts
|   |   |   |   |-- shipments/     # Shipment list + detail
|   |   |   |   |-- customers/     # Customer management
|   |   |   |   |-- drivers/       # Driver cards
|   |   |   |   |-- vehicles/      # Fleet cards
|   |   |   |   |-- routes/        # Route management
|   |   |   |   |-- invoices/      # Billing & invoicing
|   |   |   |   |-- settings/      # Account settings
|   |   |   |   |-- login/         # Login page
|   |   |   |-- models/            # TypeScript interfaces
|   |   |   |-- services/          # API & Auth services
|   |   |   |-- guards/            # Auth guard
|   |   |   |-- styles/            # Theme CSS
|   |   |   |-- app.component.ts
|   |   |   |-- app.config.ts
|   |   |   |-- app.routes.ts
|   |   |-- index.html
|   |   |-- styles.css
|   |-- angular.json
|   |-- package.json
|   |-- tsconfig.json
|
|-- laravel-backend/               # Laravel Backend
|   |-- app/
|   |   |-- Http/
|   |   |   |-- Controllers/
|   |   |   |   |-- Api/           # All API controllers
|   |   |   |-- Middleware/
|   |   |-- Models/                # Eloquent models
|   |-- database/
|   |   |-- migrations/            # All table migrations
|   |-- routes/
|   |   |-- api.php                # API route definitions
|   |-- config/
|   |   |-- cors.php               # CORS configuration
|
|-- README.md
```

## Prerequisites

- PHP 8.2+ with extensions: `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`
- Composer
- MySQL 8.0+
- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`

## Setup Instructions

### 1. Laravel Backend Setup

```bash
# Create new Laravel project
composer create-project laravel/laravel laravel-backend
cd laravel-backend

# Install Sanctum for API authentication
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Copy the files from this project into your Laravel project:
# - app/Models/* -> app/Models/
# - app/Http/Controllers/Api/* -> app/Http/Controllers/Api/
# - database/migrations/001_create_all_tables.php -> database/migrations/
# - routes/api.php -> routes/
# - config/cors.php -> config/

# Setup environment
cp .env.example .env
# Edit .env and set your database credentials:
# DB_DATABASE=logistics_crm
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Start Laravel server
php artisan serve
```

### 2. Angular Frontend Setup

```bash
cd angular-frontend

# Install dependencies
npm install

# Update API URL in src/app/services/api.service.ts
# Change: private baseUrl = 'http://localhost:8000/api'
# To match your Laravel URL

# Start Angular development server
ng serve
```

The Angular app will be available at `http://localhost:4200`

```



## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/shipment-status-chart` | Status distribution |
| GET | `/api/dashboard/monthly-revenue-chart` | Revenue chart data |
| GET | `/api/dashboard/top-customers` | Top 5 customers |

### Shipments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipments` | List shipments (paginated) |
| POST | `/api/shipments` | Create shipment |
| GET | `/api/shipments/{id}` | Get shipment detail |
| PUT | `/api/shipments/{id}` | Update shipment |
| DELETE | `/api/shipments/{id}` | Delete shipment |
| POST | `/api/shipments/{id}/events` | Add tracking event |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers/{id}` | Get customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | List drivers |
| POST | `/api/drivers` | Create driver |
| PUT | `/api/drivers/{id}` | Update driver |
| DELETE | `/api/drivers/{id}` | Delete driver |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List vehicles |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/{id}` | Update vehicle |
| DELETE | `/api/vehicles/{id}` | Delete vehicle |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | List routes |
| POST | `/api/routes` | Create route |
| PUT | `/api/routes/{id}` | Update route |
| DELETE | `/api/routes/{id}` | Delete route |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| POST | `/api/invoices/generate/{shipmentId}` | Auto-generate from shipment |
| POST | `/api/invoices/{id}/mark-paid` | Mark as paid |

## Database Schema

### Tables
- `users` - Admin/staff accounts
- `customers` - Client companies
- `drivers` - Driver profiles
- `vehicles` - Fleet vehicles
- `routes` - Delivery routes
- `shipments` - Shipment records with full lifecycle
- `shipment_events` - Tracking events
- `invoices` - Billing records
- `expenses` - Expense tracking
- `notifications` - User notifications
- `settings` - System settings

## Build for Production

### Angular
```bash
cd angular-frontend
ng build --configuration production
# Output in dist/logistics-crm/
```

### Laravel
```bash
cd laravel-backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Free Deployment

### Backend (Laravel)
- **000webhost**: Upload Laravel files, create MySQL database
- **InfinityFree**: Free PHP hosting with MySQL
- **Render**: Free tier for web services

### Frontend (Angular)
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/logistics-crm/` folder
- **Firebase Hosting**: `firebase deploy`

## Environment Variables

### Laravel (.env)
```env
APP_NAME="Logistics CRM"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logistics_crm
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:4200
SESSION_DOMAIN=localhost
```

### Angular (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## Screenshots

The UI features:
- **Dark theme** with indigo/violet accent colors
- **Card-based layout** with subtle borders and hover effects
- **Interactive charts** (bar charts for revenue, donut chart for status)
- **Visual shipment progress** with step indicators
- **Responsive sidebar** navigation
- **Modals** for creating/editing records
- **Status badges** with color coding
- **Timeline view** for shipment tracking history

## License

Open source - free to use and modify.
