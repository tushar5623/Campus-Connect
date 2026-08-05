# Campus Connect

> A modern, production-grade 1-on-1 real-time text and WebRTC video networking platform built for verified college students.

---

## Project Overview

**Campus Connect** is a private college networking application that enables verified students to connect one-to-one with peers across campus in real time.

### The Problem It Solves
Campus environments can feel fragmented, making it difficult for students to meet new peers outside their immediate classrooms, departments, or dorms. Existing public chat platforms lack institutional verification, safety controls, and real-time pairing designed for academic and campus communities.

### Objective & Target Audience
Campus Connect provides a safe, anonymous, and verified environment exclusively for college students. Students log in using their official college email credentials and can instantly enter 1-on-1 text chats or peer-to-peer WebRTC video rooms to collaborate, discuss academic goals, and build meaningful campus connections.

---

## Key Features

- **Verified Student Authentication**: OAuth authentication powered by Firebase Google Auth, restricting access to verified college email domains (`@kiet.edu`).
- **1-on-1 Anonymous Text Matching**: Real-time matchmaking queue pairing online students for text chat sessions.
- **Peer-to-Peer WebRTC Video Calls**: High-quality video and audio call pairing using WebRTC STUN signaling relay with ICE candidate queuing.
- **Media Controls**: Interactive microphone mute/unmute and camera enable/disable toggles with fallback UI indicators.
- **Real-Time Typing Indicators**: Visual 3-dot pulse indicators emitted via Socket.IO when a partner is typing.
- **Automated 3-Report Safety System**: Community moderation mechanism where receiving 3 verified reports results in an automated, permanent account suspension.
- **Live Campus Lounge Counter**: Real-time count of active online users broadcasted to all connected clients.
- **Modern SaaS Aesthetics**: Minimalist design philosophy with smooth glassmorphism, dynamic Indigo/Cyan color accents, light neutral background (`#F8FAFC`), dark slate mode (`#0F172A`), and geometric typography (**Plus Jakarta Sans**).
- **Cross-Platform Mobile Support**: Native Android integration powered by Capacitor `@capacitor/core` and `@codetrix-studio/capacitor-google-auth`.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v3.4 + Autoprefixer
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Toast Notifications**: React Hot Toast
- **Routing**: React Router DOM v7
- **Mobile Native**: Capacitor v8 (Android)

### Backend
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **HTTP Framework**: Express v5
- **Real-Time WebSockets**: Socket.IO v4
- **Database ORM**: Mongoose v9
- **Dev Tooling**: Nodemon

### Database
- **Database Engine**: MongoDB Atlas
- **Schema**: `User` model (`email`, `name`, `reports`, `isBlocked`)

### Authentication
- **Provider**: Firebase Authentication + Google OAuth 2.0 (Web & Capacitor Native)

### Deployment & Tools
- **Environment Management**: Dotenv
- **Cross-Origin Resource Sharing**: CORS

---

## Project Architecture

Campus Connect follows a decoupled, client-server event-driven architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  (Tailwind CSS + Custom Hooks: useWebRTC, useChatSocket)│
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
        HTTP REST Requests            WebSockets & WebRTC
         (Health Checks)               Signaling Relays
               │                           │
┌──────────────▼───────────────────────────▼──────────────┐
│                    Express Server                       │
│           (App Layer & Middleware: CORS/JSON)           │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
       Database Queries             Socket.IO Manager
        (userRepository)            (Match / Video Relays)
               │                           │
┌──────────────▼──────────┐      ┌─────────▼──────────────┐
│      MongoDB Atlas      │      │ Peer 1 ◄─WebRTC─► Peer 2│
│  (Persistent User Data) │      │  (Direct Video Stream) │
└─────────────────────────┘      └────────────────────────┘
```

### High-Level Flow
1. **Auth Verification**: The frontend authenticates the user via Firebase Google Auth. Upon successful login, the email is registered with the backend via the `register_user` socket event.
2. **Database Verification**: `userService` checks the user in MongoDB Atlas. If blocked (due to $\ge 3$ reports), the connection is terminated and the `you_are_blocked` event is emitted.
3. **Matchmaking**: When a user selects **Text Chat** or **Video Call**, they enter `matchService` in-memory queues (`waitingUsers` / `waitingVideoUsers`). Once two candidates are available, a unique `roomId` is generated and both clients join a Socket.IO room.
4. **WebRTC Signaling**: For video calls, SDP offers, SDP answers, and ICE candidates are relayed between peers via Socket.IO signaling events (`video_offer`, `video_answer`, `video_ice_candidate`). Direct media streams flow peer-to-peer.

---

## Folder Structure

```
Campus-Connect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js             # Environment variable export & validation
│   │   │   └── database.js        # Mongoose connection lifecycle manager
│   │   ├── constants/
│   │   │   ├── socketEvents.js    # Socket.IO client/server event constants
│   │   │   └── messages.js        # System text & response messages
│   │   ├── controllers/
│   │   │   └── healthController.js # Express HTTP health route controller
│   │   ├── models/
│   │   │   └── User.js            # Mongoose User schema & model
│   │   ├── repositories/
│   │   │   └── userRepository.js   # Encapsulated MongoDB database queries
│   │   ├── routes/
│   │   │   └── healthRoutes.js     # Express routes definition
│   │   ├── services/
│   │   │   ├── matchService.js     # In-memory text & video match queues
│   │   │   └── userService.js      # User registration & report penalty logic
│   │   ├── sockets/
│   │   │   ├── handlers/
│   │   │   │   ├── authHandler.js   # register_user event handler
│   │   │   │   ├── chatHandler.js   # messaging, typing & room leave handlers
│   │   │   │   ├── matchHandler.js  # text & video match queue handlers
│   │   │   │   ├── reportHandler.js # report_user event & penalty handler
│   │   │   │   └── videoHandler.js  # WebRTC SDP/ICE signaling handlers
│   │   │   └── socketManager.js     # Socket connection lifecycle & count broadcast
│   │   ├── app.js                 # Express app initialization & middleware
│   │   └── server.js              # Server launcher (HTTP, Socket.IO, DB)
│   ├── bot.js                     # Bot army load testing script
│   ├── server.js                  # Delegate entrypoint for root nodemon
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   └── TextChatRoom.jsx
│   │   │   ├── common/
│   │   │   │   ├── BannedView.jsx
│   │   │   │   └── SearchingRadar.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardView.jsx
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx
│   │   │   ├── modals/
│   │   │   │   ├── GuidelinesModal.jsx
│   │   │   │   └── ReportModal.jsx
│   │   │   └── video/
│   │   │       ├── LocalVideoPIP.jsx
│   │   │       ├── RemoteVideoFeed.jsx
│   │   │       ├── VideoChatRoom.jsx
│   │   │       └── VideoControls.jsx
│   │   ├── hooks/
│   │   │   ├── useChatSocket.js   # Socket.IO state & event management hook
│   │   │   └── useWebRTC.js       # WebRTC peer connection & media hook
│   │   ├── pages/
│   │   │   ├── Chat.jsx           # Main application container page
│   │   │   └── Login.jsx          # Login & authentication page
│   │   ├── firebase.js            # Firebase client initialization
│   │   ├── socket.js              # Socket.IO client instance
│   │   ├── ThemeContext.jsx       # Light/Dark mode context provider
│   │   ├── WelcomeScreen.jsx      # Animated splash screen
│   │   ├── App.jsx                # Application router & toast options
│   │   ├── index.css              # Global styles & keyframes
│   │   └── main.jsx               # React DOM root entrypoint
│   ├── index.html                 # HTML template with Google Fonts
│   ├── tailwind.config.js         # Tailwind theme extension & font configuration
│   ├── vite.config.js             # Vite configuration
│   └── package.json
└── README.md
```

---

## Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB Atlas**: An active MongoDB connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/tushar5623/Campus-Connect.git
cd Campus-Connect
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run the backend server:
```bash
npm run dev
```
*The backend server will run on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Run the frontend development server:
```bash
npm run dev
```
*The application will be accessible at `http://localhost:5173`.*

---

## Environment Variables

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port for Express and Socket.IO server (Defaults to 5000) | `5000` |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string with credentials | `mongodb+srv://user:pass@cluster.mongodb.net/campusConnect` |

---

## Usage Workflow

1. **Authentication**: Open `http://localhost:5173`. Click **Continue with Google** to sign in with an authorized college email account.
2. **Community Guidelines**: Review and accept the community guidelines modal (including the 3-report rule explanation).
3. **Dashboard Lounge**:
   - View live online student metrics.
   - Choose **Start Text Chat** or **Start Video Call**.
4. **Text Chat Session**:
   - Match with a campus partner.
   - Send real-time messages and observe typing indicators.
   - Click **Next** to find another partner, or **Leave** to return to the lounge.
5. **Video Call Session**:
   - Connect via peer-to-peer WebRTC video.
   - Use mic and camera toggle controls.
   - Click **Report** to report inappropriate behavior, or **Next** to switch partners.

---

## API & Socket.IO Events Overview

### HTTP Endpoint
- `GET /`: Health check route returning `"Campus Connect API is running! 🚀"`.

### Socket.IO Event Reference

| Event Name | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `register_user` | Client $\rightarrow$ Server | `email: string` | Registers client email and verifies DB block status |
| `live_user_count` | Server $\rightarrow$ Client | `count: number` | Broadcasts current active online count |
| `find_match` | Client $\rightarrow$ Server | None | Enters the text chat matchmaking queue |
| `find_video_match` | Client $\rightarrow$ Server | None | Enters the video call matchmaking queue |
| `cancel_search` | Client $\rightarrow$ Server | None | Removes client from matchmaking queues |
| `matched` | Server $\rightarrow$ Client | `{ roomId, message }` | Notifies client that text match is established |
| `video_matched` | Server $\rightarrow$ Client | `{ roomId, initiator, message }` | Notifies client that video match is established |
| `video_offer` | Bidirectional | `{ roomId, offer }` | Relays WebRTC SDP offer to room partner |
| `video_answer` | Bidirectional | `{ roomId, answer }` | Relays WebRTC SDP answer to room partner |
| `video_ice_candidate` | Bidirectional | `{ roomId, candidate }` | Relays WebRTC ICE candidate to room partner |
| `send_message` | Client $\rightarrow$ Server | `{ roomId, message }` | Relays chat message to room partner |
| `receive_message` | Server $\rightarrow$ Client | `{ text, sender }` | Delivers received message to partner |
| `typing` / `stop_typing` | Client $\rightarrow$ Server | `roomId: string` | Relays typing indicator status |
| `report_user` | Client $\rightarrow$ Server | `{ roomId, reason }` | Increments reports on partner; blocks if $\ge 3$ |
| `you_are_blocked` | Server $\rightarrow$ Client | None | Notifies user that account has been suspended |
| `partner_left` | Server $\rightarrow$ Client | `message: string` | Notifies user that partner left the room |

---

## Development Workflow & Codebase Guidelines

### Core Principles
- **Layered Architecture**: Maintain strict separation of concerns across `config`, `models`, `repositories`, `services`, `sockets`, `controllers`, and `routes`.
- **Thin Controllers & Socket Handlers**: Controllers and socket event listeners only validate input, call services, and emit responses.
- **Business Logic in Services**: All queue manipulation, matching logic, and penalty checking belong in `services/`.
- **Database Logic in Repositories**: All database query operations belong in `repositories/`.
- **Custom React Hooks**: Complex browser APIs (WebRTC, getUserMedia) and Socket.IO state belong in `src/hooks/`.
- **DRY & KISS**: Avoid duplicate code, extract shared constants, and keep functions small and focused.

---

## Error Handling

- **Database Errors**: Handled gracefully in `userRepository` and `userService` with try/catch blocks logging detailed diagnostics.
- **Media Hardware Failures**: Caught in `useWebRTC` during `getUserMedia` access, displaying user-friendly error banners if camera/microphone permissions are denied.
- **WebRTC Connection Instability**: Monitors `peer.onconnectionstatechange` for `failed` or `disconnected` states, prompting the user to reconnect.

---

## Security Notes

- **Identity Verification**: Restricts access to authorized email domains (`@kiet.edu`).
- **Enforced Account Suspension**: Blocked accounts are immediately kicked out and prevented from registering socket sessions.
- **CORS Protection**: Whitelisted origin array enforcing strict CORS policies across HTTP and WebSockets.
- **Credential Protection**: Environment keys (`MONGO_URI`) are loaded via Dotenv and kept out of version control.

---

## Performance Notes

- **In-Memory Match Queueing**: $\mathcal{O}(1)$ queue shift operations for ultra-fast student pairing.
- **Peer-to-Peer Media Streams**: Direct WebRTC peer connections bypass backend server bandwidth during active video calls.
- **ICE Candidate Queuing**: Prevents dropped connections by buffering ICE candidates received prior to remote SDP description settlement.

---

## Future Improvements

- [ ] Add support for institution-specific sub-rooms (e.g., Computer Science, Electrical, Mechanical lounges).
- [ ] Add student interest-based matching tags.
- [ ] Implement Redis-backed socket adapter for horizontal multi-instance scaling.
- [ ] Add automated text content moderation using perspective API.

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
