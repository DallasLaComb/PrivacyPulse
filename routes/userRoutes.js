const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + encrypted.toString('hex');
}

function decrypt(encryptedText, secretKey) {
  const iv = Buffer.from(encryptedText, 'hex').slice(0, 16);
  const encrypted = Buffer.from(encryptedText, 'hex').slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { salt, hashedPassword };
}

async function verifyPassword(hashedPassword, inputPassword) {
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
  return isMatch;
}

router.post('/register', async (req, res) => {

  const { username, password, confirmPassword } = req.body;
  // Perform server-side validation here (e.g., username uniqueness, password strength)

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const dh = crypto.createDiffieHellman(2048); // 2048-bit prime

  const prime = dh.getPrime('hex');
  const generator = dh.getGenerator('hex');

  console.log(`Prime number (p): ${prime}`);
  console.log(`Generator (g): ${generator}`);

// Generating a private-public key pair
dh.generateKeys();
const publicKey = dh.getPublicKey('hex');
const privateKey = dh.getPrivateKey('hex')
const dataFilePath = path.join(__dirname, 'data.json');
fs.writeFileSync(dataFilePath, JSON.stringify(privateKey));

  const { salt, hashedPassword } = await hashPassword(password);
  // Create a new user account in Firebase Authentication
  admin.auth().createUser({
    displayName: username,
    password: hashedPassword,
    publicKey: publicKey,

  })
    .then((userRecord) => {
      // Handle successful registration
      console.log('Successfully registered:', userRecord.uid);
      // Optionally, store additional user information in Realtime Database
      const db = admin.database();
      const ref = db.ref('users/' + userRecord.uid);
      ref.set({
        username: username,
        password: hashedPassword,
        publicKey: publicKey,

        // Store any other user details, but NOT the password
      });

      res.status(200).json({ message: 'Registration successful', uid: userRecord.uid });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error during registration' });
    });
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Lookup the user in the database by username
  const usersRef = admin.database().ref('users');
  usersRef.orderByChild('username').equalTo(username).once('value', async snapshot => {
    if (snapshot.exists()) {
      // Since usernames are unique, we can directly access the user data
      const userSnapshot = snapshot.val();
      const userId = Object.keys(userSnapshot)[0]; // Get the user's key

      

            const user = userSnapshot[userId];

      // Compare the provided password with the stored plaintext password
      try {
        const passwordCheck = await verifyPassword(user.password, password); // Add await here
    
        if (passwordCheck) {
          // Passwords match
          res.status(200).json({ message: 'Login successful', uid: userId, username: user.username, publicKey: user.publicKey });
        }else {
          // Passwords don't match
          res.status(401).json({ error: 'Invalid password' });
        }
      } catch (error) {
        // Handle any error that might occur during password verification
        res.status(500).json({ error: 'Error during login process' });
      }
    } else { // User not found
      res.status(404).json({ error: 'User not found' });
    }
  });
});

const fs = require('fs');

// Function to read the secret key from data.json
function getSecretKey() {
  try {
    const data = fs.readFileSync('data.json', 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.secretKey;
  } catch (error) {
    console.error('Error reading secret key:', error);
    return null;
  }
}

router.post('/send-message', (req, res) => {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return res.status(500).json({ error: 'Secret key not found' });
  }

  const { userId, text } = req.body;
  const encryptedText = encrypt(text, secretKey);

  const newMessageRef = admin.database().ref('chatroom').push();
  newMessageRef.set({
    userId: userId,
    text: encryptedText,
    timestamp: admin.database.ServerValue.TIMESTAMP
  })
  .then(() => {
    res.status(200).json({ message: 'Message sent' });
  })
  .catch((error) => {
    res.status(500).json({ error: 'Error sending message' });
  });
});

router.get('/get-messages', (req, res) => {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return res.status(500).json({ error: 'Secret key not found' });
  }

  const messagesRef = admin.database().ref('chatroom');
  messagesRef.once('value', snapshot => {
    if (snapshot.exists()) {
      const messages = snapshot.val();

      // Fetching user data
      const usersRef = admin.database().ref('users');
      usersRef.once('value', userSnapshot => {
        if (userSnapshot.exists()) {
          const users = userSnapshot.val();

          // Combine decrypted messages with user names
          const decryptedMessages = Object.keys(messages).map(key => {
            const msg = messages[key];
            const decryptedText = decrypt(msg.text, secretKey);
            const user = users[msg.userId];
            return { ...msg, text: decryptedText, username: user ? user.username : 'Unknown' };
          });

          res.json(decryptedMessages);
        } else {
          res.status(500).json({ error: 'Error fetching users' });
        }
      });
    } else {
      res.status(404).json({ error: 'No messages found' });
    }
  });
});

router.get('/get-users', (req, res) => {
  const db = admin.database();

router.get('/get-user/:userId', (req, res) => {
  const db = admin.database();
  const userId = req.params.userId;

  const userRef = db.ref(`users/${userId}`);
  userRef.once('value', snapshot => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      // You may want to remove sensitive information like passwords
      res.json({
        id: userId,
        ...user,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});
module.exports = router;

