'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Difficulty = 'easy' | 'medium' | 'hard';

// Global high score storage key
const GLOBAL_HIGH_SCORE_KEY = 'snakeGameGlobalHighScore';

const DIFFICULTY_SETTINGS = {
  easy: { gridSize: 10, cellSize: 40, speed: 250 },
  medium: { gridSize: 7, cellSize: 50, speed: 200 },
  hard: { gridSize: 5, cellSize: 70, speed: 150 }
};

export default function SnakeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [appleCount, setAppleCount] = useState(3);
  const [snake, setSnake] = useState<Position[]>([{ x: 3, y: 3 }]);
  const [apples, setApples] = useState<Position[]>([{ x: 1, y: 1 }]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<'difficultySelect' | 'start' | 'playing' | 'gameOver'>('difficultySelect');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(direction);
  const gameStartedRef = useRef(false);

  // Load global high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(GLOBAL_HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save global high score when it changes
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem(GLOBAL_HIGH_SCORE_KEY, highScore.toString());
    }
  }, [highScore]);

  const currentSettings = DIFFICULTY_SETTINGS[difficulty];
  const { gridSize: GRID_SIZE, cellSize: CELL_SIZE, speed: INITIAL_SPEED } = currentSettings;

  // Generate multiple apple positions
  const generateApples = useCallback((currentSnake: Position[]): Position[] => {
    const newApples: Position[] = [];
    for (let i = 0; i < appleCount; i++) {
      let newApple: Position;
      do {
        newApple = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        };
      } while (
        currentSnake.some(segment => segment.x === newApple.x && segment.y === newApple.y) ||
        newApples.some(apple => apple.x === newApple.x && apple.y === newApple.y)
      );
      newApples.push(newApple);
    }
    return newApples;
  }, [GRID_SIZE, appleCount]);

  // Reset game
  const resetGame = useCallback(() => {
    const centerPos = Math.floor(GRID_SIZE / 2);
    const initialSnake = [{ x: centerPos, y: centerPos }];
    setSnake(initialSnake);
    setApples(generateApples(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameState('start');
  }, [generateApples, GRID_SIZE]);

  // Start game
  const startGame = useCallback(() => {
    resetGame();
    setGameState('playing');
    gameStartedRef.current = false;
  }, [resetGame]);

  // Select difficulty and proceed to start screen
  const selectDifficulty = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState('start');
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const key = e.key.toLowerCase();
      let newDirection: Direction | null = null;

      switch (key) {
        case 'arrowup':
        case 'w':
          if (directionRef.current !== 'DOWN') newDirection = 'UP';
          break;
        case 'arrowdown':
        case 's':
          if (directionRef.current !== 'UP') newDirection = 'DOWN';
          break;
        case 'arrowleft':
        case 'a':
          if (directionRef.current !== 'RIGHT') newDirection = 'LEFT';
          break;
        case 'arrowright':
        case 'd':
          if (directionRef.current !== 'LEFT') newDirection = 'RIGHT';
          break;
      }

      if (newDirection) {
        setDirection(newDirection);
        directionRef.current = newDirection;
        // Start game movement on first key press
        if (!gameStartedRef.current) {
          gameStartedRef.current = true;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      // Check if player has pressed any key yet
      if (!gameStartedRef.current) {
        return; // Don't move snake until player presses a key
      }

      setSnake(currentSnake => {
        const head = currentSnake[0];
        let newHead: Position;

        switch (directionRef.current) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameState('gameOver');
          setHighScore(prev => Math.max(prev, score));
          return currentSnake;
        }

        // Check self collision
        if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameState('gameOver');
          setHighScore(prev => Math.max(prev, score));
          return currentSnake;
        }

        let newSnake = [newHead, ...currentSnake];

        // Check apple collision
        const eatenAppleIndex = apples.findIndex(apple => apple.x === newHead.x && apple.y === newHead.y);
        if (eatenAppleIndex !== -1) {
          setScore(prev => prev + 1);
          const newApples = apples.filter((_, index) => index !== eatenAppleIndex);
          const replacementApple = generateApples([...newSnake, ...newApples]);
          setApples([...newApples, ...replacementApple].slice(0, appleCount));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, apples, generateApples, score, appleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Snake Game</h1>
          
          {gameState !== 'difficultySelect' && (
            <div className="text-gray-600 mb-4">
              Difficulty: <span className="font-bold capitalize">{difficulty}</span> ({GRID_SIZE}x{GRID_SIZE})
            </div>
          )}

          <div className="flex justify-center gap-8 text-lg">
            <div className="text-gray-600">Score: <span className="font-bold text-green-600">{score}</span></div>
            <div className="text-gray-600">Global High Score: <span className="font-bold text-blue-600">{highScore}</span></div>
          </div>
        </div>

        <div className="flex justify-center mb-6 relative">
          <div 
            className="relative bg-gray-800 rounded-lg shadow-inner"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {/* Grid lines */}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <div key={`h-${i}`}>
                <div
                  className="absolute bg-gray-700"
                  style={{
                    left: 0,
                    top: i * CELL_SIZE,
                    width: GRID_SIZE * CELL_SIZE,
                    height: 1,
                  }}
                />
                <div
                  className="absolute bg-gray-700"
                  style={{
                    left: i * CELL_SIZE,
                    top: 0,
                    width: 1,
                    height: GRID_SIZE * CELL_SIZE,
                  }}
                />
              </div>
            ))}

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-100 ${
                  index === 0 ? 'bg-green-500 z-20' : 'bg-green-400 z-10'
                } rounded-sm`}
                style={{
                  left: segment.x * CELL_SIZE + 2,
                  top: segment.y * CELL_SIZE + 2,
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                }}
              />
            ))}

            {/* Apples */}
            {apples.map((apple, index) => (
              <div
                key={index}
                className="absolute bg-red-500 rounded-full transition-all duration-100 z-30"
                style={{
                  left: apple.x * CELL_SIZE + 8,
                  top: apple.y * CELL_SIZE + 8,
                  width: CELL_SIZE - 16,
                  height: CELL_SIZE - 16,
                }}
              />
            ))}
          </div>
        </div>

        {/* Game State Overlay */}
        {gameState === 'difficultySelect' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Select Difficulty</h2>
              <div className="flex flex-col gap-3 mb-6">
                <button
                  onClick={() => selectDifficulty('easy')}
                  className="px-6 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
                >
                  Easy (10x10) - Slower
                </button>
                <button
                  onClick={() => selectDifficulty('medium')}
                  className="px-6 py-3 rounded-lg font-medium transition-colors bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Medium (7x7) - Balanced
                </button>
                <button
                  onClick={() => selectDifficulty('hard')}
                  className="px-6 py-3 rounded-lg font-medium transition-colors bg-red-500 text-white hover:bg-red-600"
                >
                  Hard (5x5) - Faster
                </button>
              </div>
              
              {/* Apple Count Slider */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Apples: {appleCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={appleCount}
                  onChange={(e) => setAppleCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
              
              <button
                onClick={() => setGameState('start')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors w-full"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Play?</h2>
              <p className="text-gray-600 mb-2">Difficulty: <span className="font-bold capitalize">{difficulty}</span> ({GRID_SIZE}x{GRID_SIZE})</p>
              <p className="text-gray-600 mb-6">Apples: <span className="font-bold">{appleCount}</span></p>
              <p className="text-gray-600 mb-6">Press Start, then use arrow keys or WASD to move snake</p>
              <button
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-red-600">Game Over!</h2>
              <p className="text-2xl mb-2 text-gray-800">Final Score: <span className="font-bold">{score}</span></p>
              {score === highScore && score > 0 && (
                <p className="text-lg mb-4 text-green-600 font-bold">New Global High Score!</p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setGameState('difficultySelect')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Change Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-gray-500 text-sm">
          <p>Use arrow keys or WASD to move</p>
        </div>
      </div>
    </div>
  );
}
