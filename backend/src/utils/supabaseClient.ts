import { supabaseFetch } from './supabase';

const ensureUUID = (id: string): string => {
	// UUID regex pattern
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	
	// Check if already a valid UUID
	if (uuidRegex.test(id)) {
		return id;
	}
	
	// If it's a valid UUID but without dashes, format it
	if (/^[0-9a-f]{32}$/i.test(id)) {
		return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
	}
	
	// Log warning and return the original - let the database validation handle it
	console.warn('ID is not in UUID format:', id);
	return id;
};

// Helper to validate email format
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const createOrFetchUser = async (email: string, password: string) => {
    
    const userResponse = await supabaseFetch(`/rest/v1/users?email=eq.${email}`, {
        method: 'GET',
        headers: {
            'Prefer': 'count=exact'
        }
    });

    console.log('isEmailRegistered userResponse', userResponse);
    
    // If we get any results, the email exists in users table
    if (userResponse && Array.isArray(userResponse) && userResponse.length > 0) {
        console.log('User already exists');
    }
    else {
        try {
            const authResponse = await supabaseFetch('/auth/v1/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    email: email?.trim().toLowerCase(),
                    password: password,
                }),
            });

            console.log('Signup response:', authResponse);
            
            if (authResponse?.error) {
                throw new Error(authResponse.error.message || 'Failed to create account');
            }

            if (!authResponse?.user?.id) {
                console.error('Unexpected auth response:', authResponse);
                throw new Error('Failed to create account: No user ID returned');
            }

            // Create user profile
            const userId = authResponse.user.id;
            const formattedUserId = ensureUUID(userId);
            
            const usersTableData = {
                id: formattedUserId,
                email: email || null,
                // created_at: new Date().toISOString()
            };

            console.log('Creating user profile:', { ...usersTableData, id: '***' });

                // Ensure the ID is in valid UUID format
            const formattedId = ensureUUID(usersTableData.id);
            
            // Create a new userData object with the formatted ID
            const formattedUserData = {
                ...usersTableData,
                id: formattedId
            };
            
            // Check if formatting actually produced a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(formattedId)) {
                console.error('Could not convert to valid UUID format:', usersTableData.id, '→', formattedId);
                throw new Error('User ID must be in valid UUID format');
            }

            console.log('Sending formatted user data to API:', formattedUserData);
            
            return await supabaseFetch('/rest/v1/users', {
                method: 'POST',
                body: JSON.stringify(formattedUserData),
                headers: {
                    'Prefer': 'return=representation'
                },
                useServiceRole: true,
            });
        }
        catch (error) {
            console.error('Create or fetch user error:', error);
            throw error;
        }
    }
}

export const login = async (email: string, password: string) => {
	if (!email || !isValidEmail(email.trim())) {
		throw new Error('Invalid email address format');
	}
	
	if (!password) {
		throw new Error('Password is required');
	}
	
	try {
		console.log('Attempting login with:', email);
		
		// Use the sign-in endpoint
		const authResponse = await supabaseFetch('/auth/v1/token?grant_type=password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Prefer': 'return=minimal'
			},
			body: JSON.stringify({
				email: email.trim().toLowerCase(),
				password: password
			})
		});

		console.log('Auth response:', authResponse);

		if (!authResponse || authResponse.error) {
			throw new Error(authResponse?.error?.message || 'Invalid email or password');
		}

		// Get user data from the session
		const userResponse = await supabaseFetch('/auth/v1/user', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${authResponse.access_token}`
			}
		});

		if (!userResponse || !userResponse.id) {
			throw new Error('Failed to get user data');
		}

        var userId = userResponse.id;
        userId = ensureUUID(userId);
        console.log('userId', userId);
		// Get additional user profile from users table
		const userProfile = await supabaseFetch(`/rest/v1/users?id=eq.${userId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${authResponse.access_token}`
			}
		});

		if (!userProfile || !userProfile[0]) {
			throw new Error('User profile not found');
		}

		return {
			...userProfile[0],
			access_token: authResponse.access_token,
			refresh_token: authResponse.refresh_token
		};
	} catch (error) {
		console.error('Login error:', error);
		throw error;
	}
};

export const getAllUsers = async () => {
    const users = await supabaseFetch('/rest/v1/users', {
        method: 'GET',
        headers: {
            'Prefer': 'count=exact'
        }
    });
    return users;
};

export const getCategories = async () => {
	try {
		console.log('Fetching all categories');

		const response = await supabaseFetch('/rest/v1/category?select=*', {
			method: 'GET',
			useServiceRole: true,
		});

		console.log('Categories fetched successfully:', response);
		return response;
	} catch (error) {
		console.error('Get categories error:', error);
		throw error;
	}
};

export const createCategory = async (name: string, color: string = 'gray') => {
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		throw new Error('Category name is required and must be a non-empty string');
	}

	const validColors = ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'];
	const colorToUse = validColors.includes(color) ? color : 'gray';

	if (color !== colorToUse) {
		console.warn(`Invalid color "${color}" provided, using default "gray"`);
	}

	try {
		console.log('Creating category:', { name: name.trim(), color: colorToUse });

		const categoryData = {
			name: name.trim(),
			color: colorToUse,
			created_at: new Date().toISOString()
		};

		const response = await supabaseFetch('/rest/v1/category', {
			method: 'POST',
			body: JSON.stringify(categoryData),
			headers: {
				'Prefer': 'return=representation'
			},
			useServiceRole: true,
		});

		console.log('Category created successfully:', response);
		return response[0]; // Supabase returns an array, we want the first item
	} catch (error) {
		console.error('Create category error:', error);
		throw error;
	}
};

export const createProject = async (projectData: any) => {
    const { name, selectedUsers, created_by, creatorId, created_at } = projectData;

    console.log('supabaseClient createProject projectData:', projectData);
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		throw new Error('Project name is required and must be a non-empty string');
	}

	if (!created_by || typeof created_by !== 'string' || created_by.trim().length === 0) {
		throw new Error('Created by field is required and must be a non-empty string');
	}

	if (!creatorId || typeof creatorId !== 'string') {
		throw new Error('Creator ID is required and must be a valid string');
	}

	// Validate creatorId is a valid UUID format
	const formattedCreatorId = ensureUUID(creatorId);
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(formattedCreatorId)) {
		throw new Error('Creator ID must be in valid UUID format');
	}

	try {
		console.log('Creating project:', { 
			name: name.trim(), 
			created_by: created_by.trim(), 
			creatorId: formattedCreatorId, 
		});

		const projectData = {
			name: name.trim(),
			created_by: created_by.trim(),
			creatorId: formattedCreatorId,
			created_at: created_at
		};

		const response = await supabaseFetch('/rest/v1/project', {
			method: 'POST',
			body: JSON.stringify(projectData),
			headers: {
				'Prefer': 'return=representation'
			},
			useServiceRole: true,
		});

        const projectId = response[0].id;
        console.log('projectId', projectId);
        console.log('selectedUsers', selectedUsers);
        if(selectedUsers.length > 0 && projectId) {
            for(const userId of selectedUsers) {
                console.log('Creating project member:', { projectId, userId });
                await createProjectMember(projectId, userId);
            }
        }

		console.log('Project created successfully:', response);
		return response[0]; // Supabase returns an array, we want the first item
	} catch (error) {
		console.error('Create project error:', error);
		throw error;
	}
};

export const updateProject = async (projectData: any) => {
    const { id, name, selectedUsers, created_by, creatorId, created_at } = projectData;
    console.log('supabaseClient updateProject projectData:', projectData);

    if (!id || typeof id !== 'string') {
        throw new Error('Project ID is required and must be a valid string');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Project name is required and must be a non-empty string');
    }

    if (!created_by || typeof created_by !== 'string' || created_by.trim().length === 0) {
        throw new Error('Created by field is required and must be a non-empty string');
    }

    if (!creatorId || typeof creatorId !== 'string') {
        throw new Error('Creator ID is required and must be a valid string');
    }
    
    if (!created_at || typeof created_at !== 'string') {
        throw new Error('Created at field is required and must be a valid string');
    }

    try {
        console.log('Updating project:', { 
            id: id,
            name: name.trim(),
            created_by: created_by.trim(),
            creatorId: creatorId,
            created_at: created_at
        });

        const projectData = {
            id: id,
            name: name.trim(),
            created_by: created_by.trim(),
            creatorId: creatorId,
            created_at: created_at
        };

        const updatedProjectResponse = await supabaseFetch(`/rest/v1/project?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: name.trim(),
                created_by: created_by.trim(),
                creatorId: creatorId,
                created_at: created_at
            }),
            headers: {
                'Prefer': 'return=representation'
            },
            useServiceRole: true,
        });

        console.log('updatedProjectResponse', updatedProjectResponse);
        

        const projectId = updatedProjectResponse[0].id;
        console.log('projectId', projectId);
        console.log('selectedUsers', selectedUsers);
        if(selectedUsers.length > 0 && projectId) {
            
            // Get all existing members for the project
            const existingMembers = await supabaseFetch(`/rest/v1/project_members?projectId=eq.${projectId}`, {
                method: 'GET',
                headers: {
                    'Prefer': 'count=exact'
                },
                useServiceRole: true,
            });
            
            // Extract user IDs from existing members
            const existingUserIds = existingMembers.map(member => member.userId);
            
            // Remove users who are no longer selected
            for (const member of existingMembers) {
                if (!selectedUsers.includes(member.userId)) {
                    console.log('Removing project member:', { projectId, userId: member.userId });
                    await deleteProjectMember(projectId, member.userId);
                }
            }
            
            // Add users who are newly selected
            for (const userId of selectedUsers) {
                if (!existingUserIds.includes(userId)) {
                    console.log('Creating project member:', { projectId, userId });
                    await createProjectMember(projectId, userId);
                }
            }
            
        }

        console.log('Project updated successfully:', updatedProjectResponse, 'selectedUsers', selectedUsers);
        return updatedProjectResponse[0]; // Supabase returns an array, we want the first item
    } catch (error) {
        console.error('Update project error:', error);
        throw error;
    }
}


export const deleteProject = async (projectId: string) => {
    try {
        console.log('Deleting project and all related data:', projectId);
        
        // First, delete all project members
        console.log('Deleting project members...');
        await supabaseFetch(`/rest/v1/project_members?projectId=eq.${projectId}`, {
            method: 'DELETE',
            useServiceRole: true,
        });
        
        // Then delete all tasks for this project
        console.log('Deleting project tasks...');
        await supabaseFetch(`/rest/v1/task?project_id=eq.${projectId}`, {
            method: 'DELETE',
            useServiceRole: true,
        });
        
        // Finally, delete the project itself
        console.log('Deleting project...');
        const response = await supabaseFetch(`/rest/v1/project?id=eq.${projectId}`, {
            method: 'DELETE',
            headers: {
                'Prefer': 'return=representation'
            },
            useServiceRole: true,
        });
        
        console.log('Project and all related data deleted successfully');
        return response[0] || { id: projectId, deleted: true };
    } catch (error) {
        console.error('Delete project error:', error);
        throw error;
    }
}

export const createProjectMember = async (projectId: string, userId: string) => {
	if (!projectId || typeof projectId !== 'string') {
		throw new Error('Project ID is required and must be a valid string');
	}

	if (!userId || typeof userId !== 'string') {
		throw new Error('User ID is required and must be a valid string');
	}

	// Validate and format both IDs as UUIDs
	const formattedProjectId = ensureUUID(projectId);
	const formattedUserId = ensureUUID(userId);
	
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	
	if (!uuidRegex.test(formattedProjectId)) {
		throw new Error('Project ID must be in valid UUID format');
	}
	
	if (!uuidRegex.test(formattedUserId)) {
		throw new Error('User ID must be in valid UUID format');
	}

	try {
		console.log('Adding project member:', { 
			projectId: formattedProjectId, 
			userId: formattedUserId 
		});

		// Check if the member already exists to avoid duplicates
		const existingMember = await supabaseFetch(`/rest/v1/project_members?projectId=eq.${formattedProjectId}&userId=eq.${formattedUserId}`, {
			method: 'GET',
			headers: {
				'Prefer': 'count=exact'
			},
			useServiceRole: true,
		});

		if (existingMember && Array.isArray(existingMember) && existingMember.length > 0) {
			throw new Error('User is already a member of this project');
		}

		const memberData = {
			project_id: formattedProjectId, // String version
			user_id: formattedUserId,       // String version
			projectId: formattedProjectId,  // UUID version
			userId: formattedUserId         // UUID version
		};

		const response = await supabaseFetch('/rest/v1/project_members', {
			method: 'POST',
			body: JSON.stringify(memberData),
			headers: {
				'Prefer': 'return=representation'
			},
			useServiceRole: true,
		});

		console.log('Project member added successfully:', response);
		return response[0]; // Supabase returns an array, we want the first item
	} catch (error) {
		console.error('Create project member error:', error);
		throw error;
	}
};

export const deleteProjectMember = async (projectId: string, userId: string) => {
    const response = await supabaseFetch(`/rest/v1/project_members?projectId=eq.${projectId}&userId=eq.${userId}`, {
        method: 'DELETE',
        useServiceRole: true,
    });
    console.log('deleteProjectMember response', response);
    return response[0];
}

export const getUserProjects = async (userUuid: string) => {
	if (!userUuid || typeof userUuid !== 'string') {
		throw new Error('User UUID is required and must be a valid string');
	}

	// Validate and format user ID as UUID
	const formattedUserId = ensureUUID(userUuid);
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	
	if (!uuidRegex.test(formattedUserId)) {
		throw new Error('User UUID must be in valid UUID format');
	}

	try {
		console.log('Getting projects for user:', formattedUserId);

		// First, get all project IDs where user is a member
		const membershipData = await supabaseFetch(
			`/rest/v1/project_members?userId=eq.${formattedUserId}&select=projectId`,
			{
				method: 'GET',
				useServiceRole: true,
			}
		);

		if (!membershipData || membershipData.length === 0) {
			console.log('User is not a member of any projects');
			return [];
		}

		// Extract project IDs
		const projectIds = membershipData.map(member => member.projectId).filter(Boolean);
		
		if (projectIds.length === 0) {
			console.log('No valid project IDs found');
			return [];
		}

		console.log('Found project memberships:', projectIds);

		// Get project details for those IDs
		const projects = await supabaseFetch(
			`/rest/v1/project?id=in.(${projectIds.join(',')})&select=id,name,created_by,created_at,creatorId`,
			{
				method: 'GET',
				useServiceRole: true,
			}
		);

		console.log(`Found ${projects?.length || 0} projects for user`);
		return projects || [];
	} catch (error) {
		console.error('Get user projects error:', error);
		throw error;
	}
}; 

export const getProjectUsers = async (projectId: string) => {
    const users = await supabaseFetch(`/rest/v1/project_members?projectId=eq.${projectId}`, {
        method: 'GET',
        useServiceRole: true,
    });
    
    return users;
};

export const createTask = async (taskData: any) => {
    const { title, description, status, assigned_to, due_date, category_id, project_id } = taskData;
	if (!project_id || typeof project_id !== 'string') {
		throw new Error('Project ID is required and must be a valid string');
	}

	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		throw new Error('Task title is required and must be a non-empty string');
	}

	if (!description || typeof description !== 'string' || description.trim().length === 0) {
		throw new Error('Task description is required and must be a non-empty string');
	}

	// Validate status
	const validStatuses = ['todo', 'doing', 'done'];
	const statusToUse = validStatuses.includes(status) ? status : 'todo';

	if (status !== statusToUse) {
		console.warn(`Invalid status "${status}" provided, using default "todo"`);
	}

	// Validate and format project ID as UUID
	const formattedProjectId = ensureUUID(project_id);
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	
	if (!uuidRegex.test(formattedProjectId)) {
		throw new Error('Project ID must be in valid UUID format');
	}

	// Validate assignee ID if provided
	let formattedAssignedTo = null;
	if (assigned_to) {
		formattedAssignedTo = ensureUUID(assigned_to);
		if (!uuidRegex.test(formattedAssignedTo)) {
			throw new Error('Assignee ID must be in valid UUID format');
		}
	}

	// Validate category ID if provided
	let formattedCategoryId = null;
	if (category_id) {
		formattedCategoryId = ensureUUID(category_id);
		if (!uuidRegex.test(formattedCategoryId)) {
			throw new Error('Category ID must be in valid UUID format');
		}
	}

	// Validate due date if provided
	let formattedDueDate = null;
	if (due_date) {
		try {
			formattedDueDate = new Date(due_date).toISOString();
		} catch (error) {
			throw new Error('Due date must be a valid date format');
		}
	}

	try {
		console.log('Creating task:', { 
			title: title.trim(),
			description: description.trim(),
			project_id: formattedProjectId,
			status: statusToUse,
			assigned_to: formattedAssignedTo,
			dueDate: formattedDueDate,
			categoryId: formattedCategoryId
		});

		const taskData = {
			project_id: formattedProjectId,     // String version
			title: title.trim(),
			description: description.trim(),
			status: statusToUse,
			...(formattedAssignedTo && { assigned_to: formattedAssignedTo }),
			...(formattedDueDate && { due_date: formattedDueDate }),
			...(formattedCategoryId && { category_id: formattedCategoryId }),
			created_at: new Date().toISOString()
		};

		const response = await supabaseFetch('/rest/v1/task', {
			method: 'POST',
			body: JSON.stringify(taskData),
			headers: {
				'Prefer': 'return=representation'
			},
			useServiceRole: true,
		});

		console.log('Task created successfully:', response);
		return response[0]; // Supabase returns an array, we want the first item
	} catch (error) {
		console.error('Create task error:', error);
		throw error;
	}
};

export const updateTask = async (taskData: any) => {
    const { id, title, description, status, assigned_to, due_date, category_id, project_id } = taskData;
    const response = await supabaseFetch(`/rest/v1/task?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
        headers: {
            'Prefer': 'return=representation'
        },
        useServiceRole: true,
    });
    console.log('updateTask response', response);
    return response[0];
}

export const deleteTask = async (taskId: string) => {
    const response = await supabaseFetch(`/rest/v1/task?id=eq.${taskId}`, {
        method: 'DELETE',
        headers: {
            'Prefer': 'return=representation'
        },
        useServiceRole: true,
    });
    console.log('deleteTask response', response);
    return response[0];
}

export const updateDraggedTask = async (taskId: string, status: string) => {
    const response = await supabaseFetch(`/rest/v1/task?id=eq.${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: {
            'Prefer': 'return=representation'
        },
        useServiceRole: true,
    });
    console.log('updateDraggedTask response', response);
    return response[0];
}

export const getProjectTasks = async (projectId: string) => {
	if (!projectId || typeof projectId !== 'string') {
		throw new Error('Project ID is required and must be a valid string');
	}

	// Validate and format project ID as UUID
	const formattedProjectId = ensureUUID(projectId);
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	
	if (!uuidRegex.test(formattedProjectId)) {
		throw new Error('Project ID must be in valid UUID format');
	}

	try {
		console.log('Getting tasks for project:', formattedProjectId);

		// Get tasks with related data
		const tasks = await supabaseFetch(
			`/rest/v1/task?project_id=eq.${formattedProjectId}&select=id,title,description,status,assigned_to,due_date,category_id`,
			{
				method: 'GET',
				useServiceRole: true,
			}
		);

		if (!tasks || tasks.length === 0) {
			console.log('No tasks found for project');
			return [];
		}

		console.log(`Found ${tasks.length} tasks for project`);

		// Transform tasks to match frontend format
		const transformedTasks = await Promise.all(tasks.map(async (task: any) => {
			// Get assignee name if assigned
			let assigneeId = task.assigned_to;
			let assigneeName = null;
            let assigneeEmail = null;
			if (task.assigned_to) {
				try {
					const assigneeData = await supabaseFetch(
						`/rest/v1/users?id=eq.${task.assigned_to}&select=email`,
						{
							method: 'GET',
							useServiceRole: true,
						}
					);
					if (assigneeData && assigneeData.length > 0) {
						assigneeName = assigneeData[0].email.split('@')[0]; // Use email username as display name
                        assigneeEmail = assigneeData[0].email;
					}
				} catch (error) {
					console.warn('Failed to get assignee name:', error);
				}
			}

			// Get category name if assigned
			let categoryName = null;
            let categoryId = task.category_id;
			if (task.category_id) {
				try {
					const categoryData = await supabaseFetch(
						`/rest/v1/category?id=eq.${task.category_id}&select=name`,
						{
							method: 'GET',
							useServiceRole: true,
						}
					);
					if (categoryData && categoryData.length > 0) {
						categoryName = categoryData[0].name;
					}
				} catch (error) {
					console.warn('Failed to get category name:', error);
				}
			}

			// Format due date
			let formattedDueDate = null;
			if (task.due_date) {
				try {
					formattedDueDate = new Date(task.due_date).toISOString().split('T')[0]; // Format as YYYY-MM-DD
				} catch (error) {
					console.warn('Failed to format due date:', error);
				}
			}

			return {
				id: task.id,
				title: task.title,
				description: task.description,
				status: task.status,
                assigned_to: assigneeId,
				assignee: assigneeName,
                assigneeEmail: assigneeEmail,
				due_date: formattedDueDate,
				category: categoryName,
                category_id: categoryId
			};
		}));

		console.log('Transformed tasks:', transformedTasks);
		return transformedTasks;
	} catch (error) {
		console.error('Get project tasks error:', error);
		throw error;
	}
}; 
