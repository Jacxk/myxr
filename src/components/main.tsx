export function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-10 p-6">
      {children}
    </div>
  );
}
