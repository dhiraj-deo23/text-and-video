# text-and-video

Add Friend. Accept or Reject friend requests. Text and Video call with your friends on real time.

This app uses Node.js/Express/MongoDB with passport Local Auth for authentication, using email and JSONWebTokens for further verification.
This app used socket.io for private text chat and peerJS library for video call.

Usage
Create a config folder and add dev.env file.
Add your MONGODB_URL, JWT_SECRET, HOST, MAILPORT, USER and PASS to the dev.env file.

visit http://dhiraj-friendchat.herokuapp.com to see it working on production.

# Install dependencies
npm install

# Run in development
npm run dev

# Run in production
npm start
