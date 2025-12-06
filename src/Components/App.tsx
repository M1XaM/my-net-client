import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AuthPage from '../Pages/AuthPage';
import ChatPage from '../Pages/ChatPage';
import EmailVerificationPage from '../Pages/EmailVerificationPage';

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
  const [verificationState, setVerificationState] = useState<{
  status: 'idle' | 'pending_verification';
  userId: number | null;
  email: string | null;
}>({ status: 'idle', userId: null, email: null });

const [verificationCode, setVerificationCode] = useState('');
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

  const handleLogin = async (formData: { username: string; password: string; totpCode?: string }) => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_BASE_URL}/login`;
      const body: any = {
        username: formData.username,
        password: formData.password
      };

      // Add 2FA code if provided
      if (formData.totpCode) {
        body.totp_token = formData.totpCode;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();

      // Check if 2FA is required
      if (data.requires_2fa) {
        setError('Please enter your 2FA code');
        setLoading(false);
        // Show 2FA input in your login form
        return;
      }

      // Success - login complete
      setUser({ id: data.id, username: data.username });
      setAccessToken(data.access_token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, username: data.username }));
      localStorage.setItem('access_token', data.access_token);
      socket.emit('user_connected', { id: data. id, username: data.username });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
const handleVerifyEmail = async () => {
  if (!verificationState.userId || !verificationCode) {
    setError('Please enter the verification code');
    return;
  }

  setLoading(true);
  setError('');
  try {
    const url = `${API_BASE_URL}/verify-email`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: verificationState.userId,
        verification_code: verificationCode,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData. error || 'Verification failed');
    }

    const data = await response.json();

    // ← AUTO-LOGIN after verification
    setUser({ id: data.id, username: data.username });
    setAccessToken(data.access_token);
    setCsrfToken(data.csrf_token); // ← ADD THIS
    localStorage.setItem('user', JSON. stringify({ id: data.id, username: data.username }));
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('csrf_token', data.csrf_token); // ← ADD THIS

    // ← RESET verification state
    setVerificationState({ status: 'idle', userId: null, email: null });
    setVerificationCode('');

    socket.emit('user_connected', { id: data.id, username: data.username });
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};
const handleRegister = async (formData: { username: string; password: string; email: string }) => {
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

    // ← NEW: Check if pending verification
    if (data.status === 'pending_verification') {
      setVerificationState({
        status: 'pending_verification',
        userId: data.user_id,
        email: data.email
      });
      setError('');
    } else {
      // ← AUTO-LOGIN if verified immediately
      setUser({ id: data.id, username: data.username });
      setAccessToken(data.access_token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, username: data.username }));
      localStorage.setItem('access_token', data.access_token);
      socket.emit('user_connected', { id: data.id, username: data.username });
    }
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

  if (verificationState.status === 'pending_verification') {
  return (
    <EmailVerificationPage
      email={verificationState.email || ''}
      onVerify={handleVerifyEmail}
      loading={loading}
      error={error}
    />
  );
}

// Original auth page if no user
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

// Chat page if logged in
return (
  <ChatPage
    user={user}
    users={users}
    selectedUser={selectedUser}
    messages={messages}
    newMessage={newMessage}
    error={error}
    accessToken={accessToken}  // ← ADD THIS LINE

    onSelectUser={setSelectedUser}
    onMessageChange={setNewMessage}
    onSendMessage={sendMessage}
    onLogout={handleLogout}
  />
);}

export default App;