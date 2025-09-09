import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface User { 
  id: number; 
  username: string; 
}

interface Message { 
  id: number; 
  sender_id: number; 
  receiver_id: number; 
  content: string; 
  timestamp: string; 
}

// Define base URL for API requests
const API_BASE_URL = 'http://localhost:5000';
const socket: Socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling']
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        socket.emit('user_connected', parsedUser);
      } catch (err) {
        const error = err as Error;
        setError('Failed to parse saved user data: ' + error.message);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('users_list', (usersList: User[]) => {
      setUsers(usersList);
    });

    socket.on('connect_error', (err: Error) => {
      setError('Socket connection failed: ' + err.message);
    });

    return () => {
      socket.off('receive_message');
      socket.off('users_list');
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    if (user && selectedUser) {
      socket.emit('join', { 
        user_id: user.id, 
        other_id: selectedUser.id 
      });
      
      // Fixed: Added base URL to the fetch request
      const url = `${API_BASE_URL}/api/messages/${user.id}/${selectedUser.id}`;
      console.log('Fetching messages from:', url);
      
      fetch(url)
        .then(async (res) => {
          console.log('Messages response status:', res.status);
          const contentType = res.headers.get('content-type');
          console.log('Messages response content-type:', contentType);
          
          if (!res.ok) {
            if (contentType && contentType.includes('text/html')) {
              const text = await res.text();
              console.log('HTML response received:', text.substring(0, 200));
              throw new Error(`Server returned HTML instead of JSON. This usually means the endpoint doesn't exist. Response: ${text.substring(0, 100)}...`);
            }
            throw new Error('Failed to fetch messages: ' + res.status);
          }
          
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Expected JSON response but got: ' + contentType);
          }
          
          return res.json();
        })
        .then(data => {
          console.log('Messages received:', data);
          setMessages(data);
        })
        .catch((err: Error) => {
          console.error('Error fetching messages:', err);
          setError('Error fetching messages: ' + err.message);
        });
    }
  }, [user, selectedUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Fixed: Added base URL to the fetch request
      const url = `${API_BASE_URL}/api/login`;
      console.log('Login request to:', url);
      console.log('Login data:', loginForm);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      console.log('Login response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Login response content-type:', contentType);
      
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.log('HTML response received:', text.substring(0, 200));
        throw new Error(`Server returned HTML instead of JSON. This usually means the endpoint doesn't exist. Response: ${text.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error('Login failed: ' + response.status);
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Expected JSON response but got: ' + contentType);
      }
      
      const userData: User = await response.json();
      console.log('Login successful, user data:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      socket.emit('user_connected', userData);
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Fixed: Added base URL to the fetch request
      const url = `${API_BASE_URL}/api/register`;
      console.log('Register request to:', url);
      console.log('Register data:', registerForm);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      
      console.log('Register response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Register response content-type:', contentType);
      
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.log('HTML response received:', text.substring(0, 200));
        throw new Error(`Server returned HTML instead of JSON. This usually means the endpoint doesn't exist. Response: ${text.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error('Registration failed: ' + response.status);
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Expected JSON response but got: ' + contentType);
      }
      
      const userData: User = await response.json();
      console.log('Registration successful, user data:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      socket.emit('user_connected', userData);
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (user) socket.emit('user_disconnected', user);
    setUser(null);
    setSelectedUser(null);
    setMessages([]);
    localStorage.removeItem('user');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !selectedUser) return;
    
    const messageData = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage
    };
    
    console.log('Sending message:', messageData);
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600">
            <h1 className="text-2xl font-bold text-white text-center py-4">Welcome to ChatApp</h1>
          </div>
          
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Register</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={registerForm.username}
                    onChange={e => setRegisterForm({...registerForm, username: e.target.value})}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ChatApp</h1>
          <div className="flex items-center space-x-4">
            <span className="font-medium">Welcome, {user.username}</span>
            <button 
              onClick={handleLogout}
              className="bg-white text-blue-600 hover:bg-blue-100 font-medium py-1 px-3 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden container mx-auto p-4 gap-4">
        <div className="w-1/4 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Online Users</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {users.map(u => (
              <div 
                key={u.id} 
                className={`p-3 border-b border-gray-100 cursor-pointer transition ${selectedUser?.id === u.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium text-gray-800">
                    {u.username}
                    {u.id === user.id && ' (You)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white">
                <h3 className="font-semibold text-gray-800">Chat with {selectedUser.username}</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map(m => (
                    <div 
                      key={m.id} 
                      className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${m.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                        <div className="message-content">{m.content}</div>
                        <div className={`text-xs mt-1 ${m.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <div className="text-gray-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500">Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;