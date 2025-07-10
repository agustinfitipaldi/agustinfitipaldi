import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minesweeper Editor',
  description: 'Play classic Minesweeper or create custom boards with our interactive editor. Share your creations with URL-based game state.',
};

export default function MinesweeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}