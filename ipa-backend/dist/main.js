"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: "*",
        credentials: true,
    });
    app.setGlobalPrefix('api');
    // Swagger Configuration
    const config = new swagger_1.DocumentBuilder()
        .setTitle('IPA Backend API')
        .setDescription('Industrial Placement Application (IPA) - API Documentation for managing students, supervisors, tasks, and internship workflows')
        .setVersion('1.0')
        .addTag('Authentication', 'User authentication and authorization endpoints')
        .addTag('Admin', 'Admin management and system monitoring')
        .addTag('Students', 'Student profile and management')
        .addTag('Supervisors', 'Supervisor profile and management')
        .addTag('Tasks', 'Task assignment and tracking')
        .addTag('Log Entries', 'Student log book entries')
        .addTag('Notifications', 'Notification management')
        .addTag('Chat', 'Messaging and file sharing')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'IPA API Documentation',
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    const port = process.env.PORT || 2009;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
