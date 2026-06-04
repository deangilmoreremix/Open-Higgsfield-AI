import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl md:text-8xl text-foreground mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl text-muted-foreground mb-8">
          Company not found
        </h2>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">
          We couldn&apos;t find the company you&apos;re looking for.
          It may have been removed or the link might be incorrect.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
  )
}
