export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg mb-4">Profile not found</p>
      <a href="/" className="text-blue-500 hover:underline">
        Go home
      </a>
    </div>
  );
}
