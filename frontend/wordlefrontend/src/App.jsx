import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import Game from './Game';

import firstPic from '../src/assets/first.png';
import secondPic from '../src/assets/second.png';
import thirdPic from '../src/assets/third.png';

// Use environment variable for backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };
  
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        loginData,
        { withCredentials: true }
      );

      if (response && response.data) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        // Fetch a random word
        const wordResponse = await axios.get(`${API_BASE_URL}/api/word/random`, { withCredentials: true });
        const randomWord = wordResponse.data.word;
        localStorage.setItem('randomWord', randomWord);
        window.location.href = '/game';
      } else {
        setLoginError('Unexpected response structure. Please try again.');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        registerData,
        { withCredentials: true }
      );
      closeRegisterModal();
      openLoginModal();
    } catch (error) {
      setRegisterError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="flex flex-col items-center justify-center h-screen bg-customBackground">
          <div className="text-5xl font-bold mb-6 text-gray-900 font-karnak">Wordle</div>
          <p className="text-2xl mb-8 text-gray-700">Get 6 chances to guess a 5-letter word.</p>
          <div className="space-x-4">
            <button 
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
              onClick={openLoginModal}
            >
              Login
            </button>
            <button 
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700" 
              onClick={openModal}
            >
              Rules
            </button>
          </div>

          {/* Login Modal */}
          {isLoginModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg max-w-lg mx-auto">
                <h2 className="text-3xl font-extrabold mb-4">Login</h2>
                <form onSubmit={handleLoginSubmit}>
                  <label className="block mb-4">
                    Username or Email
                    <input 
                      type="text" 
                      name="login"
                      value={loginData.login}
                      onChange={handleLoginChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" 
                    />
                  </label>
                  <label className="block mb-4">
                    Password
                    <input 
                      type="password" 
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" 
                    />
                  </label>
                  {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 text-lg"
                  >
                    Submit
                  </button>
                  <p className="mt-4 text-center text-lg">
                    Don’t have an account? 
                    <button 
                      type="button" 
                      className="text-blue-600 hover:underline ml-1"
                      onClick={openRegisterModal}
                    >
                      Register
                    </button>
                  </p>
                </form>
                <button 
                  className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 text-lg"
                  onClick={closeLoginModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Register Modal */}
          {isRegisterModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg max-w-lg mx-auto">
                <h2 className="text-3xl font-extrabold mb-4">Register</h2>
                <form onSubmit={handleRegisterSubmit}>
                  <label className="block mb-4">
                    Username
                    <input 
                      type="text" 
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" 
                    />
                  </label>
                  <label className="block mb-4">
                    Email
                    <input 
                      type="email" 
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" 
                    />
                  </label>
                  <label className="block mb-4">
                    Password
                    <input 
                      type="password" 
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" 
                    />
                  </label>
                  {registerError && <p className="text-red-500 mb-4">{registerError}</p>}
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 text-lg"
                  >
                    Register
                  </button>
                </form>
                <button 
                  className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 text-lg"
                  onClick={closeRegisterModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Rules Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-lg mx-auto">
                <h2 className="text-2xl font-extrabold mb-1">How To Play</h2>
                <h3 className="text-2xl font-semibold mb-2">Guess the Wordle in 6 tries.</h3>
                <ul className="list-disc list-inside pl-4 mb-2">
                  <li>Each guess must be a valid 5-letter word.</li>
                  <li>The color of the tiles will change to show how close your guess was to the word.</li>
                </ul>
                <h3 className="font-bold mb-2">Examples</h3>

                {/* Example Images and Text */}
                <div className="mb-4">
                  <img src={firstPic} alt="W correct" className="block w-auto h-auto mx-auto mb-2"/>
                  <p className="text-center">W is in the word and in the correct spot.</p>
                </div>
                <div className="mb-4">
                  <img src={secondPic} alt="I incorrect spot" className="block w-auto h-auto mx-auto mb-2"/>
                  <p className="text-center">I is in the word but in the wrong spot.</p>
                </div>
                <div className="mb-4">
                  <img src={thirdPic} alt="U not in word" className="block w-auto h-auto mx-auto mb-2"/>
                  <p className="text-center">U is not in the word in any spot.</p>
                </div>

                <button 
                  className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      } />

      <Route path="/game" element={<Game />} />
    </Routes>
  );
}

export default App;