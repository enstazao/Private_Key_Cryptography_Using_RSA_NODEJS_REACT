import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import SingleEncryption from './components/SingleEncryption';
import DoubleEncryption from './components/DoubleEncryption';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SingleEncryption />} />
          <Route path='/two-keys' element={<DoubleEncryption />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
