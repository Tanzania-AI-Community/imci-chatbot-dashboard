import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to the IMCI Dashboard
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Manage diagnosis flows, user roles, and dynamic rules with ease.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
