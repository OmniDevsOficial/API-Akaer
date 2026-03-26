import React, { useState } from 'react';
import styles from './Login.module.css';
import backgroundImage from '../../assets/background.jpg';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LoginPage: React.FC = () => {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { token } = response.data;

      if (!token) {
        throw new Error('Token não retornado pela API.');
      }

      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      navigate('/home');
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Falha ao fazer login.';
      console.error('Erro no login:', message);
      alert(message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      { /* Imagem e Logo */}
      <div
        className={styles.leftColumn}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
      </div>

      {/* Formulário de Login */}
      <div className={styles.rightColumn}>
        <form onSubmit={handleLogin} className={styles.loginForm}>

          <div className={styles.accessLabel}>— ACESSO À PLATAFORMA</div>

          <h1 className={styles.title}>Bem-vindo de volta</h1>

          <p className={styles.subtitle}>
            Insira suas credenciais para continuar
          </p>

          {/* E-MAIL */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>E-MAIL</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="usuario@akaer.com"
              required
              className={styles.inputField}
            />
          </div>

          {/* SENHA */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>SENHA</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={styles.inputField}
            />
          </div>

          {/* Esqueci a Senha */}
          <div className={styles.formFooter}>
            <div className={styles.rememberWrapper}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="rememberMe" className={styles.rememberLabel}>
                Lembrar de mim
              </label>
            </div>

            <a href="/esqueci-senha" className={styles.forgotPassword}>
              Esqueci Senha
            </a>
          </div>

          {/* Botão ENTRAR */}
          <button type="submit" className={styles.submitButton}>
            ENTRAR
          </button>

          {/* Texto Inferior */}
          <div className={styles.infoTextWrapper}>
            <div className={styles.infoTitle}>
              Normas <span className={styles.infoTitleHighlight}>técnicas</span> em um só lugar
            </div>
            <p className={styles.infoBody}>
              Plataforma centralizada de requisitos normativos aeronáuticos para suporte à conformidade regulatória.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;