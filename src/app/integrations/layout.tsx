// src/app/integrations/layout.tsx
export default function IntegrationsLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }