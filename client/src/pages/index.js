import App from '../components/app';
import LoginForm from '../components/login-form';
import NoSsr from '@mpth/react-no-ssr';
import React from 'react';
import decode from 'jwt-decode';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import {Button} from '@chakra-ui/core';

export default function Index() {
  const [user, setToken, removeToken] = useLocalStorage(
    'sorrento:token',
    undefined,
    {
      deserializer(value) {
        try {
          const token = JSON.parse(value);
          const user = decode(token);
          return {
            ...user,
            token
          };
        } catch (error) {
          return null;
        }
      }
    }
  );

  return (
    <NoSsr>
      {user ? (
        <div>
          <Button onClick={removeToken}>Log out</Button>
          <App user={user} />
        </div>
      ) : (
        <LoginForm setToken={setToken} />
      )}
    </NoSsr>
  );
}
