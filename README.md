# FitianElMazbahFantasyFrontEnd

A comprehensive Fantasy Football web application built with Angular 20.3.3, featuring user team management and complete administrative functionality.

## 🚀 Features

### User Features
- **Authentication System**: Secure login/register with JWT tokens
- **Fantasy Team Management**: Create and manage fantasy teams with 4-player composition
- **Player Selection**: Browse and select players from real football teams
- **Dashboard**: Fantasy-focused dashboard showing team status, points, and deadlines
- **Team Locking**: Automatic team locking system based on matchweek deadlines

### Admin Features  
- **Admin Dashboard**: System statistics and management overview
- **Player Management**: Full CRUD operations for football players
- **Team Management**: Manage real football teams with logo support
- **User Management**: Oversee user accounts and fantasy teams
- **Matchweek Management**: Create and manage fantasy football seasons

## 🛠️ Technology Stack

- **Frontend**: Angular 20.3.3 with standalone components
- **Architecture**: Zoneless, Server-Side Rendering (SSR) enabled
- **Styling**: SCSS with modern responsive design
- **State Management**: Angular Signals for reactive UI
- **Authentication**: JWT-based with role-based access control
- **Forms**: Reactive Forms with comprehensive validation

## 📋 Prerequisites

- Node.js 18+ 
- Angular CLI 20.3.3
- Git

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/kirolosadel02/FitianElMazbahFantasyFrontEnd.git

# Navigate to project directory
cd FitianElMazbahFantasyFrontEnd

# Install dependencies
npm install
```

### Development Server

```bash
# Start development server
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Build

```bash
# Production build
npm run build
# or
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Testing

```bash
# Run unit tests
npm test
# or
ng test

# Run linting
npm run lint
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                 # Core functionality
│   │   ├── guards/          # Route guards (auth, admin)
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # Business logic services
│   ├── features/            # Feature modules
│   │   ├── admin/           # Admin management system
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # User dashboard
│   │   ├── players/         # Player browsing
│   │   └── team/            # Fantasy team management
│   └── shared/              # Shared components
│       └── components/      # Reusable UI components
└── environments/            # Environment configurations
```

## 🔐 Authentication & Authorization

The application implements role-based access control:

- **User Role**: Access to fantasy team management, player browsing, dashboard
- **Admin Role**: Full system administration capabilities + user features

### API Integration

Configure your backend API URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5057/api', // Your backend API URL
};
```

## 🎯 Key Components

### User System
- **Dashboard**: Fantasy-focused with team status and quick actions
- **My Team**: Team creation and player management
- **Player List**: Browse available players for team selection

### Admin System  
- **Admin Dashboard**: System statistics and management links
- **Player Management**: CRUD operations for football players
- **Team Management**: Manage real football teams
- **User Management**: Oversee user accounts and teams

## 🌐 API Endpoints

The frontend integrates with the following API endpoints:

- `POST /Users/login` - User authentication
- `POST /Users/register` - User registration
- `GET /Players` - Fetch players with pagination
- `POST /Players` - Create new player (Admin)
- `GET /Teams` - Fetch football teams
- `POST /Teams` - Create new team (Admin)
- `GET /UserTeams` - Fetch user's fantasy team
- `POST /UserTeams` - Create/update fantasy team

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Backend Repository

This frontend works with the Fantasy Football backend API. Make sure to set up the backend server and configure the API URL in the environment files.

## 📞 Support

For support, email your-email@domain.com or create an issue in this repository.
