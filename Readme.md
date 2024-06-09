# Real-Time Chat App

This is a real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) along with Chakra UI for styling. The application allows users to communicate with each other in real-time.

## Features

- Real-time messaging
- Group chat
- User authentication
- Emoji support
- Personal chat
- Notifications

## Technologies Used

- **Frontend**: React, Chakra UI.
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io

## Installation

To run this application locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ChaudharySurajSingh/Real-Time-Chat-App.git
    cd Real-Time-Chat-App
    ```

2. **Install dependencies:**

    Install backend dependencies:
    ```bash
    cd backend
    npm install
    ```

    Install frontend dependencies:
    ```bash
    cd ../frontend
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the `backend` directory and add the following environment variables:
    ```env
    PORT= your desired port
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

4. **Start the application:**

    Start the backend:
    ```bash
    cd backend
    npm start
    ```

    Start the frontend:
    ```bash
    cd ../frontend
    npm start
    ```

    The application will be running on `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend.

## Usage

1. Open your browser and navigate to `http://localhost:5000`.
2. Register a new account or log in with an existing one.
3. Start chatting with your friends in real-time!

## Contributing

Contributions are welcome! If you have any suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any questions or feedback, please contact:

- Suraj Singh Chaudhary
- https://github.com/ChaudharySurajSingh

