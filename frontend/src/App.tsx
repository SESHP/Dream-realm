import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { Game } from './pages/Game';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;