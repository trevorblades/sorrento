import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';

export default function Index() {
  const {current: socket} = useRef(io('http://localhost:4000'));
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    socket.open();
    socket.on('data', data => {
      setCustomers(data.customers);
    });
    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(e.target.name.value);
    socket.emit('name', {
      name: e.target.name.value
    });
    // TODO: add name to waitlist
  }

  return (
    <div>
      <h1>Sorrento</h1>
      <ul>
        {customers.map((customer, index) => (
          <li key={index}>{customer}</li>
        ))}
      </ul>
      <button>Next customer</button>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" />
        <button type="submit">Add Customer</button>
      </form>
    </div>
  );
}
