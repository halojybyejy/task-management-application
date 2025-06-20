// open for migration

// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
// import { Project } from '../projects/project.entity';
// import { User } from '../users/user.entity';
// import { Category } from '../categories/category.entity';

// export enum TaskStatus {
//   TODO = 'todo',
//   DOING = 'doing',
//   DONE = 'done'
// }

// @Entity()
// export class Task {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ name: 'project_id' })
//   projectId: string;

//   @Column({ type: 'text' })
//   title: string;

//   @Column({ type: 'text' })
//   description: string;

//   @Column({
//     type: 'enum',
//     enum: TaskStatus,
//     default: TaskStatus.TODO
//   })
//   status: TaskStatus;

//   @Column({ name: 'assigned_to', nullable: true })
//   assignedTo: string;

//   @Column({ name: 'category_id', nullable: true })
//   categoryId: string;

//   @Column({ name: 'due_date', type: 'timestamp', nullable: true })
//   dueDate: Date;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @ManyToOne(() => Project, project => project.tasks)
//   @JoinColumn({ name: 'project_id' })
//   project: Project;

//   @ManyToOne(() => User)
//   @JoinColumn({ name: 'assigned_to' })
//   assignee: User;

//   @ManyToOne(() => Category)
//   @JoinColumn({ name: 'category_id' })
//   category: Category;
// }