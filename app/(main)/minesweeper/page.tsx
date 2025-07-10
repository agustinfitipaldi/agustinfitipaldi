'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bomb, Flag, Edit3, Play, Clipboard, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const PRESETS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 }
};

const Minesweeper = () => {
  const { toast } = useToast();
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flagged, setFlagged] = useState<boolean[][]>([]);
  const [mode, setMode] = useState<'play' | 'edit'>('play');
  const [preset, setPreset] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [mineCount, setMineCount] = useState(PRESETS.beginner.mines);
  const initialized = useRef(false);

  // URL management functions
  const generateRandomSeed = useCallback((presetName: 'beginner' | 'intermediate' | 'expert') => {
    const config = PRESETS[presetName];
    const mines: number[][] = [];
    const positions: number[][] = [];
    
    // Generate all possible positions
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        positions.push([y, x]);
      }
    }
    
    // Shuffle and pick first N positions for mines
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    mines.push(...positions.slice(0, config.mines));
    
    return {
      width: config.width,
      height: config.height,
      mines
    };
  }, []);

  const updateURLWithSeed = useCallback((seedData: { width: number; height: number; mines: number[][] }) => {
    const encoded = btoa(JSON.stringify(seedData));
    const url = new URL(window.location.href);
    url.searchParams.set('seed', encoded);
    window.history.replaceState({}, '', url.toString());
  }, []);


  // Initialize board from URL or default - only once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    
    if (seed) {
      try {
        const decoded = JSON.parse(atob(seed));
        initializeFromSeed(decoded);
      } catch (e) {
        console.error('Invalid seed:', e);
        const randomSeed = generateRandomSeed('beginner');
        updateURLWithSeed(randomSeed);
        initializeFromSeed(randomSeed);
      }
    } else {
      const randomSeed = generateRandomSeed('beginner');
      updateURLWithSeed(randomSeed);
      initializeFromSeed(randomSeed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countAdjacentMines = useCallback((boardData: number[][], x: number, y: number) => {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < boardData.length && nx >= 0 && nx < boardData[0].length) {
          if (boardData[ny][nx] === -1) count++;
        }
      }
    }
    return count;
  }, []);

  const initializeFromSeed = useCallback((seedData: { width: number; height: number; mines: number[][] }) => {
    const { width, height, mines } = seedData;
    const newBoard = Array(height).fill(null).map(() => Array(width).fill(0));
    const newRevealed = Array(height).fill(null).map(() => Array(width).fill(false));
    const newFlagged = Array(height).fill(null).map(() => Array(width).fill(false));
    
    // Place mines
    mines.forEach(([y, x]) => {
      if (y < height && x < width) {
        newBoard[y][x] = -1;
      }
    });
    
    // Calculate numbers
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (newBoard[y][x] !== -1) {
          newBoard[y][x] = countAdjacentMines(newBoard, x, y);
        }
      }
    }
    
    setBoard(newBoard);
    setRevealed(newRevealed);
    setFlagged(newFlagged);
    setMineCount(mines.length);
    
    // Detect preset if it matches
    for (const [name, config] of Object.entries(PRESETS)) {
      if (config.width === width && config.height === height && config.mines === mines.length) {
        setPreset(name as 'beginner' | 'intermediate' | 'expert');
        break;
      }
    }
  }, [countAdjacentMines]);

  const initializeBoard = useCallback((presetName: 'beginner' | 'intermediate' | 'expert') => {
    const randomSeed = generateRandomSeed(presetName);
    updateURLWithSeed(randomSeed);
    initializeFromSeed(randomSeed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const toggleMine = useCallback((x: number, y: number) => {
    if (mode !== 'edit') return;
    
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      const wasMine = newBoard[y][x] === -1;
      
      if (wasMine) {
        newBoard[y][x] = 0;
        setMineCount(prev => prev - 1);
      } else {
        newBoard[y][x] = -1;
        setMineCount(prev => prev + 1);
      }
      
      // Recalculate all numbers
      for (let cy = 0; cy < newBoard.length; cy++) {
        for (let cx = 0; cx < newBoard[0].length; cx++) {
          if (newBoard[cy][cx] !== -1) {
            newBoard[cy][cx] = countAdjacentMines(newBoard, cx, cy);
          }
        }
      }
      
      // Update URL with new board state
      const mines: number[][] = [];
      for (let cy = 0; cy < newBoard.length; cy++) {
        for (let cx = 0; cx < newBoard[0].length; cx++) {
          if (newBoard[cy][cx] === -1) {
            mines.push([cy, cx]);
          }
        }
      }
      
      const seedData = {
        width: newBoard[0].length,
        height: newBoard.length,
        mines
      };
      
      updateURLWithSeed(seedData);
      
      return newBoard;
    });
  }, [mode, countAdjacentMines, updateURLWithSeed]);

  const revealCell = useCallback((x: number, y: number) => {
    if (mode !== 'play' || gameState === 'won' || gameState === 'lost') return;
    if (revealed[y] && revealed[y][x]) return;
    if (flagged[y] && flagged[y][x]) return;
    
    setRevealed(prevRevealed => {
      const newRevealed = prevRevealed.map(row => [...row]);
      newRevealed[y][x] = true;
      
      if (board[y][x] === -1) {
        setGameState('lost');
        // Reveal all mines
        for (let cy = 0; cy < board.length; cy++) {
          for (let cx = 0; cx < board[0].length; cx++) {
            if (board[cy][cx] === -1) {
              newRevealed[cy][cx] = true;
            }
          }
        }
        return newRevealed;
      }
      
      // Flood fill for empty cells
      if (board[y][x] === 0) {
        const queue = [[x, y]];
        const visited = new Set([`${x},${y}`]);
        
        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              const key = `${nx},${ny}`;
              
              if (ny >= 0 && ny < board.length && nx >= 0 && nx < board[0].length && 
                  !visited.has(key) && !newRevealed[ny][nx] && (!flagged[ny] || !flagged[ny][nx])) {
                visited.add(key);
                newRevealed[ny][nx] = true;
                if (board[ny][nx] === 0) {
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
      }
      
      setGameState('playing');
      
      // Check win condition
      let hiddenCount = 0;
      for (let cy = 0; cy < board.length; cy++) {
        for (let cx = 0; cx < board[0].length; cx++) {
          if (!newRevealed[cy][cx] && board[cy][cx] !== -1) {
            hiddenCount++;
          }
        }
      }
      
      if (hiddenCount === 0 && mineCount > 0) {
        setGameState('won');
      }
      
      return newRevealed;
    });
  }, [mode, gameState, revealed, flagged, mineCount, board]);

  const toggleFlag = useCallback((e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (mode !== 'play' || (revealed[y] && revealed[y][x]) || gameState === 'won' || gameState === 'lost') return;
    
    setFlagged(prevFlagged => {
      const newFlagged = prevFlagged.map(row => [...row]);
      newFlagged[y][x] = !newFlagged[y][x];
      return newFlagged;
    });
  }, [mode, revealed, gameState]);

  const shareBoard = useCallback(() => {
    const url = window.location.href;
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Board URL is ready to paste and share.",
      });
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Copied to clipboard!",
        description: "Board URL is ready to paste and share.",
      });
    });
  }, [toast]);

  const reset = useCallback(() => {
    const config = PRESETS[preset];
    const newRevealed = Array(config.height).fill(null).map(() => Array(config.width).fill(false));
    const newFlagged = Array(config.height).fill(null).map(() => Array(config.width).fill(false));
    
    setRevealed(newRevealed);
    setFlagged(newFlagged);
    setGameState('ready');
    
    if (mineCount === 0) {
      setBoard(Array(config.height).fill(null).map(() => Array(config.width).fill(0)));
    }
  }, [preset, mineCount]);

  const getCellContent = (x: number, y: number) => {
    if (mode === 'edit') {
      return board[y][x] === -1 ? <Bomb className="w-4 h-4" /> : null;
    }
    
    if (!revealed[y] || !revealed[y][x]) {
      return (flagged[y] && flagged[y][x]) ? <Flag className="w-4 h-4 text-red-500" /> : null;
    }
    
    if (board[y][x] === -1) {
      return <Bomb className="w-4 h-4" />;
    }
    
    if (board[y][x] > 0) {
      const colors = ['', 'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600', 
                     'text-yellow-600', 'text-pink-600', 'text-foreground', 'text-muted-foreground'];
      return <span className={`font-bold ${colors[board[y][x]]}`}>{board[y][x]}</span>;
    }
    
    return null;
  };

  const getCellClass = (x: number, y: number) => {
    const base = "w-8 h-8 border border-border flex items-center justify-center text-sm cursor-pointer transition-colors ";
    
    if (mode === 'edit') {
      return base + (board[y][x] === -1 ? "bg-red-200 hover:bg-red-300 dark:bg-red-900 dark:hover:bg-red-800" : "bg-muted hover:bg-muted/80");
    }
    
    if (!revealed[y] || !revealed[y][x]) {
      return base + "bg-muted hover:bg-muted/80";
    }
    
    if (board[y][x] === -1) {
      return base + (gameState === 'lost' ? "bg-red-500 dark:bg-red-600" : "bg-background");
    }
    
    return base + "bg-background";
  };

  const flagCount = flagged.flat().filter(f => f).length;
  const remainingMines = mineCount - flagCount;

  // Don't render until initialized
  if (!board.length) return null;

  return (
    <div className="max-w-4xl mx-auto px-8 pt-4 sm:pt-16 pb-32">
      <div className="flex flex-col items-center gap-6">
        <div className="text-left space-y-4">
          <h1 className="text-4xl font-bold">Minesweeper Editor</h1>
          <div className="max-w-2xl">
            <p>
              I noticed today (July 9, 2025) that while there's an incredible amount of ways to <em>play</em> minewsweeper on the web, there are very few ways to <em>edit</em> minesweeper on the web. So I had Claude Code spin up this very basic editor that allows anyone to edit bomb placement of any of the standard types of boards, and since the seed is in the url parameters, it can be shared easily. Enjoy!
            </p>
          </div>
        </div>
        
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <select 
                value={preset} 
                onChange={(e) => {
                  const value = e.target.value as 'beginner' | 'intermediate' | 'expert';
                  setPreset(value);
                  initializeBoard(value);
                }}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="beginner">Beginner (9×9, 10 mines)</option>
                <option value="intermediate">Intermediate (16×16, 40 mines)</option>
                <option value="expert">Expert (30×16, 99 mines)</option>
              </select>
              
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={mode === 'edit'}
                    onChange={() => setMode(mode === 'play' ? 'edit' : 'play')}
                  />
                  <div className="relative">
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      mode === 'edit' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      mode === 'edit' ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </div>
                </label>
                <span className={`text-sm ${mode === 'edit' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Edit
                </span>
              </div>
              
              <Button
                onClick={reset}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              
              <Button
                onClick={shareBoard}
                variant="outline"
                size="sm"
              >
                <Clipboard className="w-4 h-4" /> Copy Board
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4 text-lg">
              <div className="flex items-center gap-2">
                <Bomb className="w-5 h-5" />
                <span className="font-mono">{mode === 'play' ? remainingMines : mineCount}</span>
              </div>
              
              {gameState === 'won' && <span className="text-green-600 font-bold">You Win!</span>}
              {gameState === 'lost' && <span className="text-red-600 font-bold">Game Over</span>}
            </div>
            
            <div className="flex justify-center">
              <div 
                className="inline-block border-2 border-border rounded-sm overflow-hidden"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${board[0]?.length || 0}, 1fr)`,
                  gap: 0
                }}
              >
                {board.map((row, y) => 
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={getCellClass(x, y)}
                      onClick={() => mode === 'edit' ? toggleMine(x, y) : revealCell(x, y)}
                      onContextMenu={(e) => mode === 'play' && toggleFlag(e, x, y)}
                    >
                      {getCellContent(x, y)}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground text-center mt-4">
              {mode === 'edit' ? 
                "Click cells to place/remove mines. Turn off edit mode when done to play the board." :
                "Left click to reveal, right click to flag."
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Minesweeper;
