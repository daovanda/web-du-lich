export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="main-content">
      {children}
      <style jsx>{`
        .main-content {
          max-width: 672px; /* max-w-2xl */
          margin: 0 auto;
          padding: 1rem;
          overflow-y: auto;
          min-height: 100vh;
          width: 100%;
        }
      `}</style>
    </main>
  );
}