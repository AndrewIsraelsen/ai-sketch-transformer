# 🎨 AI Sketch Studio Pro

A professional AI-powered collaborative drawing studio with real-time collaboration, advanced effects, and project sharing.

## ✨ Features

### 🛠 Drawing Tools
- Brush, Eraser, Rectangle, Circle, Line
- Text tool with custom fonts
- Fill bucket for flooding colors
- Eyedropper for color picking

### 📚 Advanced Layers System
- Multiple layers support
- Layer visibility toggle
- Opacity control per layer
- Drag and drop reordering

### 🎨 12 AI-Powered Effects
- Pixelate
- Mirror
- Color Invert
- Kaleidoscope
- Edge Detection
- Neon Glow
- Wave Distortion
- Oil Paint
- Emboss
- Mosaic
- Motion Blur
- Chromatic Aberration

### 🎬 Animation Timeline
- Frame-by-frame animation
- Playback with adjustable FPS
- Export to GIF (coming soon)

### 👥 Real-Time Collaboration
- WebSocket-based real-time drawing
- See other users' cursors
- Live user count
- Synchronized layer updates

### 🔐 Authentication & Security
- JWT-based authentication
- Secure password hashing with bcrypt
- Rate limiting
- Helmet security headers

### 🔗 Sharing & Collaboration
- Share projects via unique links
- Share with specific users (view/edit permissions)
- Public/private project settings
- Collaborative editing

### 💾 Project Management
- Save/load projects
- Export to PNG, SVG
- Cloud storage with MongoDB
- Project thumbnails

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-sketch-studio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:3000
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the server:
```bash
npm run dev
```

7. Open your browser and navigate to:
```
http://localhost:5000/auth.html
```

## 🚀 Deploy to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AndrewIsraelsen/ai-sketch-transformer)

**Required Environment Variables:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `CLIENT_URL` - Your Vercel app URL
- `NODE_ENV` - Set to `production`

## 📁 Project Structure

```
ai-sketch-studio/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model
│   │   └── Project.js       # Project model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── projects.js      # Project CRUD routes
│   │   └── share.js         # Sharing routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   └── server.js            # Express server & WebSocket setup
├── frontend/
│   ├── index.html           # Main drawing app
│   ├── auth.html            # Login/Register page
│   └── collaboration.js     # WebSocket client logic
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get user's projects
- `GET /api/projects/shared` - Get shared projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sharing
- `POST /api/share/generate-link/:projectId` - Generate share link
- `GET /api/share/link/:shareToken` - Access via share link
- `POST /api/share/user/:projectId` - Share with specific user
- `PATCH /api/share/permission/:projectId/:userId` - Update permissions
- `DELETE /api/share/remove/:projectId/:userId` - Remove user access
- `DELETE /api/share/revoke-link/:projectId` - Revoke share link

## 🌐 WebSocket Events

### Client → Server
- `join-project` - Join a project room
- `draw` - Drawing action
- `layer-update` - Layer modification
- `tool-change` - Tool selection
- `clear-canvas` - Clear canvas
- `apply-effect` - Apply AI effect
- `cursor-move` - Cursor position

### Server → Client
- `user-joined` - User joined room
- `user-left` - User left room
- `room-users` - Current user count
- `draw` - Remote drawing
- `layer-update` - Remote layer update
- `tool-change` - Remote tool change
- `clear-canvas` - Remote canvas clear
- `apply-effect` - Remote effect application
- `cursor-move` - Remote cursor movement

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP security headers with Helmet
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation with express-validator

## 🔧 Technologies Used

### Backend
- Express.js - Web framework
- Socket.io - Real-time communication
- MongoDB & Mongoose - Database
- JWT - Authentication
- bcryptjs - Password hashing
- Helmet - Security headers
- express-rate-limit - Rate limiting

### Frontend
- HTML5 Canvas API
- Socket.io Client
- Vanilla JavaScript
- CSS3 with Flexbox/Grid

## 📝 License

MIT

## 👨‍💻 Author

Andrew Earl Israelsen

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🙏 Acknowledgments

- AI effects algorithms inspired by classic image processing techniques
- Real-time collaboration patterns from collaborative editing tools
