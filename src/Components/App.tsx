import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AuthPage from '../Pages/AuthPage';
import ChatPage from '../Pages/ChatPage';

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

const API_BASE_URL = 'https://localhost/api';
const socket: Socket = io('https://localhost', {
  path: '/api/socket.io',
  transports: ['websocket']
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
      
      const url = `${API_BASE_URL}/messages/${user.id}/${selectedUser.id}`;
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

  const handleLogin = async (formData: { username: string; password: string }) => {
  setLoading(true);
  setError('');
  
  try {
    const url = `${API_BASE_URL}/login`;
    console.log('Login request to:', url);
    console.log('Login data:', formData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
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

const handleRegister = async (formData: { username: string; password: string }) => {
  setLoading(true);
  setError('');
  
  try {
    const url = `${API_BASE_URL}/register`;
    console.log('Register request to:', url);
    console.log('Register data:', formData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
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

if (!user) {
  return (
    <AuthPage
      onLogin={handleLogin}
      onRegister={handleRegister}
      loading={loading}
      error={error}
    />
  );
}

  return (
    <ChatPage
      user={user}
      users={users}
      selectedUser={selectedUser}
      messages={messages}
      newMessage={newMessage}
      error={error}
      onSelectUser={setSelectedUser}
      onMessageChange={setNewMessage}
      onSendMessage={sendMessage}
      onLogout={handleLogout}
    />
  );
}

export default App;