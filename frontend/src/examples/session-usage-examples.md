# Session Management Usage Examples

## Overview
This document shows how to use the session management system that was just implemented. The system automatically stores user session data after login and provides easy access to user information throughout the app.

## What's Stored in Session
After successful login, the following user data is stored in localStorage and available via UserContext:
- `id`: User's unique identifier
- `email`: User's email address  
- `created_at`: Account creation timestamp
- `access_token`: JWT token for API authentication
- `refresh_token`: Token for refreshing sessions

## Using User Context in Components

### Basic Usage
```tsx
import { useUser } from '../contexts/UserContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useUser();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <p>User ID: {user.id}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Checking Authentication Status
```tsx
const { isAuthenticated } = useUser();

if (isAuthenticated) {
  // User is logged in
} else {
  // User is not logged in
}
```

## Using User Helper Functions

### Getting Current User Info
```tsx
import { getCurrentUserId, getCurrentUserEmail, getCurrentUserToken } from '../utils/userHelpers';

// Get user ID for API calls
const userId = getCurrentUserId(); // Returns: "5507c992-0a54-4a1d-bf83-1c6cf3710295"

// Get user email
const email = getCurrentUserEmail(); // Returns: "tanbeelian123@gmail.com"

// Get access token for authenticated API calls
const token = getCurrentUserToken(); // Returns: JWT token string
```

### Adding User Info to Data
```tsx
import { withUserInfo } from '../utils/userHelpers';

// When creating a task
const newTask = {
  title: "Fix bug in login",
  description: "User reported login issues",
  status: "todo",
  due: "2024-06-30"
};

// Automatically add user information
const taskWithUser = withUserInfo(newTask);
// Result: {
//   title: "Fix bug in login",
//   description: "User reported login issues", 
//   status: "todo",
//   due: "2024-06-30",
//   created_by: "tanbeelian123@gmail.com",
//   user_id: "5507c992-0a54-4a1d-bf83-1c6cf3710295"
// }
```

## Making Authenticated API Calls

### Using the API Helper
```tsx
import { createTask, createProject, authenticatedApiCall } from '../utils/api';

// Create a task (user info automatically added)
const handleCreateTask = async () => {
  try {
    const newTask = await createTask({
      title: "New Task",
      description: "Task description",
      status: "todo",
      category: "Development"
    });
    console.log('Task created:', newTask);
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};

// Create a project (user info automatically added)
const handleCreateProject = async () => {
  try {
    const newProject = await createProject({
      name: "My New Project",
      description: "Project description",
      is_public: true
    });
    console.log('Project created:', newProject);
  } catch (error) {
    console.error('Failed to create project:', error);
  }
};

// Make any authenticated API call
const handleCustomApiCall = async () => {
  try {
    const result = await authenticatedApiCall('/api/custom-endpoint', {
      method: 'POST',
      body: JSON.stringify({ some: 'data' })
    });
    console.log('API result:', result);
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

## Protected Routes
The `ProtectedRoute` component automatically redirects unauthenticated users to login:

```tsx
// In App.tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Example: Dashboard Task Creation
Here's how you might modify the dashboard to create tasks with user information:

```tsx
import { useUser } from '../contexts/UserContext';
import { createTask } from '../utils/api';

const Dashboard = () => {
  const { user } = useUser();
  
  const handleCreateTask = async (taskData) => {
    try {
      // User information is automatically added by createTask()
      const newTask = await createTask({
        title: taskData.title,
        description: taskData.description,
        status: 'todo',
        assignee: taskData.assignee,
        due: taskData.due,
        category: taskData.category,
        projectId: selectedProject
      });
      
      // Update local state with new task
      setTasks(prev => [...prev, newTask]);
      
      toast({
        title: 'Task Created',
        description: `Task "${newTask.title}" created successfully`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        status: 'error'
      });
    }
  };
  
  return (
    // Your dashboard JSX
  );
};
```

## Session Persistence
- Session data is automatically saved to localStorage when user logs in
- Session data is automatically loaded when app starts
- Session data is automatically cleared when user logs out
- If localStorage data is corrupted, it's automatically cleared

## Security Notes
- Access tokens are stored in localStorage (consider using httpOnly cookies for production)
- Tokens should be validated on the server for each API call
- Consider implementing token refresh logic for long-lived sessions
- Always validate user permissions on the server side 