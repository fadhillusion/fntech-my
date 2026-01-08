import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Define the shape of the Post data
interface Post {
  id: string; // or number, depending on your schema
  title: string;
  slug: string;
  image_url?: string | null; // Adjust field name to match your DB (e.g., 'thumbnail', 'cover_image')
  excerpt?: string;
  created_at: string;
}

// ISR: Revalidate the page every 60 seconds (optional, adjust as needed)
export const revalidate = 60;

export default async function Home() {
  // Fetch posts from Supabase
  // We explicitly select the fields we need
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Failed to load posts. Please try again later.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Latest Updates
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Check out our most recent stories and articles.
          </p>
        </header>

        {!posts || posts.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No posts found.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: Post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl"
              >
                {/* Card Image */}
                {post.image_url ? (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 text-base text-gray-500 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
                    >
                      Read full article
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}