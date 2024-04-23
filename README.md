# Contacts App

The Contacts app is a simple Angular application for managing contacts. It allows users to view, add, update, and delete contacts.

## Features

- View a list of contacts
- Add a new contact
- Update an existing contact
- Delete a contact
- Progressive Web App (PWA) support
- Offline functionality with service workers
- Manifest file for a web app-like experience

## Installation for client and server

1. Clone the repository:

   ```bash
   git clone https://github.com/amircabili/contact-list-project-full-stack-client-side.git
Navigate to the project directory:

bash
Copy code
cd contact-list-project-full-stack-client-side
Install dependencies:

bash
Copy code
npm install
Usage
Start the Angular Development Server:

bash
Copy code
ng serve
Open your browser and navigate to http://localhost:4200/ to view the app.

Start the Node.js Server (Backend):

Before running the Angular app, you need to start the Node.js server to provide the backend functionality.

bash
Copy code
git clone https://github.com/amircabili/contact-list-project-full-stack-server.git
cd contact-list-project-full-stack-server
npm install
node server.js
The server will be running on http://localhost:3000/.

Configuration
Modify the environment.ts file to configure backend API endpoints and other environment-specific settings.
Deployment
Build the app for production:

bash
Copy code
ng build --prod
Deploy the generated dist folder to your web server or hosting platform.

Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please create an issue or submit a pull request.

License
