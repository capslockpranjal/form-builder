# Form Builder

A comprehensive, modern form builder application with drag-and-drop interface, built with React 18, TypeScript, Node.js, and MongoDB.

## Features

### 🎯 Core Functionality
- **Drag & Drop Form Builder**: Intuitive interface for creating forms
- **Multiple Field Types**: Text, email, select, checkbox, radio, textarea, file upload
- **Form Validation**: Client and server-side validation with custom rules
- **Multi-step Forms**: Create complex forms with multiple steps
- **Form Publishing**: Draft and publish forms for public access
- **Responsive Design**: Mobile-first approach for all devices

### 📊 Analytics & Insights
- **Submission Analytics**: Track form performance over time
- **Field Response Rates**: See which fields get the most responses
- **Export to CSV**: Download submission data for analysis
- **Real-time Dashboard**: Monitor form activity and statistics

### 🔧 Advanced Features
- **File Uploads**: Support for images, documents, and other file types
- **Custom Settings**: Thank you messages, submission limits, redirects
- **Rate Limiting**: Prevent spam and abuse
- **Form Duplication**: Copy existing forms as templates
- **Search & Filter**: Find forms quickly with advanced search

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Performant forms with easy validation
- **React Query** - Server state management
- **React Beautiful DnD** - Drag and drop functionality
- **Recharts** - Beautiful charts and analytics
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **TypeScript** - Type-safe backend development
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd form-builder
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/form-builder

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Project Structure

```
form-builder/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API endpoints
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── package.json             # Root package.json
└── README.md
```

## API Endpoints

### Forms
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get form by ID
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/:id/duplicate` - Duplicate form
- `PATCH /api/forms/:id/publish` - Publish form
- `PATCH /api/forms/:id/unpublish` - Unpublish form

### Submissions
- `POST /api/submissions` - Submit form
- `GET /api/submissions/form/:formId` - Get submissions for form
- `GET /api/submissions/:id` - Get submission by ID
- `DELETE /api/submissions/:id` - Delete submission

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete file
- `GET /api/upload/:filename` - Get file info

### Analytics
- `GET /api/analytics/form/:formId` - Get form analytics
- `GET /api/analytics/form/:formId/export` - Export form data
- `GET /api/analytics/dashboard` - Get dashboard analytics

## Usage

### Creating a Form

1. Navigate to the Forms page
2. Click "Create Form"
3. Drag field types from the left sidebar to the canvas
4. Configure each field's properties in the right panel
5. Set form-wide settings (thank you message, submission limits, etc.)
6. Save and publish your form

### Field Types

- **Text Input**: Single line text with validation
- **Email Input**: Email address with format validation
- **Text Area**: Multi-line text input
- **Select Dropdown**: Single choice from options
- **Radio Buttons**: Single choice from options
- **Checkboxes**: Multiple choice from options
- **File Upload**: File upload with type and size restrictions

### Form Settings

- **Thank You Message**: Custom message after submission
- **Submission Limit**: Maximum number of submissions
- **Multiple Submissions**: Allow users to submit multiple times
- **Redirect URL**: Redirect users after submission
- **Multi-step**: Enable multi-step form functionality

### Analytics

- **Submission Trends**: Daily submission counts
- **Field Performance**: Response rates for each field
- **Data Export**: Download submissions as CSV
- **Real-time Updates**: Live dashboard with current statistics

## Development

### Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both frontend and backend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Production
npm start                # Start production backend
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## Deployment

### Docker

The application is Docker-ready. Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/form-builder
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Environment Variables

Set production environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## Roadmap

- [ ] User authentication and authorization
- [ ] Form templates and themes
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] API rate limiting dashboard
- [ ] Form embedding widgets
- [ ] Multi-language support
- [ ] Advanced field types (date picker, signature, etc.)
- [ ] Form versioning and rollback
