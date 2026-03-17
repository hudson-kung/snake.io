'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 6;
const CELL_SIZE = 60;
const INITIAL_SPEED = 200;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 3, y: 3 }]);
  const [apple, setApple] = useState<Position>({ x: 1, y: 1 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(direction);

  // Generate random apple position
  const generateApple = useCallback((currentSnake: Position[]): Position => {
    let newApple: Position;
    do {
      newApple = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
    return newApple;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 3, y: 3 }];
    setSnake(initialSnake);
    setApple(generateApple(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setCountdown(3);
    setGameState('start');
  }, [generateApple]);

  // Start game
  const startGame = useCallback(() => {
    resetGame();
    setGameState('countdown');
    
    // Start countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setGameState('playing');
      }
    }, 1000);
  }, [resetGame]);

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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
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
        if (newHead.x === apple.x && newHead.y === apple.y) {
          setScore(prev => prev + 1);
          setApple(generateApple(newSnake));
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
  }, [gameState, apple, generateApple, score]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Snake Game</h1>
          <div className="flex justify-center gap-8 text-lg">
            <div className="text-gray-600">Score: <span className="font-bold text-green-600">{score}</span></div>
            <div className="text-gray-600">High Score: <span className="font-bold text-blue-600">{highScore}</span></div>
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

            {/* Apple */}
            <div
              className="absolute bg-red-500 rounded-full transition-all duration-100 z-30"
              style={{
                left: apple.x * CELL_SIZE + 8,
                top: apple.y * CELL_SIZE + 8,
                width: CELL_SIZE - 16,
                height: CELL_SIZE - 16,
              }}
            />
          </div>
        </div>

        {/* Game State Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Play?</h2>
              <p className="text-gray-600 mb-6">Use arrow keys or WASD to control the snake</p>
              <button
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-40">
            <div className="text-center">
              <div className="text-8xl font-bold text-white mb-4 animate-pulse">
                {countdown}
              </div>
              <div className="text-2xl text-white font-semibold">
                Get Ready!
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-red-600">Game Over!</h2>
              <p className="text-2xl mb-2 text-gray-800">Final Score: <span className="font-bold">{score}</span></p>
              {score === highScore && score > 0 && (
                <p className="text-lg mb-4 text-green-600 font-bold">New High Score!</p>
              )}
              <button
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Play Again
              </button>
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
