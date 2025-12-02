# FM Route Try System 🚚

> **Family Mart Route Management System** - A comprehensive delivery route management and optimization platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)](https://tailwindcss.com/)

## 🌟 Features

### 📊 Route Management
- **Interactive Data Table** with drag-and-drop row reordering
- **Real-time Editing** of delivery information
- **Smart Filtering** by route (KL/Selangor) and delivery type
- **Pagination & Search** functionality
- **Custom Columns** with dynamic field management

### 🗺️ Map & Navigation
- **Google Maps Integration** for location visualization
- **AI Route Optimization** using advanced algorithms
- **Distance & Toll Calculation** for accurate route planning
- **Mini-map** for quick location reference

### 🎨 UI/UX Design
- **Frosted Glass Theme** with beautiful backdrop blur effects
- **Dark/Light Mode** with system preference detection
- **Responsive Design** optimized for mobile and desktop
- **Smooth Animations** with GPU-accelerated transitions
- **PWA Support** for app-like experience

### 📸 Media Management
- **Image Gallery** with LightGallery integration
- **Bulk Upload** support for multiple images
- **Image Editing** with rotation and preview
- **Drag-and-drop** image management

### 🔐 Security & Sharing
- **Password Protection** for edit mode
- **Shareable Links** for custom tables
- **Saved Links Management** for quick access
- **Session-based Authentication**

### 📈 Analytics & Reports
- **Statistics Cards** showing total routes, active stores, distances
- **Real-time Calculations** for toll prices and kilometers
- **TNG Route Generation** for Touch 'n Go payments
- **Export Functionality** for route data

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **TypeScript 5.7.2** - Type-safe development
- **Vite 5.4.19** - Lightning-fast build tool
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching & caching

### Backend
- **Express.js** - REST API server
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Reliable database
- **Google Maps API** - Geocoding & routing
- **OpenRouteService** - Route optimization

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **LightGallery** - Image gallery
- **React Beautiful DnD** - Drag-and-drop functionality

## 📁 Project Structure

```
Try/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── utils/       # Helper functions
│   ├── public/          # Static assets
│   └── index.html       # HTML entry point
├── server/              # Backend Express server
│   ├── db.ts           # Database configuration
│   ├── routes.ts       # API routes
│   ├── storage.ts      # File storage
│   └── index.ts        # Server entry point
├── shared/              # Shared types & schemas
│   └── schema.ts       # Database schema
└── README.md           # Project documentation
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or pnpm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/NF1997-X/Try.git
cd Try
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/routevm
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
```

4. **Database Setup**
```bash
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📦 Build & Deploy

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
The project is configured for automatic deployment on Vercel/Replit.

## 🎮 Usage

### Main Features

#### 1. **Table Management**
- Click on any cell to edit (Edit Mode required)
- Drag rows to reorder delivery sequence
- Use filters to find specific routes
- Add/delete rows as needed

#### 2. **Route Optimization**
- Click "Optimize Route" button
- Select rows to optimize (or all)
- AI calculates the most efficient path
- Apply optimized order to table

#### 3. **Custom Tables**
- Create shareable custom tables
- Password-protect sensitive data
- Save frequently used links
- Share with team members

#### 4. **Map Features**
- View all locations on map
- Click markers for details
- See optimized route path
- Calculate distances and tolls

## 🎨 Theming

The application supports two beautiful themes:

### Light Mode (Platinum Frosted Glass)
- Clean white/grey palette
- Soft shadows and blur effects
- High contrast for readability

### Dark Mode (Black Ocean Glass)
- Pure black background
- Blue ocean accents
- Elegant frosted glass overlays

## 🔑 Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + S` - Save changes
- `Esc` - Close modals
- `←/→` - Navigate pagination
- `E` - Toggle Edit Mode (with password)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**NF1997-X**
- GitHub: [@NF1997-X](https://github.com/NF1997-X)

## 🙏 Acknowledgments

- Family Mart for the business requirements
- React & Vite communities for amazing tools
- Radix UI for accessible components
- All contributors and users

---

**Built with ❤️ for Family Mart Route Management**
