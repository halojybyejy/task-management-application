// open for migration

// import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
// import { Project } from '../projects/project.entity';
// import { ProjectMember } from '../project-members/project-member.entity';
// import { Task } from '../tasks/task.entity';

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'text', nullable: false })
//   email: string;

//   @OneToMany(() => Project, project => project.creator)
//   createdProjects: Project[];

//   @OneToMany(() => ProjectMember, member => member.user)
//   projectMemberships: ProjectMember[];

//   @OneToMany(() => Task, task => task.assignee)
//   assignedTasks: Task[];
// } 