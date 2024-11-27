// src/app/integrations/page.tsx

'use client';

import React, { useState } from 'react';
import { IntegrationCard } from '@/components/integrations/integration-card';
import { tabs, integrations, type TabId, type IntegrationCategory } from '@/components/integrations/integrations-data';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const filteredIntegrations = activeTab === 'all' 
    ? integrations 
    : integrations.filter(integration => 
        integration.category.includes(activeTab as IntegrationCategory)
      );

  return (
    <>
      {/* Navigation Tabs */}
      <div className="mb-8 border-b">
        <div className="flex space-x-1 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 -mb-px whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-black border-b-2 border-black font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}