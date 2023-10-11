import React, { useState } from 'react';
import axios from 'axios';

function SingleEncryption() {
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [error, setError] = useState('');

  const handleEncryptAndSend = () => {
    // Encrypt the message before sending it to the server
    axios
      .post('http://localhost:5000/send-encrypted-message', { message, recipientEmail })
      .then((response) => {
        setEncryptedMessage(response.data.message);
        setError('');
      })
      .catch((error) => {
        setError('Error sending the encrypted message');
        console.error(error);
      });
  };

  const handleDecrypt = () => {
    // Send the encrypted message to the server for decryption
    axios
      .post('http://localhost:5000/receive-decrypt-message', { encryptedMessage })
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
    <div className="SingleEncryption">
      <h1>Encrypt and Decrypt Messages</h1>
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
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>
        <button onClick={handleEncryptAndSend}>Encrypt and Send</button>
        {encryptedMessage && <p>Encrypted Message: {encryptedMessage}</p>}
        {error && <p className="error">{error}</p>}
      </div>
      <div>
        <h2>Receive and Decrypt Message</h2>
        <div className="input-field">
          <textarea
            rows="5"  // Adjust the number of visible lines as needed
            cols="50" // Adjust the number of visible columns (characters) as needed
            placeholder="Enter encrypted message"
            value={encryptedMessage} // Use the encryptedMessage state here
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

export default SingleEncryption;
