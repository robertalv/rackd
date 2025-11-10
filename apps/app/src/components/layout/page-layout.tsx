export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen p-4">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}