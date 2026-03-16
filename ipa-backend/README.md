# IAP Backend

Industrial Placement Application (IAP) - Backend API built with NestJS, PostgreSQL, and Prisma.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
# 1. Create PostgreSQL database
# 2. Update DATABASE_URL in .env

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npm run prisma:generate

# Seed database (creates admin user)
npm run prisma:seed

# Start development server
npm run dev
```

The server will start at `http://localhost:2009`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md) | Complete system architecture and features |
| [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) | Quick endpoint reference guide |
| [SWAGGER_SETUP.md](./SWAGGER_SETUP.md) | Swagger configuration details |
| [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) | Step-by-step Swagger usage guide |

## 🔗 API Documentation

**Interactive Swagger UI**: [http://localhost:2009/api](http://localhost:2009/api)

The Swagger interface provides:
- Complete API documentation
- Interactive endpoint testing
- Request/response examples
- Authentication testing
- No Postman needed!

## 🏗️ Tech Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Email**: Nodemailer
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI

## 📋 Features

- ✅ Role-based authentication (Admin, Supervisor, Student)
- ✅ Student profile management with two-phase registration
- ✅ Task assignment and tracking with status workflow
- ✅ Daily log book entries
- ✅ Real-time notifications (user-specific and role-based)
- ✅ Direct messaging with file sharing
- ✅ Rating and feedback system
- ✅ Email notifications (profile completion, password reset)
- ✅ Bulk student upload via Excel
- ✅ Account security (rate limiting, lockout)

## 🔐 Default Credentials

After seeding the database:

```
Email: admin@rca.ac.rw
Password: secretunlocked123
Role: ADMIN
```

## 🛠️ Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database management
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:generate  # Generate Prisma client
npm run prisma:seed      # Seed database
```

## 📁 Project Structure

```
iap-backend/
├── src/
│   ├── admin/           # Admin management
│   ├── auth/            # Authentication & JWT
│   ├── chat/            # Messaging system
│   ├── log-entries/     # Student logs
│   ├── notifications/   # Notifications
│   ├── students/        # Student management
│   ├── supervisors/     # Supervisor management
│   ├── tasks/           # Task management
│   ├── lib/             # Utilities
│   ├── prisma/          # Prisma service
│   └── main.ts          # Application entry
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding
│   └── migrations/      # Migration history
└── dist/                # Compiled output
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/activity` - System activity
- `POST /api/admin/add-user` - Create user
- `DELETE /api/admin/users` - Delete user

### Students
- `GET /api/students` - List students
- `PATCH /api/students/update` - Update profile
- `POST /api/students/upload` - Bulk upload
- `POST /api/students/send-invites` - Send invitations

### Supervisors
- `GET /api/supervisors` - List supervisors
- `GET /api/supervisors/:id` - Get supervisor
- `PATCH /api/supervisors/:id` - Update supervisor

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks` - Update task

### Log Entries
- `GET /api/daily-log` - Get logs
- `POST /api/daily-log` - Create log
- `DELETE /api/daily-log/:id` - Delete log

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `DELETE /api/notifications/:id` - Delete notification

### Chat
- `GET /api/chat` - Get messages
- `POST /api/chat` - Send message
- `POST /api/chat/upload` - Upload file

For complete endpoint details, see [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) or visit the Swagger UI.

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ipa_db"

# Server
PORT=2009

# JWT
JWT_SECRET="your-secret-key-here"

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD="your-app-password"

# Frontend URL
WEBSITE_URL="http://localhost:3000"
```

## 🗄️ Database Schema

### Main Models
- **User** - Authentication and base user info
- **Student** - Extended student profile
- **Supervisor** - Supervisor profile
- **Task** - Assignment tracking
- **LogEntry** - Daily logs
- **Notification** - System notifications
- **Message** - Direct messaging
- **Rating** - Performance ratings
- **Comment** - Task feedback

### User Roles
- `ADMIN` - Full system access
- `SUPERVISOR` - Manage students and tasks
- `STUDENT` - Complete tasks and logs

### Task Status Flow
```
PENDING → IN_PROGRESS → SUBMITTED → APPROVED/REJECTED → COMPLETED
```

## 🧪 Testing the API

### Option 1: Swagger UI (Recommended)
1. Start the server: `npm run dev`
2. Open: `http://localhost:2009/api`
3. Click "Authorize" and enter your JWT token
4. Test endpoints interactively

### Option 2: cURL
```bash
# Login
curl -X POST http://localhost:2009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rca.ac.rw","password":"secretunlocked123"}'

# Get current user (replace TOKEN)
curl -X GET http://localhost:2009/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Option 3: Postman
Import the OpenAPI spec from: `http://localhost:2009/api-json`

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication (3-day expiry)
- Rate limiting on login (5 attempts = 1 min lockout)
- Token versioning for session invalidation
- Time-limited password reset tokens
- Account activation workflow

## 📧 Email Features

- Profile completion invitations
- Password reset emails
- Configurable SMTP settings
- HTML email templates

## 🚢 Production Deployment

1. Set `NODE_ENV=production`
2. Update CORS settings in `main.ts`
3. Use strong JWT_SECRET
4. Configure production database
5. Set up proper SMTP credentials
6. Consider restricting Swagger access

## 🤝 Contributing

1. Follow NestJS best practices
2. Add Swagger decorators to new endpoints
3. Update Prisma schema for database changes
4. Run migrations before committing
5. Test endpoints in Swagger UI

## 📝 Adding New Endpoints

1. Create/update controller with Swagger decorators:
```typescript
@ApiTags('YourModule')
@ApiBearerAuth('JWT-auth')
@Controller('your-route')
export class YourController {
  @Post()
  @ApiOperation({ summary: 'Description' })
  @ApiResponse({ status: 201, description: 'Success' })
  async create(@Body() data: any) {
    // implementation
  }
}
```

2. Register controller in module
3. Test in Swagger UI
4. Update documentation

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Prisma Client Errors
```bash
npm run prisma:generate
```

### Email Not Sending
- Check SMTP credentials
- For Gmail, use App Password
- Verify SMTP_HOST and SMTP_PORT

### Swagger Not Loading
- Check server is running
- Verify port 2009 is not blocked
- Clear browser cache

## 📊 Database Management

```bash
# Open Prisma Studio (GUI)
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## 🔄 Workflow Examples

### Student Onboarding
1. Admin creates student account → `POST /api/admin/add-user`
2. System sends profile completion email
3. Student clicks link and completes profile → `POST /api/students/complete-profile`
4. Student can now login and access system

### Task Assignment
1. Supervisor creates task → `POST /api/tasks`
2. System creates notification for student
3. Student views task → `GET /api/tasks?studentId=X`
4. Student updates status to IN_PROGRESS → `PATCH /api/tasks`
5. Student submits task → `PATCH /api/tasks` (status: SUBMITTED)
6. Supervisor reviews and approves → `PATCH /api/tasks` (status: APPROVED)

## 📞 Support

For detailed information:
- **System Overview**: [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)
- **API Reference**: [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- **Swagger Guide**: [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

## 📄 License

[Your License Here]

## 👥 Team

Rwanda Coding Academy - Industrial Placement Application

---

**Built with ❤️ using NestJS**
