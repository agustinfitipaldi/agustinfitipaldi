import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minesweeper Editor',
  description: 'Play and edit Minesweeper boards, share to with URL.',
};

export default function MinesweeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
