# 🐍 Snake Game

A fully functional Snake game built with Next.js and React, inspired by Google's Snake. Features a 6x6 grid, smooth animations, and modern design.

## 🎮 Features

- **6x6 Grid Game Board** - Compact and challenging gameplay
- **Smooth Controls** - Use arrow keys or WASD to control the snake
- **Score Tracking** - Current score and high score persistence
- **3-Second Countdown** - Get ready before the game starts
- **Modern UI** - Clean, Google-inspired design with Tailwind CSS
- **Responsive Design** - Works perfectly on all screen sizes
- **Game States** - Start screen, countdown, gameplay, and game over screen

## 🚀 Quick Start

### Play Live
Deployed on Vercel: [https://snake-io.vercel.app](https://snake-io.vercel.app)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/hudson-kung/snake.io.git
cd snake.io
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 How to Play

1. Click "Start Game" to begin
2. Wait for the 3-second countdown
3. Control the snake using:
   - **Arrow Keys** (↑ ↓ ← →) or **WASD** (W A S D)
4. Eat red apples to grow and increase your score
5. Avoid hitting walls or your own tail
6. Try to beat your high score!

## 🛠 Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **React Hooks** - State management and game logic

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub (already done!)
2. Connect your GitHub repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect it's a Next.js app and deploy

The project includes `vercel.json` for optimal deployment settings.

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🎮 Game Controls

| Action | Key |
|--------|-----|
| Move Up | ↑ or W |
| Move Down | ↓ or S |
| Move Left | ← or A |
| Move Right | → or D |
| Start/Restart | Click Button |

## 🏆 Game Features

- **Collision Detection** - Walls and self-collision end the game
- **Random Apple Spawning** - Apples appear in empty cells
- **Smooth Animations** - CSS transitions for fluid movement
- **High Score Tracking** - Persistent across game sessions
- **Responsive Grid** - Adapts to different screen sizes

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for learning or inspiration.
