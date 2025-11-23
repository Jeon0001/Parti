# Parti

A real-time gaming party matching platform where users can create and join gaming parties, chat with voice and text, and find like-minded players.

## Features

- 🔐 User authentication (email/password and Google OAuth)
- 🎮 Create and browse gaming parties
- 💬 Real-time voice and text chat
- 👥 Member tracking in chat rooms
- 🎯 Custom party names and chatroom IDs
- ⏰ Flexible scheduling (specific time or "Any Time")

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Parti
```

### 2. Install Dependencies

The project has two separate package.json files that need dependencies installed:

#### Install Server Dependencies

```bash
cd login
npm install
```

#### Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `login` directory with the following variables:

```env
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
SESSION_SECRET=your_random_session_secret_here
```

#### Setting up Google OAuth (Optional)

If you want to use Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy your Client ID and Client Secret to the `.env` file

**Note:** If you don't set up Google OAuth, you can still use the app with email/password registration and login.

### 4. Start the Development Servers

You need to run two servers simultaneously:

#### Terminal 1 - Start the Backend Server

```bash
cd login
node server.js
```

The server should start on `http://localhost:3000`

#### Terminal 2 - Start the Frontend Development Server

```bash
cd login/client
npm run dev
```

The frontend should start on `http://localhost:5173` (or another port if 5173 is taken)

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## Usage Guide

### Creating an Account

1. Click "Sign Up" on the login page
2. Enter your username, email, and password
3. You'll be redirected to the dashboard after registration

### Creating a Parti

1. Navigate to "Create Parti" from the dashboard
2. **Step 1**: Select a game
3. **Step 2**: Choose languages
4. **Step 3**: Add tags
5. **Step 4**: Choose date & time (or select "Any Time")
6. **Step 5**: Review and finalize your parti

### Joining a Parti Chat

1. Go to "My Partis" or "All Partis"
2. Click on any parti card
3. You'll automatically join the chatroom
4. Use voice and text chat to communicate with other members

### Customizing Your Parti

1. Go to "My Partis"
2. Click "Edit" on any parti you created
3. Change the chatroom ID (must be unique)
4. Set a custom visible name (optional)
5. Click "Save"

## Project Structure

```
Parti/
├── login/
│   ├── server.js          # Express backend server
│   ├── package.json       # Server dependencies
│   ├── .env              # Environment variables (create this)
│   ├── views/            # EJS templates (legacy)
│   └── client/           # React frontend
│       ├── src/
│       │   ├── App.jsx   # Main app component with routing
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── chat/     # Chat components
│       │   ├── create/   # Parti creation flow
│       │   └── find/     # Browse partis
│       ├── package.json  # Client dependencies
│       └── vite.config.js
└── README.md
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

- **Backend**: Change `PORT` in `.env` file
- **Frontend**: Vite will automatically use the next available port

### Socket Connection Issues

If you see many connection/disconnection messages:

- This is normal during development with hot reloading
- Make sure both servers are running
- Check that CORS is properly configured

### Google Login Not Working

- Verify your `.env` file has correct Google OAuth credentials
- Check that the callback URL matches exactly in Google Cloud Console
- Ensure the Google+ API is enabled

### Dependencies Installation Issues

If you encounter errors during `npm install`:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Notes

- The server uses in-memory storage (data resets on server restart)
- Socket.IO handles real-time communication
- WebRTC is used for voice chat
- React Router handles client-side routing

## Technologies Used

- **Frontend**: React, Vite, React Router, Socket.IO Client
- **Backend**: Express, Socket.IO, Passport.js
- **Real-time**: WebRTC, Socket.IO
- **Styling**: CSS with custom greenish gradient theme

## License

ISC
