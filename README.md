# Sorrento waitlist

An SMS-based waitlist for a Vancouver barbershop

## How it works

- Person texts number with their name
  - Put customer at the end of a list
  - Send them a text back with # of people ahead of them and estimated wait time
- When a barber finishes a cut, they hit "next customer"
  - Remove a customer from the top of the list
  - Send the customer a text message saying "your spot is available for the next 5 minutes"

## Tools we'll use

- React: frontend
- Redis: datastore
- WebSockets: keep things in sync
- Twilio: programatic SMS
