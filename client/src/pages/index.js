import React from 'react';

export default function Index() {
  function handleSubmit(e) {
    e.preventDefault();
    console.log(e.target.name.value);
    // TODO: add name to waitlist
  }

  return (
    <div>
      <h1>Sorrento</h1>
      <ul>
        <li>Customer A</li>
        <li>Customer B</li>
        <li>Customer C</li>
      </ul>
      <button>Next customer</button>

      <form onSubmit={handleSubmit}>
        <input type="text" name="name"></input>
        <button type="submit">Add Customer</button>
      </form>
    </div>
  );
}
