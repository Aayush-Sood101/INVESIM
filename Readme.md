# INVESIM - Investment Simulator

This is an investment simulator platform designed to spread financial literacy. Designed for Teenagers and pre-adults to enable them to take calculated risk without the fear of losing real money.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd "c:\Abhijit Data\INVESIM"
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Get your Clerk keys from [https://dashboard.clerk.com/last-active?path=api-keys](https://dashboard.clerk.com/last-active?path=api-keys)
   - Replace the placeholder values in `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **State Management:** Zustand
- **UI Components:** Radix UI + Custom Components
- **Icons:** Lucide React

## Authentication Setup

The app uses Clerk for authentication. To set it up:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your Publishable Key and Secret Key
4. Update your `.env.local` file with the real keys

**Note:** The app will run without Clerk keys configured, but authentication features will not work.

## Project Structure

```
├── app/                 # Next.js 13+ App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   ├── game/           # Game routes
│   └── results/        # Results page
├── components/         # Reusable React components
│   ├── ui/            # UI component library
│   └── ...
├── lib/               # Utility functions and stores
├── hooks/             # Custom React hooks
└── public/            # Static assets
```