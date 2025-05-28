
export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <div className="lg:ml-0">{children}</div>
    </div>
  );
} 