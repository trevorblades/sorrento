import React, {useRef, useState} from 'react';
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

  function handleSubmit(e) {
    e.preventDefault();
    socket.emit('name', {name: e.target.name.value});
  }

  function handleNextClick() {
    socket.emit('next');
  }

  return (
    <div>
      <h1>Sorrento</h1>
      <form onSubmit={handleSubmit}>
        <input required type="text" name="name" />
        <button type="submit">Add Customer</button>
      </form>
      <button onClick={handleNextClick}>Next customer</button>
      <ul>
        {customers.map((customer, index) => (
          <li key={index}>{customer}</li>
        ))}
      </ul>
    </div>
  );
}
