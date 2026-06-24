# LinkedIn Clone - Backend API Documentation

This document serves as the guide for the React frontend to integrate with the backend API.

## General Information

- **Base URL**: `http://localhost:5000` (or the configured `PORT`)
- **API Prefix**: `/api`
- **Response Format**: All responses follow a standardized JSON format:
  - **Success Response**:
    ```json
    {
      "success": true,
      "message": "Success message description",
      "data": {}
    }
    ```
  - **Error Response**:
    ```json
    {
      "success": false,
      "message": "Error description",
      "errors": [] 
    }
    ```

---

## Authentication & Headers
The API supports authentication using JSON Web Tokens (JWT). Secure endpoints require the token to be sent in one of the following ways:
1. **HTTP Cookie**: The token is set in a cookie named `token` (automatically sent if `credentials: true` is configured in your Axios/fetch instance).
2. **Authorization Header**: 
   ```http
   Authorization: Bearer <token>
   ```

---

## API Endpoints Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Request Body | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | `{ name, email, password }` | Returns User object & sets token |
| **POST** | `/api/auth/login` | Login user | `{ email, password }` | Returns User object & sets token |
| **POST** | `/api/auth/logout` | Logout user | *None* | Clears cookie token |
| **POST** | `/api/auth/forgot-password` | Send password reset email | `{ email }` | |
| **POST** | `/api/auth/reset-password/:token` | Reset password using token | `{ password }` | |

---

### 2. User & Profile (`/api/users`)
*All endpoints under `/api/users` require authentication.*

| Method | Endpoint | Description | Request Body / Parameters | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/users/profile` | Get currently logged-in user profile | *None* | |
| **GET** | `/api/users/profile/:id` | Get specific user profile by ID | Path Param: `:id` | |
| **GET** | `/api/users/search` | Search for users by name | Query Param: `?q=name` | |
| **PUT** | `/api/users/profile` | Update profile information | `{ name, headline, about, location }` | |
| **POST** | `/api/users/profile-photo` | Upload profile picture | FormData: `image` (file) | |
| **POST** | `/api/users/cover-photo` | Upload cover photo | FormData: `image` (file) | |

#### Experiences (`/api/users/experience`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/experience` | Add new experience | `{ companyName, designation, startDate, endDate, description, currentCompany }` |
| **PUT** | `/api/users/experience/:id` | Update experience | `{ companyName, designation, startDate, endDate, description, currentCompany }` |
| **DELETE** | `/api/users/experience/:id` | Delete experience | *None* |

#### Education (`/api/users/education`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/education` | Add new education record | `{ collegeName, degree, fieldOfStudy, startDate, endDate, grade, description }` |
| **PUT** | `/api/users/education/:id` | Update education record | `{ collegeName, degree, fieldOfStudy, startDate, endDate, grade, description }` |
| **DELETE** | `/api/users/education/:id` | Delete education record | *None* |

#### Skills (`/api/users/skills`)
| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/skills` | Add a skill | `{ skillName }` |
| **DELETE** | `/api/users/skills/:id` | Remove a skill | *None* |
| **POST** | `/api/users/skills/:id/endorse` | Endorse a user's skill | *None* |

---

### 3. Posts & Feed (`/api/posts`)
*All endpoints require authentication.*

| Method | Endpoint | Description | Request Body / Parameters | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/posts/feed` | Get user home feed | *None* | Returns posts from user and connections |
| **GET** | `/api/posts/saved` | Get user saved posts | *None* | |
| **POST** | `/api/posts/` | Create a post | FormData: `content` (text), `image` (file, optional), `video` (file, optional) | |
| **PUT** | `/api/posts/:id` | Update a post | `{ content }` | |
| **DELETE** | `/api/posts/:id` | Delete a post | *None* | |
| **POST** | `/api/posts/:id/like` | Like/Unlike a post | *None* | Toggles status |
| **POST** | `/api/posts/:id/save` | Save a post | *None* | |
| **DELETE** | `/api/posts/:id/save` | Unsave a post | *None* | |

---

### 4. Comments (`/api/comments`)
*All endpoints require authentication.*

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/comments/:postId` | Add a comment | `{ commentText }` |
| **PUT** | `/api/comments/:id` | Edit a comment | `{ commentText }` |
| **DELETE** | `/api/comments/:id` | Delete comment | *None* |

---

### 5. Connections (`/api/connections`)
*All endpoints require authentication.*

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/connections` | Get user connections list | *None* |
| **GET** | `/api/connections/pending` | Get received pending connection requests | *None* |
| **POST** | `/api/connections/request` | Send a connection request | `{ recipientId }` |
| **PUT** | `/api/connections/request/:id/accept` | Accept a connection request | Path Param: `:id` (Request ID) |
| **PUT** | `/api/connections/request/:id/reject` | Reject a connection request | Path Param: `:id` (Request ID) |
| **DELETE** | `/api/connections/:id` | Remove a connection | Path Param: `:id` (Connection User ID) |

---

### 6. Companies (`/api/companies`)
*All endpoints require authentication.*

| Method | Endpoint | Description | Request Body / Parameters | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/companies` | Search for companies | Query Param: `?q=name` | |
| **GET** | `/api/companies/:id` | Get company details | Path Param: `:id` | |
| **POST** | `/api/companies` | Create a company | FormData: `logo` (file), `name`, `description`, `industry`, `website` | |
| **PUT** | `/api/companies/:id` | Update company info | FormData: `logo` (file, optional), `name`, `description`, `industry`, `website` | |
| **POST** | `/api/companies/:id/follow` | Follow/Unfollow company | Path Param: `:id` | Toggles status |

---

### 7. Jobs (`/api/jobs`)
*All endpoints require authentication.*

| Method | Endpoint | Description | Request Body / Parameters | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/jobs` | Search for jobs | Query Params: `?title=...&location=...` | |
| **GET** | `/api/jobs/applied` | Get jobs applied by the current user | *None* | |
| **GET** | `/api/jobs/:id` | Get job details | Path Param: `:id` | |
| **GET** | `/api/jobs/:id/applicants` | Get all applicants for a job | Path Param: `:id` | Restricted to job creator |
| **POST** | `/api/jobs` | Create/Post a job | `{ title, description, location, salary, skillsRequired, companyId }` | |
| **PUT** | `/api/jobs/:id` | Edit a job posting | `{ title, description, location, salary, skillsRequired }` | |
| **DELETE** | `/api/jobs/:id` | Delete a job posting | *None* | |
| **POST** | `/api/jobs/:id/apply` | Apply for a job | FormData: `resume` (file) | |

---

### 8. Real-time Messaging (`/api/messages`)
*All endpoints require authentication. WebSocket events can be initialized via socket.io.*

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/messages/conversations` | Get all conversations for current user | *None* |
| **GET** | `/api/messages/conversation/:conversationId` | Get messages inside a conversation | Path Param: `:conversationId` |
| **POST** | `/api/messages/send` | Send a message | `{ recipientId, messageText }` |
| **PUT** | `/api/messages/seen/:conversationId` | Mark conversation messages as read | Path Param: `:conversationId` |

---

### 9. Notifications (`/api/notifications`)
*All endpoints require authentication.*

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/notifications` | Get all notifications | *None* |
| **PUT** | `/api/notifications/mark-all-read` | Mark all notifications as read | *None* |
| **PUT** | `/api/notifications/:id/read` | Mark a specific notification as read | Path Param: `:id` |
| **DELETE** | `/api/notifications` | Clear all notifications | *None* |

---

## React Frontend Integration Tips

1. **Axios Client Setup**:
   Configure a global Axios client with `withCredentials: true` so the authentication cookie is automatically handled.
   ```javascript
   import axios from 'axios';

   const API = axios.create({
     baseURL: 'http://localhost:5000/api',
     withCredentials: true, // Crucial for cookie-based authentication
   });
   
   export default API;
   ```

2. **Handling Form Data**:
   For endpoints expecting file uploads (e.g. Profile Picture, Cover Photo, Job Apply with Resume, Create Post with Image/Video), ensure you use `FormData` and let the browser set the correct `Content-Type`.
   ```javascript
   const formData = new FormData();
   formData.append('image', selectedFile);
   
   await API.post('/users/profile-photo', formData, {
     headers: { 'Content-Type': 'multipart/form-data' }
   });
   ```
