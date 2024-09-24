# ChatApp - Real-Time Messaging Application

**ChatApp** is a fully functional, real-time chat application built using React.js and Firebase. It provides users with a seamless messaging experience, allowing them to communicate via text or images and manage their profiles. The application features a clean, responsive design and includes key functionalities such as user authentication, real-time messaging, and profile management.

## Features
- **User Authentication**: Sign up and log in securely using Firebase Authentication.
- **Real-Time Messaging**: Send text messages and images in real-time using Firebase Firestore.
- **Responsive Chat Interface**: View and interact with conversations in a responsive layout. The chat page includes:
  - **Left Sidebar**: Search for users by username and view your list of chats.
  - **Main Chat Area**: Display messages, send text or images, and engage in real-time conversations.
  - **Right Sidebar**: View details of the current chat participant and see a gallery of shared images.
- **Profile Management**: Update your profile (name, avatar) in profile page
- **Image Uploading**: Easily upload images using Firebase Storage and the Firebase Web Modular API.
- **Notifications**: Success and error notifications are shown using `react-toastify`.
- **Optimized Performance**: Leveraged React hooks like `useState`, `useRef`, and `useEffect` for state management and responsiveness.
- **Efficient Data Storage**: Used Firebase Firestore to store messages and user data in a NoSQL format, ensuring efficient real-time data retrieval.

## Technologies Used
- **Frontend**: React.js, React Router DOM, React Hook Form, Context API, Firebase Web Modular API.
- **Backend**: Firebase Authentication, Firestore, Firebase Storage.
- **Styling**: CSS Grid, Flexbox, Media Queries for responsive design.
- **Notifications**: React Toastify.
- **Data Operations**: Utilized standard Firebase functions (`doc`, `setDoc`, `addDoc`, `getDoc`, `updateDoc`) to handle Firestore queries, alongside array manipulation methods like `map`, `sort`, and `forEach`.

## Firebase Firestore Database Design
The NoSQL database is structured for scalability and efficient querying. It includes the following collections:

1. **Users Collection**: Stores user profiles with fields such as `id`, `username`,`email`,`name`, `bio`, and `avatar`.
2. **Chats Collection**: Each document identified by user id and contains chatsData array of chats for each user. chatsData is an array of objects. Each object has information about chat like the `messageId`, `rid` (receiver ID), `lastMessage`, and `updatedAt` timestamp.
3. **Messages Collection**: Stores the chat messages for each conversation. Each document is identified by uniques `messageId` and contains messages which is an array of objects. Each object has information of a message: `sId` (sender ID), `text` (message content), and `createdAt` timestamp.


## Pages
1. **Login**: Includes both login and sign-up forms using Firebase Authentication and `react-hook-form`.
2. **Profile**: Allows users to update their name and avatar.
3. **Chat**: The core page for messaging, consisting of a left sidebar (chats list and search), main chat area (messages and image sharing), and right sidebar (participant details and media gallery).

## Installation
To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/amir-amirov/full-stack-chatapp.git
   ```
   
2. Navigate to the project directory:
   ```bash
   cd chat-app
   ```
   
3. Install dependencies:
   ```bash
   npm install
   ```
   
4. Run the development server:
   ```bash
   npm start
   ```

The app should now be running at `http://localhost:3000`.


## Conclusion
This real-time chat app demonstrates how React.js can be integrated with Firebase to create dynamic, scalable applications. With its robust authentication, real-time messaging, and image handling capabilities.