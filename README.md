# Swipe Chat

A chat web app for desktop and mobile screens, where meeting new people is as easy as a glance followed by a click. 

[![Demo YouTube video](https://img.youtube.com/vi/2hCx-381JuE/0.jpg)](https://www.youtube.com/watch?v=2hCx-381JuE)

Main views and functions:

/ [index router](https://github.com/nibsuoogee/swipe-chat/blob/main/routes/index.ts) [index.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/index.pug)
- Unauthenticated [auth router](https://github.com/nibsuoogee/swipe-chat/blob/main/routes/auth.ts) 
  - Login [login.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/login.pug)
  - Register [register.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/register.pug)
- Swipe [swipe router](https://github.com/nibsuoogee/swipe-chat/blob/main/routes/swipe.ts) [swipe.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/swipe.pug)
  - Other users' profiles will show up one by one
  - Like or dislike, if they like you back, a chat will be created
  - If you like someone who already likes you, an option to jump to the chat appears
- Profile [profile router](https://github.com/nibsuoogee/swipe-chat/blob/main/routes/profile.ts) [profile.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/profile.pug)
  - See your current username, change it if you wish
  - Change your password, input twice
- Images [images router](https://github.com/nibsuoogee/swipe-chat/blob/main/routes/images.ts) [image.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/image.pug)
  - See your current images in a grid, add new ones
- Messaging [messaging router](https://github.com/nibsuoogee/swipe-chat/blob/main/routes/messaging.ts) [messaging.pug](https://github.com/nibsuoogee/swipe-chat/blob/main/views/messaging.pug)
  - Matches are listed, in pages of 10 if you are popular enough
  - Click on a match to open the chat window
    - 'Last edited' timestamp
    - Send and receive messages
    - Search for messages containing text using the magnifying glass
- Logout

## Technologies

<div class="image-row">
    <img src="https://raw.githubusercontent.com/bigskysoftware/htmx/master/www/static/img/htmx_logo.1.png" height="64" alt="HTMX Logo">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1024px-Typescript_logo_2020.svg.png" height="64" alt="TypeScript Logo">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/320px-Tailwind_CSS_Logo.svg.png" height="64" alt="Tailwind CSS Logo">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png" height="64" alt="Express.js Logo">
    <img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/pugjs_logo_icon_170825.png" height="64" alt="Pug.js Logo">
    <img src="https://1000logos.net/wp-content/uploads/2020/08/MongoDB-Logo.png" height="64" alt="MongoDB Logo">
    <img src="https://svgur.com/i/943.svg" height="64" alt="PassportJS Logo">
</div>


HTMX was chosen to drive interaction in the application as it provides server-side rendering and a simplified form of communication between server and client. Omitting json, and simply relying on the transfer of markup to exchange state, many benefits in complexity management can be gained.

Pug and TailwindCSS streamline the development of views and work very well together with HTMX markup.

MongoDB exposes an abstracted interface for simple database queries in the express back end.

Passport does the heavy lifting for user authentication and does not interfere with other middlewares.

## Testing

<div class="image-row">
    <img src="https://www.cypress.io/images/layouts/cypress-logo.svg" height="64" alt="Cypress Logo">
</div>

<br>

[`cypress/e2e/api`](https://github.com/nibsuoogee/swipe-chat/tree/main/cypress/e2e/api) Contains sets of unit tests for different routers and their routes

[`cypress/e2e/e2e-general`](https://github.com/nibsuoogee/swipe-chat/tree/main/cypress/e2e/e2e-general) Contains general end-to-end tests for the main application functions

[`cypress/e2e/component`](https://github.com/nibsuoogee/swipe-chat/tree/main/cypress/e2e/component)  Contains tests for different component views. Server-side rendering means api testing is more critical. 

## Assignment related features and requested points

| Requirement                                                                                                                                                                                                                                                                                                                                                                    | Points |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| Mandatory requirements<br>- Node.js back-end<br>- MongoDB database<br>- Authentication (session based)<br><br>Users can<br>  - Like/dislike other users<br>  - Update their profile<br>  - Chat with matches<br>Non-authenticated users can register<br><br>Responsive design<br>  - Usable on desktop and mobile<br><br>Documentation<br>  - Technology, installation, manual | 25     |
| Use of a front-end framework: HTMX                                                                                                                                                                                                                                                                                                                                             | 5      |
| Option to start chat immediately with a new match                                                                                                                                                                                                                                                                                                                              | 2      |
| User profiles have images which are visible when swiping and in chat                                                                                                                                                                                                                                                                                                           | 3      |
| 'Last edited' timestamp stored and shown in chat                                                                                                                                                                                                                                                                                                                               | 2      |
| Translation of whole UI in two or more languages (en, fi)                                                                                                                                                                                                                                                                                                                      | 2      |
| Unit tests created and automated using Cypress                                                                                                                                                                                                                                                                                                                                 | 5      |
| Search filter for chat messages                                                                                                                                                                                                                                                                                                                                                | 3      |
| Use of pager when there are more than 10 matches to chat with                                                                                                                                                                                                                                                                                                                  | 2      |
| Dark mode switch which changes the theme of every element in the application                                                                                                                                                                                                                                                                                                   | 3      |
|                                                                                                                                                                                                                                                                                                                                                                          Total | 52     |

## Usage

- `npm run build` Compiles the TypeScript code and outputs them in the `/dist` directory

- `npm run tw:watch` Continually compile Tailwind to `/dist/public/styles/style.css` when changing .pug files

- `npx cypress open` Launches the Cypress client for testing

## Initial plan and ideation

![image](https://github.com/nibsuoogee/swipe-chat/assets/37696410/1a36d789-68d0-4c95-9f42-7466d1ac25f7)
