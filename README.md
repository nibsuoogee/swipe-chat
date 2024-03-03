# Swipe Chat

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
