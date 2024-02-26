const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/Dallas/Projects/Fall 2023 Projects/PrivacyPulse/privacypulse492-firebase-adminsdk-hi0yr-1b2491265c.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://privacypulse492-default-rtdb.firebaseio.com'
});

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'static' directory
app.use(express.static('static'));

// User routes module
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

