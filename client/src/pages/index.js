import App from '../components/app';
import LoginForm from '../components/login-form';
import React from 'react';
import useLocalStorage from 'react-use/lib/useLocalStorage';

export default function Index() {
  const [token, setToken, removeToken] = useLocalStorage('sorrento:token');
  return token ? (
    <App removeToken={removeToken} />
  ) : (
    <LoginForm setToken={setToken} />
  );
}
