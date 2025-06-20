// open for migration

// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
// import { User } from '../users/user.entity';
// import { ProjectMember } from '../project-members/project-member.entity';
// import { Task } from '../tasks/task.entity';

// @Entity()
// export class Project {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'text' })
//   name: string;

//   @Column({ name: 'created_by' })
//   createdBy: string;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @ManyToOne(() => User)
//   creator: User;

//   @OneToMany(() => ProjectMember, member => member.project)
//   members: ProjectMember[];

//   @OneToMany(() => Task, task => task.project)
//   tasks: Task[];
// } 