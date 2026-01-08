import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
// FIX 1: Kita guna jalan manual (relative path) sebab folder Boss takde alias '@'
import { supabase } from '../../../lib/supabase';

// Define the shape of the Post data
interface Post {
  id: string;
  title: string;
  slug: string;
  image_url?: string | null;
  content: string;
  created_at: string;
}

export const revalidate = 60;

// FIX 2: Dalam Next.js 15/16, params adalah Promise. Kita kena ubah type dia.
interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost(props: BlogPostProps) {
  // FIX 3: Kita mesti "await" params sebelum boleh ambil slug
  const params = await props.params;
  const { slug } = params;

  // Debugging: Kita tengok slug apa yang sampai (akan keluar di Terminal VS Code)
  console.log('Mencari artikel dengan slug:', slug);

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    console.error('Error fetching post:', error);
    // Kalau tak jumpa, dia akan automatik hantar ke page 404
    notFound();
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <svg
              className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <header className="mb-10 text-center">
          <div className="mb-4 text-sm font-medium text-blue-600">
            {formattedDate}
          </div>
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="mb-10 overflow-hidden rounded-xl shadow-lg">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-lg prose-blue mx-auto max-w-none text-gray-700">
          <ReactMarkdown
            components={{
              img: ({ node, ...props }) => (
                <img {...props} className="rounded-lg shadow-md my-8 w-full" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-gray-900" />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mb-4 leading-relaxed" />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}