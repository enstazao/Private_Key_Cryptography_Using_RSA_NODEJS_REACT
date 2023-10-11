const express = require('express');
const bodyParser = require('body-parser');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const transporter = require('./secret.js');


const cors = require('cors'); // Import the cors middleware


const app = express();
app.use(bodyParser.json());
// Use CORS middleware with default options
app.use(cors());


const publicKeyPath = 'bob_public.pem';
const privateKeyPath = 'bob_private.pem';

let publicKey;
let privateKey;

// Function to generate new RSA key pair and save it
const generateAndSaveKeys = () => {
    console.log('Generating new keys...');
    const key = new NodeRSA({ b: 2048 });
    publicKey = key.exportKey('public');
    privateKey = key.exportKey('private');
    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);
    console.log('New keys generated and saved.');
};

// Check if key files exist, and if not, generate new keys and save them
if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    generateAndSaveKeys();
} else {
    // Load existing keys if files exist
    try {
        publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    } catch (error) {
        console.error('Error reading key files:', error);
        process.exit(1);
    }
}

const key = new NodeRSA();
key.importKey(privateKey, 'private');
key.importKey(publicKey, 'public');

app.post('/send-encrypted-message', (req, res) => {
    console.log(req.body);
    const { message, recipientEmail } = req.body;
    console.log(message, recipientEmail);

    try {
        // Convert the message to a buffer with UTF-8 encoding
        const messageBuffer = Buffer.from(message, 'utf8');

        // Encrypt the message and specify 'base64' encoding for output
        const encryptedMessage = key.encrypt(messageBuffer, 'base64');

        const mailOptions = {
            from: 'p200165@pwr.nu.edu.pk',
            to: recipientEmail,
            subject: 'Encrypted Message',
            text: `You have received an encrypted message:\n\n${encryptedMessage}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ error: 'Failed to send the encrypted message' });
            } else {
                console.log('Email sent:', info.response);
                res.json({ message: 'Encrypted message sent successfully' });
            }
        });
    } catch (error) {
        console.error('Error encrypting message:', error);
        res.status(500).json({ error: 'Failed to encrypt the message' });
    }
});


app.post('/receive-decrypt-message', (req, res) => {
    const { encryptedMessage } = req.body;

    try {
        const decryptedMessage = key.decrypt(encryptedMessage, 'utf8');
        res.json({ decryptedMessage });
    } catch (error) {
        console.error('Error decrypting message:', error);
        res.status(500).json({ error: 'Failed to decrypt the message' });
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});