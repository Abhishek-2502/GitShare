# GitShare 🌐

GitShare is a full-stack web application designed for seamless sharing and management of GitHub repositories among users. Built with a modern MERN (MongoDB, Express, React, Node.js) stack, it allows users to upload, manage, and view shared GitHub repositories in an intuitive UI.

---

## 📚 Table of Contents

* [Prerequisites](#prerequisites)
* [Setting Up GitHub OAuth App](#setting-up-github-oauth-app)
* [Backend Setup](#backend-setup)
* [Frontend Setup](#frontend-setup)
* [Docker Compose Setup](#docker-compose-setup)
* [Features](#features)
* [Technical Stack](#technical-stack)
* [Images](#images)
* [Usage](#usage)
* [License](#license)
* [Author](#author)

---

## Prerequisites

* Node.js (v16 or above recommended)
* MongoDB (local or cloud instance like MongoDB Atlas)
* npm 
* Git

## Setting Up GitHub OAuth App

To enable GitHub login for your application, you need to create a GitHub OAuth App. Follow these steps:

### Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers).

2. Under **"OAuth Apps"**, click **"New OAuth App"**.

3. Fill in the form:

   * **Application name**: `GitShare`
   * **Homepage URL**: `http://localhost:3000` (or your deployed frontend URL)
   * **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback` (must match your backend route)

4. Click **Register Application**.

### Step 2: Get Client Credentials

Once registered, you will see:

* **Client ID**
* **Client Secret** (click **Generate a new client secret**)

### Step 3: Add to `.env` in Backend

Update your `.env` file in the `backend/` folder:

```
GITHUB_CLIENT_ID=yourGitHubClientID
GITHUB_CLIENT_SECRET=yourGitHubClientSecret
```

![OAuth](images/oauth.png)

---

## Backend Setup

1. **Clone the Repository**

```bash
git clone https://github.com/Abhishek-2502/gitshare
```

2. **Navigate to the Backend Directory**

```bash
cd gitshare/backend
```

3. **Install Dependencies**

```bash
npm install
```

4. **Set Environment Variables**
   Create a `.env` file with the following:

```
GITHUB_CLIENT_ID=yourGitHubClientID
GITHUB_CLIENT_SECRET=yourGitHubClientSecret
SESSION_SECRET=yourSecretHere
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
MONGO_URI=mongodb+srv://username:password@clustername.xxxx.mongodb.net/gitshare?retryWrites=true&w=majority
```

5. **Run the Server**

```bash
npm start
```

---

## Frontend Setup

1. **Navigate to the Frontend Directory**

```bash
cd ../frontend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Set Environment Variables**
   Create a `.env` file with the following:

```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FRONTEND_URL=http://localhost:3000
```

4. **Run the React App**

```bash
npm start
```

5. **Access the Web App**
   Open your browser and go to:

```
http://localhost:3000
```

---

## Docker Compose Setup

You can run the entire project (frontend + backend) using Docker Compose.

### Prerequisites:

* Docker
* Docker Compose

### Steps:

1. Clone the repository:

```bash
git clone https://github.com/YourUsername/gitshare
cd gitshare
```

2. Create a `.env` file in the backend directory:

```env
GITHUB_CLIENT_ID=yourGitHubClientID
GITHUB_CLIENT_SECRET=yourGitHubClientSecret
SESSION_SECRET=yourSecretHere
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
MONGO_URI=mongodb+srv://userna,e:password@clustername.xxxx.mongodb.net/gitshare?retryWrites=true&w=majority
```

3. Create a `.env` file in the frontend directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FRONTEND_URL=http://localhost:3000
```

4. Run the containers from root directory:

```bash
docker-compose up --build
```

5. Access the app at:

```
Frontend: http://localhost:3000  
Backend API: http://localhost:5000
```

> To stop and remove containers:

```bash
docker-compose down
```

---

## ✨ Features

* **User Authentication**: Secure login and signup.
* **Repository Sharing**: Share GitHub repository links with descriptions and tags.
* **Manage Repositories**: View, edit, or delete your shared repositories.
* **Explore Others’ Repos**: Discover repositories shared by others.
* **Responsive UI**: Works smoothly on desktop and mobile.

---

## 🛠 Technical Stack

**Frontend**:

* React.js
* Tailwind CSS
* Vanta.js
* Axios for API requests

**Backend**:

* Node.js
* Express.js
* MongoDB with Mongoose
* JWT for authentication

**DevOps**:

* Docker
* Docker-Compose
* Jenkins
* GCP

---

## 🖼️ Images

![Home](images/home.png)
![Sharing](images/sharing.png)
![Shared](images/shared.png)

---

## 🧩 Usage

1. **Register / Login**: Create an account or log in.
2. **Share a Repository**: Enter a GitHub URL, add a description and tags.
3. **Manage Your Repositories**: Update or remove your shared repos anytime.
4. **Browse & Explore**: View repositories shared by others and get inspired!

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Author

**Abhishek Rajput**



