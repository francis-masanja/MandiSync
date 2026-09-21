export default function Unauthorized() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Unauthorized</h1>
      <p className="mb-6 text-center">
        You do not have permission to view this page.
      </p>
      <a href="/" className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90">
        Return Home
      </a>
    </main>
  );
}
