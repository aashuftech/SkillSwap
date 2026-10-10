# SkillSwap

SkillSwap is a skill-exchange platform where users can connect with others, exchange skills, chat, and communicate through video calls. It also includes payment integration and AI-assisted skill matching to help users find relevant learning partners.

## Screenshots and demo

Add verified app screenshots and a working live demo link here when they are ready.

- **Live Demo:** Add your deployed URL
- **GitHub Repository:** https://github.com/aashuftech/SkillSwap

## Features

- User authentication and profile management.
- Add and manage skills you can teach and want to learn.
- Find potential learning partners based on skill similarity.
- AI-assisted skill matching using TF-IDF and cosine similarity.
- Chat with other users through the platform.
- Real-time video calls using WebRTC.
- Socket.IO signaling for call requests, acceptance, rejection, and connection setup.
- Razorpay payment gateway integration.
- Responsive interface for different screen sizes.

## How skill matching works

1. Users provide information about the skills they can teach and want to learn.
2. The matching system processes the skill information into text features.
3. TF-IDF converts the text into numerical representations.
4. Cosine similarity compares the representations to estimate how closely two users' skills match.
5. The system uses the similarity results to help identify relevant learning partners.

The matching score is an estimate of text similarity. It does not guarantee that two users will be a perfect learning match.

## How video calling works

1. A user starts a video call from the platform.
2. Socket.IO sends the call request to the other user's connected browser.
3. The receiving user can accept or reject the call.
4. When the call is accepted, WebRTC exchanges connection information through Socket.IO.
5. Both browsers exchange ICE candidates to discover a suitable network path.
6. WebRTC establishes the media connection and streams audio and video between the participants.
7. When the call ends, the application closes the peer connection and stops the local media tracks.

Socket.IO handles signaling and call-related events. WebRTC handles the actual audio and video communication. A TURN server may be required on networks where a direct peer-to-peer connection cannot be established.

## How payments work

1. A user selects a paid plan or payment option.
2. The frontend sends an order-creation request to the backend.
3. The backend converts the amount from rupees to paise and requests an order from Razorpay.
4. The frontend uses the returned order information to open Razorpay Checkout.
5. After checkout, the payment response is sent to the backend for verification.

**Important:** The current payment verification endpoint needs proper Razorpay signature verification before the application can safely treat a payment as successful. Production use also requires server-side payment confirmation and reliable storage of payment and plan-activation records.

## Built with

- **React** — builds the frontend pages and interactive components.
- **JavaScript** — implements frontend and backend application logic.
- **Node.js and Express** — provide the backend server and REST APIs.
- **MongoDB and Mongoose** — store application data.
- **Socket.IO** — handles real-time events and WebRTC signaling.
- **WebRTC** — enables browser-based audio and video calls.
- **Razorpay** — integrates online payments.
- **TF-IDF and cosine similarity** — support text-based skill matching.
- **HTML and CSS** — structure and style the user interface.
- **Vite** — runs and builds the frontend, if used in the current setup.

## Project structure

```text
SkillSwap/
├── src/
│   ├── components/    Reusable UI components
│   ├── pages/         Application pages
│   ├── context/       Shared application and call state
│   └── lib/           API and Socket.IO utilities
│
├── server/
│   └── server.js      Express API and Socket.IO server
│
├── public/            Static assets
├── package.json       Frontend dependencies and scripts
└── README.md
```

The exact folders may differ depending on the current repository structure.

## Run locally

You will need Node.js, npm, and access to a MongoDB database.

### 1. Clone the repository

```bash
git clone https://github.com/aashuftech/SkillSwap.git
cd SkillSwap
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
npm install
```

If the `server` directory contains its own `package.json`, install backend dependencies separately:

```bash
npm --prefix server install
```

### 3. Configure environment variables

Create the environment files required by the frontend and backend, based on the project's existing examples or configuration.

Typical backend settings may include:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use the actual environment variable names expected by the source code. Keep secrets private and never commit real credentials.

If the frontend uses a configurable backend URL, set the corresponding `VITE_` variable according to the project's API configuration.

### 4. Start the backend

Run the backend command defined in its `package.json`. For example, if a development script exists:

```bash
npm --prefix server run dev
```

Otherwise, use the actual start command configured by the project.

### 5. Start the frontend

In another terminal:

```bash
npm run dev
```

Open the local URL printed by Vite.

Make sure MongoDB is reachable and the frontend API URL points to the running backend.

## Deployment

The project has been deployed using AWS infrastructure for the backend and a frontend hosting service, depending on the current deployment configuration.

Before publishing this section, add the verified frontend URL, backend URL, hosting details, and deployment instructions. Never include private server credentials or secret keys in the README.

## Security and privacy

- Keep database credentials and Razorpay secrets on the backend.
- Validate user input on the server.
- Protect private API routes with authentication and authorization.
- Verify Razorpay payment signatures on the backend before activating paid features.
- Use HTTPS in production.
- Configure Socket.IO CORS and allowed frontend origins appropriately.
- Ensure users can only access conversations and call-related actions they are authorized to use.
- Request camera and microphone permissions before starting a video call.
- Stop media tracks and close peer connections when calls end.

## Known limitations

- Skill matching depends on the quality and wording of user-provided skill information.
- Video calling depends on browser permissions and network connectivity.
- Direct WebRTC connections may fail on restrictive networks without a TURN server.
- Payment verification and persistent plan activation require secure server-side implementation.
- Add verified screenshots, a working public demo, and confirmed setup instructions before presenting the repository as a complete production deployment.
