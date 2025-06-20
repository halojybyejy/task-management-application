import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
    // Enable CORS for frontend requests
    app.enableCors({
        origin: 'http://localhost:3000',  // 允許 React 呼叫
        credentials: true,
    });
    
  await app.listen(4000);
  console.log('Backend server running on http://localhost:4000');
}
bootstrap();
