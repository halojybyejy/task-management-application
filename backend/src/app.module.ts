import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { ProjectsAndTasksController } from './projects-and-tasks/projects-and-tasks.controller';

// For local development and migration
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { TasksModule } from './tasks/tasks.module';
// import { ProjectsModule } from './projects/projects.module';
// import { UsersModule } from './users/users.module';
// import { CategoriesModule } from './categories/categories.module';

const SUPABASE_URL = process.env.SUPABASE_URL;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // For local development and migration
    // TypeOrmModule.forRootAsync({
    //     imports: [ConfigModule],
    //     useFactory: (config: ConfigService) => ({
    //             type: 'postgres',
    //             url: SUPABASE_URL,
    //             ssl: {
    //                 rejectUnauthorized: false,
    //             },
    //             // For local development and migration
    //             // host: '127.0.0.1',
    //             // port: 5433,
    //             // username: 'postgres',
    //             // password: 'postgres',
    //             // database: 'task_management_app',
    //             entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //             synchronize: false,
    //             migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    //             migrationsTableName: 'migrations',
    //     }),
    //     inject: [ConfigService],
    // }),
    // TasksModule,
    // ProjectsModule,
    // UsersModule,
    // CategoriesModule,
  ],
  controllers: [AppController, AuthController, ProjectsAndTasksController],
  providers: [AppService],
})
export class AppModule {}
