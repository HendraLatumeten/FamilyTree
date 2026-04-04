# Roots & Legacy — Interactive Family Tree Studio

**Roots & Legacy** is a premium, high-fidelity family tree modeler designed to help families preserve their history with elegance. Transitioning from technical diagrams to an organic "Forest Green & Amber Gold" aesthetic, it offers a professional yet emotional experience for genealogy enthusiasts.

![Roots & Legacy Aesthetic](https://raw.githubusercontent.com/HendraLatumeten/FamilyTree/main/frontend/public/assets/family_hero.png)

## 🌿 Key Features

- **Interactive Lineage Modeling**: Build complex family trees using a powerful GoJS-powered engine.
- **Organic Aesthetic**: Experience a warm, forest-themed UI with glassmorphism and smooth animations.
- **Direct Editing**: Easily rename and update family members directly on the diagram.
- **Multimedia Integration**: Upload and preserve family photos for every generation.
- **Legacy Sharing**: Publish your tree to a unique public URL and share your heritage with the world.
- **Professional Studio**: A dark-mode professional editor for detailed genealogy work.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Diagram Engines**: GoJS (Main Dashboard) & diagram-js (Studio Editor)
- **Icons**: Lucide React
- **State Management**: Zustand

### Backend
- **Server**: Node.js & Express
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL / MySQL (via Prisma)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Multer (Local/Cloud storage)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A PostgreSQL/MySQL database instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HendraLatumeten/FamilyTree.git
   cd FamilyTree
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your DATABASE_URL and JWT_SECRET
   # Example: DATABASE_URL="postgresql://user:password@localhost:5432/familytree"
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file and add NEXT_PUBLIC_API_URL
   # Example: NEXT_PUBLIC_API_URL="http://localhost:4000/api"
   npm run dev
   ```

4. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment & SSL

For production deployment on an Ubuntu server using **Podman**, please refer to our specialized guides:

- [SSL & HTTPS Setup Guide (Certbot)](./docs/SSL_SETUP.md) — How to generate, renew, and fix permissions for SSL certificates.

### Production Commands
```bash
# Start the full stack (DB, Backend, Frontend, Nginx)
podman-compose up -d --build
```

## 📄 License
This project is licensed under the MIT License.

---
*Preserve the past, connect the present, and inspire the future.*
