import { supabaseFetch } from '../utils/supabase';
import { createOrFetchUser, createCategory, createProject, createProjectMember, createTask } from '../utils/supabaseClient';

const runSeeder = async () => {
	try {

		// 0. Check if database has any data - if empty, don't run seeder
		console.log('Checking if database has any data...');
		const [existingCategories, existingUsers, existingProjects] = await Promise.all([
			supabaseFetch('/rest/v1/category', {
				method: 'GET',
				headers: { 'Prefer': 'count=exact' },
				useServiceRole: true,
			}),
			supabaseFetch('/rest/v1/users', {
				method: 'GET',
				headers: { 'Prefer': 'count=exact' },
				useServiceRole: true,
			}),
			supabaseFetch('/rest/v1/project', {
				method: 'GET',
				headers: { 'Prefer': 'count=exact' },
				useServiceRole: true,
			})
		]);

		const hasCategories = existingCategories && existingCategories.length > 0;
		const hasUsers = existingUsers && existingUsers.length > 0;
		const hasProjects = existingProjects && existingProjects.length > 0;

		if (!hasCategories && !hasUsers && !hasProjects) {
			console.log('Database is completely empty.');
		}

		console.log(`Database status: Categories: ${hasCategories ? existingCategories.length : 0}, Users: ${hasUsers ? existingUsers.length : 0}, Projects: ${hasProjects ? existingProjects.length : 0}`);

		// 1. Check if category table has data
		console.log('Checking if category table has data...');

		let createdCategories = [];
		let bugCategory;

		if (!hasCategories) {
			console.log('Category table is empty. Creating categories...');
			
			// Create categories from array
			const categories = [['Bug', 'red'], ['Feature', 'blue'], ['Refactor', 'green']];
			
			for (const [name, color] of categories) {
				const category = await createCategory(name, color);
				createdCategories.push(category);
				console.log(`Created category: ${name} with color ${color}`);
			}

			// Get the Bug category for our task
			bugCategory = createdCategories.find(cat => cat.name === 'Bug');
		} else {
			console.log('Category table already has data. Skipping category creation.');
			console.log(`Found ${existingCategories.length} existing categories.`);
			
			// Use existing categories
			createdCategories = existingCategories;
			bugCategory = existingCategories.find(cat => cat.name === 'Bug');
		}

		// 2. Check if users table has data
		console.log('Checking if users table has data...');
		console.log('existingUsers:', existingUsers);
		let userResponse;
		let userId, userEmail, userCreatedAt;

		if (!hasUsers) {
			console.log('Users table is empty. Creating demo user...');
			
			const demoEmail = 'tanleeyap2@gmail.com';
			const demoPassword = '123456';

			userResponse = await createOrFetchUser(demoEmail, demoPassword);

			userId = userResponse[0].id;
			userEmail = userResponse[0].email;
			userCreatedAt = userResponse[0].created_at;
			
			console.log('Demo user created:');
			console.log('User Id:', userId);
			console.log('User Email:', userEmail);
			console.log('User Created At:', userCreatedAt);
		} else {
			console.log('Users table already has data. Skipping user creation.');
			console.log(`Found ${existingUsers.length} existing users.`);
			
			// Use the first existing user for demo purposes
			const firstUser = existingUsers[0];
			userId = firstUser.id;
			userEmail = firstUser.email;
			userCreatedAt = firstUser.created_at;
			
			console.log('Using existing user:');
			console.log('User Id:', userId);
			console.log('User Email:', userEmail);
			console.log('User Created At:', userCreatedAt);
		}

		// 3. Check if project exists
		console.log('Checking if project table has data...');

		let project1;
		let projectId;

		if (!hasProjects) {
			console.log('Project table is empty. Creating project...');
			
			// Check if userEmail and userId are empty
			if (!userEmail || !userId) {
				console.log('UserEmail or userId is empty. Getting first user from users table...');
				
				const usersForProject = await supabaseFetch('/rest/v1/users?limit=1', {
					method: 'GET',
					useServiceRole: true,
				});

				if (usersForProject && usersForProject.length > 0) {
					userId = usersForProject[0].id;
					userEmail = usersForProject[0].email;
					console.log('Using user for project creation:');
					console.log('User Id:', userId);
					console.log('User Email:', userEmail);
				} else {
					throw new Error('No users found in the database to create project');
				}
			}

			const projectData = {
				name: 'My New Project',
				selectedUsers: [],
				createdBy: userEmail,
				creatorId: userId
			};
		
			project1 = await createProject(projectData);

			console.log('Project created:', project1);
			projectId = project1.id;
		} else {
			console.log('Project table already has data. Skipping project creation.');
			console.log(`Found ${existingProjects.length} existing projects.`);
			
			// Use the first existing project
			const firstProject = existingProjects[0];
			projectId = firstProject.id;
			
			console.log('Using existing project:');
			console.log('Project Id:', projectId);
			console.log('Project Name:', firstProject.name);
		}

		// 4. Add user to project
		if(projectId && userId) {
			// Check if project member already exists
			console.log('Checking if project member already exists...');
			const existingMembership = await supabaseFetch(`/rest/v1/project_members?projectId=eq.${projectId}&userId=eq.${userId}`, {
				method: 'GET',
				headers: {
					'Prefer': 'count=exact'
				},
				useServiceRole: true,
			});

			if (existingMembership && existingMembership.length > 0) {
				console.log('Project member already exists. Skipping membership creation.');
				console.log('Existing membership:', existingMembership[0]);
			} else {
				console.log('No existing project member found. Creating membership...');
				const membership = await createProjectMember(
					projectId, // projectId
					userId  // userId
				);

				console.log('membership:', membership);
			}
		}

		const taskData = {               
			title: 'Fix login bug',				// title
			description: 'User reported issues with login functionality. Need to investigate and fix.', // description
			status: 'todo',						// status
			assignee: userId,					// assignee
			due: '2024-07-15T23:59:59.000Z',	// dueDate
			category: bugCategory?.id,			// categoryId (use optional chaining in case bugCategory is not found)
			projectId: projectId,				// projectId
		}
		
		// 5. Create a todo task
		const task1 = await createTask(taskData);

		console.log('Task created:', task1);

		console.log('Seeder completed 🎉');
	} catch (err) {
		console.error('Seeder failed ❌', err);
	}
};

runSeeder();
