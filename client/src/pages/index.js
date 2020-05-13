import React, {useMemo, useState} from 'react';
import io from 'socket.io-client';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {useLazyRef} from '@shopify/react-hooks';

export default function Index() {
  const {current: socket} = useLazyRef(() => io(process.env.GATSBY_API_URL));
  const [state, setState] = useState({});

  // TODO: implement independant loading state

  useEffectOnce(() => {
    socket.open();
    socket.on('data', data =>
      setState(prevState => ({
        ...prevState,
        ...data
      }))
    );
    return () => socket.close();
  });

  const waitingCustomers = useMemo(
    () =>
      state.customers
        ? state.customers.filter(customer => !customer.servedAt)
        : [],
    [state.customers]
  );

  function handleNextClick() {
    socket.emit('serve', {id: waitingCustomers[0].id});
  }

  return (
    <div>
      <h1>Sorrento</h1>
      {'isAccepting' in state && (
        <label>
          <input
            checked={state.isAccepting}
            onChange={e => socket.emit('accept', {value: e.target.checked})}
            type="checkbox"
          />
          Accepting customers
        </label>
      )}
      <button disabled={!waitingCustomers.length} onClick={handleNextClick}>
        Next customer
      </button>
      <h3>Waiting:</h3>
      <ul>
        {waitingCustomers.map(customer => (
          <li key={customer.id}>
            {customer.name}
            <button onClick={() => socket.emit('serve', {id: customer.id})}>
              Serve
            </button>
            <button onClick={() => socket.emit('remove', {id: customer.id})}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <h3>Served:</h3>
      <ul>
        {state.customers
          ?.filter(customer => customer.servedAt)
          .sort((a, b) => new Date(b.servedAt) - new Date(a.servedAt))
          .map(customer => (
            <li key={customer.id}>
              {customer.name} served at{' '}
              {new Date(customer.servedAt).toLocaleTimeString()}
            </li>
          ))}
      </ul>
    </div>
  );
}
