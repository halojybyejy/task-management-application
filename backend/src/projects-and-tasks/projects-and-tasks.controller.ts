import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Put } from '@nestjs/common';
import { getUserProjects, getProjectTasks, getProjectUsers, 
    createProject, updateProject, deleteProject,
    createTask, updateTask, deleteTask, getCategories, updateDraggedTask } from '../utils/supabaseClient';

@Controller('projects-and-tasks')
export class ProjectsAndTasksController {
    // Get user's projects
    @Get('user/:userId/projects')
    async getUserProjects(@Param('userId') userId: string) {
        try {
            console.log('AuthController getUserProjects:', userId);

            if (!userId) {
                throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
            }

            const projects = await getUserProjects(userId);

            console.log('AuthController getUserProjects result:', projects);
            return projects;
        } catch (error) {
            console.error('Get user projects endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to get user projects',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Get project's users
    @Get('project/:projectId/users')
    async getProjectUsers(@Param('projectId') projectId: string) {
        try {
            console.log('ProjectsAndTasksController getProjectUsers:', projectId);

            if (!projectId) {
                throw new HttpException('Project ID is required', HttpStatus.BAD_REQUEST);
            }

            const users = await getProjectUsers(projectId);

            console.log('ProjectsAndTasksController getProjectUsers result:', users);
            return users;
        } catch (error) {
            console.error('Get project users endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to get project users',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }   
    }

    @Get('project/:projectId/tasks')
    async getProjectTasks(@Param('projectId') projectId: string) {
        try {
            console.log('ProjectsAndTasksController getProjectTasks:', projectId);

            if (!projectId) {
                throw new HttpException('Project ID is required', HttpStatus.BAD_REQUEST);
            }

            const tasks = await getProjectTasks(projectId);

            console.log('ProjectsAndTasksController getProjectTasks result:', tasks);
            return tasks;
        } catch (error) {
            console.error('Get project tasks endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to get project tasks',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Get all categories
    @Get('categories')
    async getCategories() {
        try {
            console.log('ProjectsAndTasksController getCategories');

            const categories = await getCategories();

            console.log('ProjectsAndTasksController getCategories result:', categories);
            return categories;
        } catch (error) {
            console.error('Get categories endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to get categories',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Create a project
    @Post('project/create-project')
    async createProject(@Body() body: any) {
        try {
            console.log('ProjectsAndTasksController createProject:', body);

            const project = await createProject(body);

            console.log('ProjectsAndTasksController createProject result:', project);

            return project;
        } catch (error) {
            console.error('Create project endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to create project',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('project/update-project')
    async updateProject(@Body() body: any) {
        try {
            console.log('ProjectsAndTasksController updateProject:', body);

            const project = await updateProject(body);

            console.log('ProjectsAndTasksController updateProject result:', project);

            return project;
        } catch (error) {
            console.error('Update project endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to update project',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Delete a project
    @Post('project/:projectId/delete')
    async deleteProject(@Param('projectId') projectId: string) {
        try {
            console.log('ProjectsAndTasksController deleteProject:', projectId);
            const project = await deleteProject(projectId);
            console.log('ProjectsAndTasksController deleteProject result:', project);
            return project;
        } catch (error) {
            console.error('Delete project endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to delete project',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Create a task
    @Post('project/:projectId/create-task')
    async createTask(@Body() body: any) {
        try {
            console.log('ProjectsAndTasksController createTask:', body);
            const task = await createTask(body);
            console.log('ProjectsAndTasksController createTask result:', task);
            return task;
        } catch (error) {
            console.error('Create task endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to create task',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Update a task
    @Post('project/:projectId/update-task')
    async updateTask(@Param('projectId') projectId: string, @Body() body: any) {
        try {
            console.log('ProjectsAndTasksController updateTask:', projectId, body);
            const task = await updateTask(body);
            console.log('ProjectsAndTasksController updateTask result:', task);
            return task;
        } catch (error) {
            console.error('Update task endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to update task',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Delete a task
    @Post('project/:taskId/delete-task')
    async deleteTask(@Param('taskId') taskId: string) {
        try {
            console.log('ProjectsAndTasksController deleteTask:', taskId);
            const task = await deleteTask(taskId);
            console.log('ProjectsAndTasksController deleteTask result:', task);
            return task;
        } catch (error) {
            console.error('Delete task endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to delete task',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Update a task status
    @Post('project/update-dragged-task')
    async updateDraggedTask( @Body() body: any) {
        try {
            console.log('ProjectsAndTasksController updateDraggedTask:', body);
            const task = await updateDraggedTask(body.taskId, body.status);
            console.log('ProjectsAndTasksController updateDraggedTask result:', task);
            return task;
        } catch (error) {
            console.error('Update dragged task endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to update dragged task',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
} 