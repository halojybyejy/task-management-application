import React, { useState, useEffect } from 'react';
import {
	Box, Button, Flex, Heading, IconButton, Select, Text, VStack, HStack, Avatar, useDisclosure, Drawer, DrawerOverlay, 
	DrawerContent, DrawerHeader, DrawerBody, FormControl, FormLabel, Input, Textarea, DrawerFooter, Menu, MenuButton, 
	MenuList, MenuItem, Tag, TagLabel, Checkbox, useToast
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { getUserProjects, getProjectTasks, getAllUsers, getProjectUsers, getCategories,
	createProject, updateProject, deleteProject,
	createTask, updateTask, deleteTask, updateDraggedTask } from '../utils/api';
import { getCurrentUser } from '../utils/userHelpers';


interface allUsers {
	id: string;
	email: string;
}

interface Category {
	id: string;
	name: string;
	color: string;
	created_at: string;
}

interface Project {
	id: string;
	name: string;
	created_by: string;
	created_at: string;
	creatorId: string;
}

interface Task {
	id: string;
	title: string;
	description: string;
	status: string;
	assigned_to: string | null;
	assignee: string | null;
	assigneeEmail: string | null;
	due_date: string | null;
	category: string | null;
	category_id: string | null;
}

const statusColumns = [
	{ key: 'todo', label: 'To Do' },
	{ key: 'doing', label: 'Doing' },
	{ key: 'done', label: 'Done' },
];

// Remove hardcoded currentUser - we'll use the user from context

  
const accent = 'teal.500';
const cardBg = 'white';
const red = 'red.500';
const pageBg = 'gray.50';
const highlightBg = 'gray.90';
const hoverBg = 'gray.100';
const textColor = 'gray.800';

const Dashboard: React.FC = () => {
	const toast = useToast();
	const [allUsers, setAllUsers] = useState<allUsers[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedProject, setSelectedProject] = useState('');
	const [tasks, setTasks] = useState<Task[]>([]);
	const [tasksLoading, setTasksLoading] = useState(false);
	const [taskStatus, setTaskStatus] = useState('');
	const [taskSliderMode, setTaskSliderMode] = useState<'create' | 'edit' | null>(null);
	const [projectSliderMode, setProjectSliderMode] = useState<'create' | 'edit' | null>(null);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [currentProjectUsers, setCurrentProjectUsers] = useState<string[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const { isOpen: isTaskSliderOpen, onOpen: onTaskSliderOpen, onClose: onTaskSliderClose } = useDisclosure();
	const { isOpen: isProjectSliderOpen, onOpen: onProjectSliderOpen, onClose: onProjectSliderClose } = useDisclosure();
	
	// Task form state
	const [taskForm, setTaskForm] = useState({
		title: '',
		description: '',
		dueDate: '',
		status: '',
		assigned_to: '',
		category_id: '',
	});

	// Project form state
	const [projectForm, setProjectForm] = useState({
		name: '',
	});

	const selectedProjectName = projects.find(p => p.id === selectedProject)?.name || 'Select Project';

	// Get user from context
	const { user, logout, isAuthenticated } = useUser();
	const navigate = useNavigate();

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		const fetchAllUsers = async () => {
			try {
				const allUsers = await getAllUsers();

				console.log('allUsers:', allUsers);
				setAllUsers(allUsers);
			} catch (error) {
				console.error('Failed to fetch users:', error);
			} finally {
				setLoading(false);
			}
		};
	
		fetchAllUsers();
	}, []);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const categoriesData = await getCategories();

				console.log('categories:', categoriesData);
				setCategories(categoriesData);
			} catch (error) {
				console.error('Failed to fetch categories:', error);
			}
		};
	
		fetchCategories();
	}, []);

	useEffect(() => {
		const fetchUserProjects = async () => {
			try {
				const userInfo = getCurrentUser(); // Get logged-in user info
				const userId = userInfo?.id;
				console.log('userId:', userId);
				
				if (!userId) {
					console.error('No user ID found');
					setProjects([]);
					return;
				}
				
				const userProjects = await getUserProjects(userId);
				setProjects(userProjects);
				
				// Auto-select first project if no project is selected and projects exist
				if (!selectedProject && userProjects && userProjects.length > 0) {
					const firstProject = userProjects[0];
					setSelectedProject(firstProject.id);

					const projectUsers = await getProjectUsers(firstProject.id);
					setCurrentProjectUsers(projectUsers);
					console.log('Auto-selected first project:', firstProject.name);
				}
			} catch (error) {
				console.error('Failed to fetch projects:', error);
			} finally {
				setLoading(false);
			}
		};
	
		fetchUserProjects();
	}, []); // Remove selectedProject dependency to prevent infinite loops

	// Fetch tasks when selectedProject changes
	useEffect(() => {
		loadProjectTasks(selectedProject);
	}, [selectedProject]);

	// Show loading or redirect if no user
	if (!user) {
		return null; // This will show briefly before redirect
	}
	
	const logoutAction = () => {
		logout();
	};

	const loadProjectTasks = async (projectId: string) => {
		if (!projectId) {
			setTasks([]);
			return;
		}

		setTasksLoading(true);
		try {
			console.log('Fetching tasks for project:', projectId);
			const projectTasks = await getProjectTasks(projectId);
			setTasks(projectTasks);
			console.log('Fetched tasks:', projectTasks);
			return projectTasks;
		} catch (error) {
			console.error('Failed to fetch project tasks:', error);
			setTasks([]);
			return [];
		} finally {
			setTasksLoading(false);
		}
	};

	const handleProjectSelection = async (projectId: string) => {
		setSelectedProject(projectId);

		const projectUsers = await getProjectUsers(projectId);
		console.log('projectUsers', projectUsers);
		setCurrentProjectUsers(projectUsers);
	};

	// Drag and drop logic (placeholder)
	const onDragStart = (e: React.DragEvent, taskId: string) => {
		e.dataTransfer.setData('taskId', taskId);
	};

	const onDrop = (e: React.DragEvent, status: string) => {
		const taskId = e.dataTransfer.getData('taskId');
		console.log('onDrop', taskId, status);

		const dragTask = updateDraggedTask(taskId, status);


		setTasks((prevTasks: Task[]) => prevTasks.map(t => t.id === taskId ? { ...t, status } : t));
	};

	const onDragOver = (e: React.DragEvent) => e.preventDefault();

	// Open slider for create/edit
	const openCreateTask = (status: string) => { 
		// Reset form for create mode
		setTaskForm({
			title: '',
			description: '',
			assigned_to: '',
			dueDate: '',
			category_id: '',
			status: status
		});
		setTaskSliderMode('create'); 
		setTaskStatus(status);
		setEditingTask(null); 
		onTaskSliderOpen(); 
	};

	const openEditTask = (task: Task) => { 
		console.log('openEditTask', task);
		
		// Populate form with existing task data
		setTaskForm({
			title: task.title,
			description: task.description,
			assigned_to: task.assigned_to || '',
			dueDate: task.due_date || '',
			category_id: task.category_id || '',
			status: task.status || ''
		});
		
		setTaskSliderMode('edit'); 
		setTaskStatus(task.status);
		setEditingTask(task);
		onTaskSliderOpen(); 
	};

	// Handle form input changes
	const handleTaskFormChange = (field: string, value: string) => {
		const updatedForm = {
			...taskForm,
			[field]: value
		};
		setTaskForm(updatedForm);
		console.log('changed taskForm:', updatedForm);
	};

	// Form submit handlers
	const handleTaskSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Task form data:', taskForm);

		console.log('Creating task with data:', taskForm);
		const userInfo = getCurrentUser(); // Get logged-in user info
		const userId = userInfo?.id;
		const userEmail = userInfo?.email;

		if (!userId || !userEmail) {
			console.error('User information not available');
			return;
		}
		
		if (taskSliderMode === 'create') {
			// Handle create task
			// TODO: Call create task API
			const createData = {
				title: taskForm.title,
				description: taskForm.description,
				assigned_to: taskForm.assigned_to,
				due_date: taskForm.dueDate,
				category_id: taskForm.category_id,
				project_id: selectedProject,
				status: taskStatus,
			};

			console.log('Creating task data preview:', createData);
			const resultTask = await createTask(createData);
			console.log('Creating task:', resultTask);
		} else {
			// Handle update task
			const updateData = {
				id: editingTask?.id || '',
				title: taskForm.title,
				description: taskForm.description,
				assigned_to: taskForm.assigned_to,
				due_date: taskForm.dueDate,
				category_id: taskForm.category_id,
				project_id: selectedProject,
				status: taskStatus,
			};
			console.log('Updating task data preview:', updateData);

			const resultTask = await updateTask(updateData);

			console.log('Updating task:', resultTask);
			// TODO: Call update task API
		}

		loadProjectTasks(selectedProject);
		onTaskSliderClose();
	};

	const handleDeleteTask = async (taskId: string) => {
		console.log('Deleting task:', taskId);
		// TODO: Implement delete task functionality
		const deletedTask = await deleteTask(taskId);
		console.log('Deleted task:', deletedTask);
		loadProjectTasks(selectedProject);
	};

	// Project slider handlers
	const openCreateProject = () => { 
		// Reset form for create mode
		setProjectForm({
			name: '',
		});
		setProjectSliderMode('create'); 
		setEditingProject(null); 
		setSelectedUsers([]);
		onProjectSliderOpen(); 
	};
	
	const openEditProject = async (project: Project) => { 
		// Populate form with existing project data
		setProjectForm({
			name: project.name,
		});

		const projectUsers = await getProjectUsers(project.id);
		console.log('Project\'s Users:', projectUsers);

		setProjectSliderMode('edit'); 
		setEditingProject(project); 
		setSelectedUsers(projectUsers.map((user: any) => user.user_id));
		onProjectSliderOpen(); 
	};

	const handleDeleteProject = async (projectId: string) => {
		console.log('Deleting project:', projectId);
		// TODO: Implement delete project functionality
		const deletedProject = await deleteProject(projectId);
		console.log('Deleted project:', deletedProject);
		loadProjectTasks(selectedProject);

		
		const userInfo = getCurrentUser(); // Get logged-in user info
		const userId = userInfo?.id || '';
		const userEmail = userInfo?.email;

		// Fetch new list of projects
		const userProjects = await getUserProjects(userId);
		console.log('Updated user projects list:', userProjects);

		setProjects(userProjects);
		setSelectedProject(resultProject.id);
		
		const projectUsers = await getProjectUsers(resultProject.id);
		setCurrentProjectUsers(projectUsers);
	};

	const handleProjectFormChange = (field: string, value: string) => {
		const updatedForm = {
			...projectForm,
			[field]: value
		};
		setProjectForm(updatedForm);
		console.log('changed projectForm:', updatedForm);
	};

	const handleUserSelection = (userId: string) => {
		setSelectedUsers(prev => {
			const newSelectedUsers = prev.includes(userId) 
				? prev.filter(id => id !== userId)
				: [...prev, userId];
			
			console.log('selectedUsers updated:', newSelectedUsers);
			return newSelectedUsers;
		});
	};

	const handleProjectSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Project form data:', projectForm);
		
		
		const userInfo = getCurrentUser(); // Get logged-in user info
		const userId = userInfo?.id;
		const userEmail = userInfo?.email;
		let currentProjectId = '';
		
		if (!userId || !userEmail) {
			console.error('User information not available');
			return;
		}

		if(selectedUsers.length === 0) {
			toast({
				title: 'No users selected',
				description: 'Please select at least one user',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Handle create or update based on whether project ID exists
		const isUpdate = !!editingProject?.id;
		
		let resultProject;
		if (isUpdate) {
			const updateData = {
				id: editingProject!.id,
				name: projectForm.name,
				selectedUsers: selectedUsers,
				created_by: userEmail,
				creatorId: userId,
				created_at: new Date().toISOString()
			};
			console.log('Updating project with data:', updateData);
			resultProject = await updateProject(updateData);

			currentProjectId = resultProject.id;
		} else {
			const createData = {
				name: projectForm.name,
				selectedUsers: selectedUsers,
				created_by: userEmail,
				creatorId: userId,
				created_at: new Date().toISOString()
			};
			console.log('Creating project with data:', createData);
			resultProject = await createProject(createData);

			currentProjectId = resultProject.id;
		}
		
		console.log('Result project:', resultProject);
			
		// Fetch new list of projects
		const userProjects = await getUserProjects(userId);
		console.log('Updated user projects list:', userProjects);

		setProjects(userProjects);
		setSelectedProject(currentProjectId);
		setCurrentProjectUsers([]);
		
		onProjectSliderClose();
	};


	return (
		<Box minH="100vh" bg={pageBg} color={textColor}>

			
			{/* Top Nav */}
			<Flex bg={cardBg} px={6} py={4} align="center" boxShadow="sm" justify="space-between" borderBottom="1px solid" borderColor="gray.100">
				<HStack spacing={4}>
					<Heading size="md" color={accent}>Task Management</Heading>

					<HStack spacing={0}>
						<Menu>
							<MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="teal" variant="ghost">{selectedProjectName}</MenuButton>
							<MenuList bg={cardBg} color={textColor} borderColor={accent}>
								{projects.map(p => (
									<MenuItem key={p.id} bg={p.id === selectedProject ? highlightBg : cardBg} color={p.id === selectedProject ? accent : textColor} _hover={{ bg: hoverBg, color: accent }} onClick={() => handleProjectSelection(p.id)}>
										<Flex justify="space-between" align="center" w="100%">
											<Text flex="1">{p.name}</Text>
											<IconButton aria-label="Edit" icon={<EditIcon />} size="xs" variant="ghost" _hover={{color: accent}} onClick={(e) => { e.stopPropagation(); openEditProject(p); }} />
											<IconButton aria-label="Remove" icon={<DeleteIcon />} size="xs" variant="ghost" _hover={{color: red}} onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} />
										</Flex>
									</MenuItem>
								))}
								<MenuItem bg={cardBg} color={textColor} _hover={{ bg: hoverBg, color: accent }} onClick={openCreateProject}>
									<Button size="xs" leftIcon={<AddIcon />} colorScheme="teal" variant="ghost">New Project</Button>
								</MenuItem>
							</MenuList>
						</Menu>
					</HStack>
				</HStack>
				<HStack spacing={2}>
					<Menu>
						<MenuButton as={Button} variant="ghost" px={2} py={1} rounded="full">
							<HStack spacing={2}>
								<Avatar size="sm" name={user.email} />
								
							</HStack>
						</MenuButton>
						<MenuList bg={cardBg} color={textColor} borderColor={accent}>
							<MenuItem><Text fontSize="sm" color={textColor}>Hello, {user.email}!</Text></MenuItem>
							<MenuItem onClick={() => { logoutAction(); }} _hover={{ bg: pageBg, color: accent }} >Logout</MenuItem>
						</MenuList>
					</Menu>
				</HStack>
			</Flex>

			{/* Kanban Board */}
			{selectedProject && (
				<Flex px={8} py={8} gap={6} overflowX="auto">
					{statusColumns.map(col => (
						<VStack
							key={col.key}
							align="start"
							bg={cardBg}
							p={4}
							rounded="lg"
							minW="300px"
							flex="1"
							boxShadow="sm"
							border="1px solid"
							borderColor="gray.100"
							onDrop={e => onDrop(e, col.key)}
							onDragOver={onDragOver}
							spacing={4}
						>
							<Heading size="sm" mb={2} color={accent}>{col.label}</Heading>
							{tasks.filter(t => t.status === col.key).map(task => (
								<Box
									key={task.id}
									bg={pageBg}
									p={3}
									rounded="md"
									w="100%"
									mb={2}
									draggable
									onDragStart={e => onDragStart(e, task.id)}
									boxShadow="xs"
									cursor="grab"
									borderLeft="4px solid"
									borderColor={accent}
								>
									<Flex justify="space-between" align="center">
										<Text fontWeight="bold">{task.title}</Text>
										<HStack spacing={1}>
											<IconButton aria-label="Delete" icon={<DeleteIcon />} size="xs" variant="ghost" color={red} onClick={() => handleDeleteTask(task.id)} />
											<IconButton aria-label="Edit" icon={<EditIcon />} size="xs" variant="ghost" color={accent} onClick={() => openEditTask(task)} />
										</HStack>
									</Flex>
									<Text fontSize="sm" color="gray.500">{task.description}</Text>
									<HStack mt={2} spacing={2}>
										{task.category && <Tag colorScheme="teal" size="sm"><TagLabel>{task.category}</TagLabel></Tag>}
										{task.assignee && <Avatar size="xs" name={task.assignee} />}
										{task.due_date && <Text fontSize="xs" color="gray.500">Due: {task.due_date}</Text>}
									</HStack>
								</Box>
							))}
							<Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" variant="ghost" onClick={() => openCreateTask(col.key)}>Add Task</Button>
						</VStack>
					))}
				</Flex>
			)}

			{/* Right Slider for Create/Edit Task*/}
			<Drawer isOpen={isTaskSliderOpen} placement="right" onClose={onTaskSliderClose} size="sm">
				<DrawerOverlay />
				<DrawerContent bg={cardBg} color={textColor}>
					<DrawerHeader borderBottomWidth="1px" borderColor={accent}>{taskSliderMode === 'create' ? 'Create Task' : 'Edit Task'}</DrawerHeader>
					<DrawerBody>
						<form id="task-form" onSubmit={handleTaskSubmit}>
							<VStack spacing={4}>
								<FormControl isRequired>
									<FormLabel>Title</FormLabel>
									<Input 
										value={taskForm.title} 
										onChange={(e) => handleTaskFormChange('title', e.target.value)}
										placeholder="Task title" 
										bg={pageBg} 
										color={textColor} 
										borderColor={accent} 
										_focus={{ borderColor: accent }} 
									/>
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Description</FormLabel>
									<Textarea 
										value={taskForm.description}
										onChange={(e) => handleTaskFormChange('description', e.target.value)}
										placeholder="Task description" 
										bg={pageBg} 
										color={textColor} 
										borderColor={accent} 
										_focus={{ borderColor: accent }} 
									/>
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Assignee</FormLabel>
									<Select 
										value={taskForm.assigned_to}
										onChange={(e) => handleTaskFormChange('assigned_to', e.target.value)}
										placeholder="Select user" 
										bg={pageBg} 
										color={textColor} 
										borderColor={accent} 
										_focus={{ borderColor: accent }}
									>
										{currentProjectUsers.map((u: any) => <option key={u.id} value={u.user_id}>{allUsers.find(user => user.id === u.user_id)?.email}</option>)}
									</Select>
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Due Date</FormLabel>
									<Input 
										type="date" 
										value={taskForm.dueDate}
										onChange={(e) => handleTaskFormChange('dueDate', e.target.value)}
										bg={pageBg} 
										color={textColor} 
										borderColor={accent} 
										_focus={{ borderColor: accent }} 
									/>
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Category</FormLabel>
									<Select 
										value={taskForm.category_id}
										onChange={(e) => handleTaskFormChange('category_id', e.target.value)}
										placeholder="Select category" 
										bg={pageBg} 
										color={textColor} 
										borderColor={accent} 
										_focus={{ borderColor: accent }}
									>
										{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</Select>
								</FormControl>
							</VStack>
						</form>
					</DrawerBody>
					<DrawerFooter>
						<Button variant="outline" mr={3} onClick={onTaskSliderClose} color={accent} borderColor={accent}>Cancel</Button>
						<Button colorScheme="teal" type="submit" form="task-form" variant="solid">{taskSliderMode === 'create' ? 'Create' : 'Save'}</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* Project Slider */}
			<Drawer isOpen={isProjectSliderOpen} placement="right" onClose={onProjectSliderClose} size="sm">
				<DrawerOverlay />
				<DrawerContent bg={cardBg} color={textColor}>
					<DrawerHeader borderBottomWidth="1px" borderColor={accent}>
						{projectSliderMode === 'create' ? 'Create Project' : 'Edit Project'}
					</DrawerHeader>
					<DrawerBody>
						<form id="project-form" onSubmit={handleProjectSubmit}>
							<VStack spacing={4}>
								<FormControl isRequired>
									<FormLabel>Project Name</FormLabel>
									<Input 
										value={projectForm.name}
										onChange={(e) => handleProjectFormChange('name', e.target.value)}
										placeholder="Enter project name" 
										bg={pageBg} 
										color={textColor} 
										borderColor={accent} 
										_focus={{ borderColor: accent }} 
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Team Members</FormLabel>
									<VStack align="start" spacing={2} maxH="300px" overflowY="auto" w="100%">
										{allUsers.map(user => (
											<Checkbox
												key={user.id}
												isChecked={selectedUsers.includes(user.id)}
												onChange={() => handleUserSelection(user.id)}
												colorScheme="teal"
											>
												<HStack>
													<Avatar size="xs" name={user.email} />
													<Text>{user.email}</Text>
												</HStack>
											</Checkbox>
										))}
									</VStack>
								</FormControl>
							</VStack>
						</form>
					</DrawerBody>
					<DrawerFooter>
						<Button variant="outline" mr={3} onClick={onProjectSliderClose} color={accent} borderColor={accent}>
							Cancel
						</Button>
						<Button colorScheme="teal" type="submit" form="project-form" variant="solid">
							{projectSliderMode === 'create' ? 'Create' : 'Save'}
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</Box>
	);
};

export default Dashboard; 