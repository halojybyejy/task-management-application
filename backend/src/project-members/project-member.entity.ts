// open for migration

// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { Project } from '../projects/project.entity';
// import { User } from '../users/user.entity';

// @Entity('project_members')
// export class ProjectMember {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ name: 'project_id' })
//   projectId: string;

//   @Column({ name: 'user_id' })
//   userId: string;

//   @ManyToOne(() => Project, project => project.members)
//   project: Project;

//   @ManyToOne(() => User)
//   user: User;
// } 