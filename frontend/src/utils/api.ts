import { getCurrentUserToken, withUserInfo } from './userHelpers';

const API_BASE_URL = 'http://localhost:4000'; // Update to match backend port

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('url:', url);

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };
    console.log('options:', options);
    try {
        console.log('config:', config);
        const response = await fetch(url, config);
        console.log('response:', response);
        console.log('response.status:', response.status);
        console.log('response.ok:', response.ok);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('Error data from server:', errorData);
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('Response JSON data:', jsonData);
        return jsonData;
    } catch (error) {
        console.error('API call failed:', error);
        console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
};

// Helper function to make authenticated API calls
export const authenticatedApiCall = async (url: string, options: RequestInit = {}) => {
    const token = getCurrentUserToken();
    
    if (!token) {
        throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    return apiCall(url, {
        ...options,
        headers,
    });
};

// ------------- authController -------------//
export const loginUser = async (email: string, password: string) => {
    console.log('email:', email);
    console.log('password:', password);
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

export const registerUser = async (email: string, password: string) => {
    console.log('email:', email);
    console.log('password:', password);
    return apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

export const getAllUsers = async () => {
    return apiCall('/auth/all-users', {
        method: 'GET',
    });
    // return apiCall('/rest/v1/users', {
    //     method: 'GET',
    //     headers: {
    //         'Prefer': 'count=exact'
    //     }
    // });
};

// ------------- projectsAndTasksController -------------//

// Example function to create a project with user information
export const createProject = async (projectData: {
    name: string;
    selectedUsers: string[];
    created_by: string;
    creatorId: string;
    created_at: string;
}) => {
    return apiCall('/projects-and-tasks/project/create-project', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
}; 

export const updateProject = async (projectData: {
    id: string;
    name: string;
    selectedUsers: string[];
    created_by: string;
    creatorId: string;
    created_at: string;
}) => {
    return apiCall('/projects-and-tasks/project/update-project', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
};

export const deleteProject = async (projectId: string) => {
    return apiCall(`/projects-and-tasks/project/${projectId}/delete`, {
        method: 'POST',
    });
};

// In your frontend api.ts
export const getUserProjects = async (userId: string) => {
    return apiCall(`/projects-and-tasks/user/${userId}/projects`, {
        method: 'GET',
    });
};

export const getProjectUsers = async (projectId: string) => {
    return apiCall(`/projects-and-tasks/project/${projectId}/users`, {
        method: 'GET',
    });
};

export const getProjectTasks = async (projectId: string) =>  {
    return apiCall(`/projects-and-tasks/project/${projectId}/tasks`, {
        method: 'GET',
    });
};

// Example function to create a task with user information
export const createTask = async (taskData: {
    title: string;
    description: string;
    status: string;
    assignee?: string;
    due?: string;
    category?: string;
    projectId?: string;
}) => {
    // Automatically add user information to the task
    
    return apiCall(`/projects-and-tasks/project/${taskData.projectId}/create-task`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

export const updateTask = async (taskData: {
    id: string;
    title: string;
    description: string;
    status: string;
    assignee?: string;
    due?: string;
    category?: string;
    projectId?: string;
}) => {
    return apiCall(`/projects-and-tasks/project/${taskData.projectId}/update-task`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

export const deleteTask = async (taskId: string) => {
    return apiCall(`/projects-and-tasks/project/${taskId}/delete-task`, {
        method: 'POST',
    });
};

export const updateDraggedTask = async (taskId: string, status: string) => {
    return apiCall(`/projects-and-tasks/project/update-dragged-task`, {
        method: 'POST',
        body: JSON.stringify({ taskId, status }),
    });
};

export const getCategories = async () => {
    return apiCall('/projects-and-tasks/categories', {
        method: 'GET',
    });
};



