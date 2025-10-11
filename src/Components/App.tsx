import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AuthPage from '../Pages/AuthPage';
import ChatPage from '../Pages/ChatPage';

interface User { 
  id: number; 
  username: string;
  access_token?: string;
  csrf_token?:string;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('access_token');
    const savedCsrf = localStorage.getItem('csrf_token');

    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        setAccessToken(savedToken);
        setCsrfToken(savedCsrf);

        socket.emit('user_connected', parsedUser);
      } catch (err) {
        const error = err as Error;
        setError('Failed to parse saved user data: ' + error.message);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('csrf_token');

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
      fetchWithAuth(url)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch messages: ' + res.status);
          return res.json();
        })
        .then(data => {
          setMessages(data);
        })
        .catch((err: Error) => {
          setError('Error fetching messages: ' + err.message);
        });
    }
  }, [user, selectedUser, accessToken]); // refetch on token change

  const handleLogout = async () => {
    if (user) socket.emit('user_disconnected', user);
    setUser(null);
    setSelectedUser(null);
    setMessages([]);
    setAccessToken(null);
    setCsrfToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('csrf_token');

    // Optionally: call backend to clear refresh token
    await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !selectedUser) return;
    const messageData = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage
    };
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleLogin = async (formData: { username: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_BASE_URL}/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // get cookie for refresh
      });
      if (!response.ok) throw new Error('Login failed: ' + response.status);
      const data = await response.json();
      setUser({ id: data.id, username: data.username });
      setAccessToken(data.access_token);
      setCsrfToken(data.csrf_token);

      localStorage.setItem('user', JSON.stringify({ id: data.id, username: data.username }));
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('csrf_token', data.csrf_token);

      console.log('access_token', data.access_token)
      console.log('access_token',data.csrf_token)

      socket.emit('user_connected', { id: data.id, username: data.username });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData: { username: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_BASE_URL}/register`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Registration failed: ' + response.status);
      const data = await response.json();
      setUser({ id: data.id, username: data.username });
      setAccessToken(data.access_token);
      setCsrfToken(data.csrf_token);

      localStorage.setItem('user', JSON.stringify({ id: data.id, username: data.username }));
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('csrf_token', data.csrf_token);

      socket.emit('user_connected', { id: data.id, username: data.username });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Fetch users whenever user logs in or token changes
  if (user) {
    const url = `${API_BASE_URL}/users`;
    fetchWithAuth(url)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch users: ' + res.status);
        return res.json();
      })
      .then(data => setUsers(data))
      .catch((err: Error) => setError('Error fetching users: ' + err.message));
    }
  }, [user, accessToken]);


  // Authenticated fetch helper
  const fetchWithAuth = async (url: string, options: any = {}) => {
    let token = accessToken || localStorage.getItem('access_token');
    let csrf = csrfToken || localStorage.getItem('csrf_token');

    let headers = {
          ...(options.headers || {}),
          'Authorization': `Bearer ${token}`,
        };
        // Send CSRF for POST/PUT/DELETE requests
        if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase()) && csrf) {
          headers['X-CSRF-Token'] = csrf;
        }
        let res = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
    if (res.status === 401) {
      // Try refresh
      const refreshRes = await fetch(`${API_BASE_URL}/token/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: csrf ? { 'X-CSRF-Token': csrf } : {},

      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.access_token);
        setCsrfToken(refreshData.csrf_token);

        localStorage.setItem('access_token', refreshData.access_token);
        localStorage.setItem('csrf_token', refreshData.csrf_token);

        // Retry original request
        res = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${refreshData.access_token}`,
            ...(csrf ? { 'X-CSRF-Token': refreshData.csrf_token } : {}),
          },
          credentials: 'include',
        });
      }
    }
    return res;
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