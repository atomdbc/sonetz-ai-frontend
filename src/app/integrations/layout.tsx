// src/app/integrations/layout.tsx

import React from 'react';

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  );
}