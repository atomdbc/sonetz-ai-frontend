// src/app/share/[threadId]/page.tsx
// Remove 'use client' from here - this should be a server component
import SharePageClient from './SharePageClient';

interface PageProps {
  params: { threadId: string };
}

export default function SharePage({ params }: PageProps) {
  return <SharePageClient threadId={params.threadId} />;
}