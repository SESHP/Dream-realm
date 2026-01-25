import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import { useGameStore } from '../store/gameStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setToken = useGameStore((state) => state.setToken);
  const setUserId = useGameStore((state) => state.setUserId); // добавь


  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const action = isRegister ? register : login;
      const data = await action(username, password);
      setToken(data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('token', data.token);
      setUserId(data.user.id);
      navigate('/game');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🌙 Dream Realm</h1>
        <p className="subtitle">Царство снов ждёт тебя</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : isRegister ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <button 
          className="switch-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
        </button>
      </div>
    </div>
  );
}