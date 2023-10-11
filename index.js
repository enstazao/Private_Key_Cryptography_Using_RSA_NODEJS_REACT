const express = require('express');
const bodyParser = require('body-parser');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const cors = require('cors');
const transporter = require('./secret');

// Now you can use the transporter for sending emails


const app = express();
app.use(bodyParser.json());
app.use(cors());

// Function to generate and save RSA key pairs for a person
const generateAndSaveKeys = (personName) => {
    console.log(`Generating RSA keys for ${personName}...`);
    const key = new NodeRSA({ b: 2048 }); // 2048-bit keys, you can adjust the size as needed

    // Export public and private keys as strings
    const publicKey = key.exportKey('pkcs8-public-pem');
    const privateKey = key.exportKey('pkcs8-private-pem');

    // Save the keys to files
    const publicKeyPath = `${personName}_public.pem`;
    const privateKeyPath = `${personName}_private.pem`;

    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);

    console.log(`RSA keys for ${personName} generated and saved.`);
};

// Function to double encrypt a message
const doubleEncrypt = (message, personAPublicKeyPath, personBPublicKeyPath) => {
    const personAKey = new NodeRSA(fs.readFileSync(personAPublicKeyPath, 'utf8'));
    const personBKey = new NodeRSA(fs.readFileSync(personBPublicKeyPath, 'utf8'));

    // First, encrypt with Person A's public key
    const encryptedWithAPublicKey = personAKey.encrypt(message, 'base64');

    // Then, encrypt the result with Person B's public key
    const doubleEncryptedMessage = personBKey.encrypt(encryptedWithAPublicKey, 'base64');

    return doubleEncryptedMessage;
};

// Function to double decrypt a message
const doubleDecrypt = (doubleEncryptedMessage, personBPrivateKeyPath, personAPrivateKeyPath) => {
    const personBKey = new NodeRSA(fs.readFileSync(personBPrivateKeyPath, 'utf8'));
    const personAKey = new NodeRSA(fs.readFileSync(personAPrivateKeyPath, 'utf8'));

    // First, decrypt with Person B's private key
    const decryptedWithBPrivateKey = personBKey.decrypt(doubleEncryptedMessage, 'utf8');

    // Then, decrypt the result with Person A's private key
    const plainTextMessage = personAKey.decrypt(decryptedWithBPrivateKey, 'utf8');

    return plainTextMessage;
};

// Generate keys for Person A
generateAndSaveKeys('PersonA');

// Generate keys for Person B
generateAndSaveKeys('PersonB');


// Endpoint to double encrypt a message, send it via email, and return a success response
app.post('/double-encrypt-message', (req, res) => {
    const { email, message } = req.body;
    const personAPublicKeyPath = 'PersonA_public.pem';
    const personBPublicKeyPath = 'PersonB_public.pem';

    // Double encrypt the message
    const doubleEncryptedMessage = doubleEncrypt(message, personAPublicKeyPath, personBPublicKeyPath);

    // Compose email options
    const mailOptions = {
        from: '', 
        to: email, 
        subject: 'Encrypted Message',
        text: doubleEncryptedMessage // Send the doubleEncryptedMessage as the email text
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Failed to send the encrypted message via email' });
        } else {
            console.log('Email sent:', info.response);
            res.json({ message: 'Encrypted message sent successfully via email' });
        }
    });
});

// Endpoint to double decrypt a message
app.post('/double-decrypt-message', (req, res) => {
    const { doubleEncryptedMessage } = req.body;
    const personBPrivateKeyPath = 'PersonB_private.pem';
    const personAPrivateKeyPath = 'PersonA_private.pem';

    try {
        // Double decrypt the message
        const decryptedMessage = doubleDecrypt(doubleEncryptedMessage, personBPrivateKeyPath, personAPrivateKeyPath);
        res.json({ decryptedMessage });
    } catch (error) {
        console.error('Error decrypting message:', error);
        res.status(500).json({ error: 'Failed to decrypt the message' });
    }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
