import React, {useMemo, useRef, useState} from 'react';
import io from 'socket.io-client';
import useEffectOnce from 'react-use/lib/useEffectOnce';

export default function Index() {
  const {current: socket} = useRef(io(process.env.GATSBY_API_URL));
  const [customers, setCustomers] = useState([]);

  useEffectOnce(() => {
    socket.open();
    socket.on('data', data => setCustomers(data.customers));
    return () => socket.close();
  });

  const waitingCustomers = useMemo(
    () => customers.filter(customer => customer.waiting),
    [customers]
  );

  function handleNextClick() {
    socket.emit('serve', {id: waitingCustomers[0].id});
  }

  return (
    <div>
      <h1>Sorrento</h1>
      <button disabled={!waitingCustomers.length} onClick={handleNextClick}>
        Next customer
      </button>
      <h3>Waiting:</h3>
      <ul>
        {waitingCustomers.map(customer => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
      <h3>Served:</h3>
      <ul>
        {customers
          .filter(customer => !customer.waiting)
          .reverse()
          .map(customer => (
            <li key={customer.id}>{customer.name}</li>
          ))}
      </ul>
    </div>
  );
}
