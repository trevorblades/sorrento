# Sorrento

Web infrastructure for a local Vancouver barbershop. This repo contains a public website, as well as an SMS-based waitlist API and client built with Twilio and WebSockets.

This project was a collaboration between me and [Ken Taylor](https://github.com/kentaylor92).

## How it works

1. Person texts number with their name
    - New customer is created in the database using the body of the text (name) and the "from" phone number
    - We automatically reply with the number of people ahead of them in line, and the estimated wait time
    - If the shop is not accepting customers, a reply is sent telling the customer this
1. Barber finishes a cut, presses "next customer" button
    - First customer in line gets a `servedAt` timestamp added to their row, qualifying them as "served"
    - We send a text to the customer's number telling them that they're up next

## Tools/services used

- React
- Twilio
- Apollo Client
- Apollo Server
- GraphQL Subscriptions
- Chakra UI
- Gatsby
- Express
- PostgreSQL
- Heroku

## Acknowledgments

- [Ken Taylor](https://github.com/kentaylor92) for pair programming this entire project
- [Matt Cool](https://mattcool.tech) for the design inspiration
