import React, { useState } from 'react';
import axios from 'axios';

function DoubleEncryption() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false); // State variable for email sent success

  const handleEncryptAndSend = () => {
    // Encrypt the message before sending it to the server
    axios
      .post('http://localhost:5001/double-encrypt-message', { message, email })
      .then((response) => {
        setEncryptedMessage(response.data.doubleEncryptedMessage);
        setError('');
        setEmailSent(true); // Set emailSent to true when email is sent
      })
      .catch((error) => {
        setError('Error sending the encrypted message');
        console.error(error);
      });
  };

  const handleDecrypt = () => {
    // Send the encrypted message to the server for decryption
    axios
      .post('http://localhost:5001/double-decrypt-message', { doubleEncryptedMessage: encryptedMessage })
      .then((response) => {
        setDecryptedMessage(response.data.decryptedMessage);
        setError('');
      })
      .catch((error) => {
        setError('Error decrypting the message');
        console.error(error);
      });
  };

  return (
    <div className="MessageEncryption">
      <h1>Two Keys Encrypt and Decrypt Messages</h1>
      <div>
        <h2>Send Encrypted Message</h2>
        <div className="input-field">
          <input
            type="text"
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="input-field">
          <input
            type="text"
            placeholder="Recipient's Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button onClick={handleEncryptAndSend}>Encrypt and Send</button>
        {emailSent && <p>Email sent successfully</p>}
        {encryptedMessage && <p>Encrypted Message: {encryptedMessage}</p>}
        {error && <p className="error">{error}</p>}
      </div>
      <div>
        <h2>Receive and Decrypt Message</h2>
        <div className="input-field">
          <textarea
            rows="5"
            cols="50"
            placeholder="Enter encrypted message"
            value={encryptedMessage}
            onChange={(e) => setEncryptedMessage(e.target.value)}
          />
        </div>
        <button onClick={handleDecrypt}>Decrypt</button>
        {decryptedMessage && <p>Decrypted Message: {decryptedMessage}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default DoubleEncryption;
