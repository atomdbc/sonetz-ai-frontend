// src/components/integrations/integrations-data.ts

export const tabs = [
  { id: 'all', label: 'All integration' },
  { id: 'crm', label: 'Sales and CRM' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'video', label: 'Video conferencing' },
  { id: 'calendar', label: 'Calendars' },
  { id: 'email', label: 'Email messaging' }
] as const;

export type TabId = (typeof tabs)[number]['id'];
export type IntegrationStatus = 'available' | 'disabled';
export type IntegrationCategory = 'crm' | 'marketing' | 'video' | 'calendar' | 'email';

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  category: IntegrationCategory[];
  imagePath: string;
}

export const integrations: Integration[] = [
  // CRM Integrations
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts, deals, and automate your CRM workflow.',
    status: 'available',
    category: ['crm'],
    imagePath: '/integrations/hubspot.png'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM integration for complete sales management.',
    status: 'disabled',
    category: ['crm'],
    imagePath: '/integrations/salesforce.png'
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Smart sales CRM for managing your pipeline.',
    status: 'disabled',
    category: ['crm'],
    imagePath: '/integrations/pipedrive.png'
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    description: 'Comprehensive CRM for growing businesses.',
    status: 'disabled',
    category: ['crm'],
    imagePath: '/integrations/zoho.png'
  },
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics',
    description: 'Enterprise business solution for sales and customer management.',
    status: 'disabled',
    category: ['crm'],
    imagePath: '/integrations/dynamics.png'
  },

  // Marketing Integrations
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform.',
    status: 'disabled',
    category: ['marketing', 'email'],
    imagePath: '/integrations/mailchimp.png'
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Facebook and Instagram advertising integration.',
    status: 'disabled',
    category: ['marketing'],
    imagePath: '/integrations/meta.png'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Marketing',
    description: 'B2B marketing and advertising solutions.',
    status: 'disabled',
    category: ['marketing'],
    imagePath: '/integrations/linkedin.png'
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Search and display advertising platform.',
    status: 'disabled',
    category: ['marketing'],
    imagePath: '/integrations/google-ads.png'
  },
  {
    id: 'marketo',
    name: 'Marketo',
    description: 'B2B marketing automation software.',
    status: 'disabled',
    category: ['marketing'],
    imagePath: '/integrations/marketo.png'
  },

  // Video Conferencing
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing and virtual meetings.',
    status: 'disabled',
    category: ['video'],
    imagePath: '/integrations/zoom.png'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Collaborative meeting and video conference platform.',
    status: 'disabled',
    category: ['video'],
    imagePath: '/integrations/teams.png'
  },
  {
    id: 'meet',
    name: 'Google Meet',
    description: 'Professional video meetings and conferencing.',
    status: 'disabled',
    category: ['video'],
    imagePath: '/integrations/meet.png'
  },
  {
    id: 'webex',
    name: 'Webex',
    description: 'Enterprise video conferencing solution.',
    status: 'disabled',
    category: ['video'],
    imagePath: '/integrations/webex.png'
  },
  {
    id: 'gotomeeting',
    name: 'GoToMeeting',
    description: 'Professional online meeting software.',
    status: 'disabled',
    category: ['video'],
    imagePath: '/integrations/gotomeeting.png'
  },

  // Calendar Integrations
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync and manage your Google Calendar events.',
    status: 'disabled',
    category: ['calendar'],
    imagePath: '/integrations/google-calendar.png'
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Microsoft Outlook calendar integration.',
    status: 'disabled',
    category: ['calendar'],
    imagePath: '/integrations/outlook-calendar.png'
  },
  {
    id: 'apple-calendar',
    name: 'Apple Calendar',
    description: 'iCloud calendar synchronization.',
    status: 'disabled',
    category: ['calendar'],
    imagePath: '/integrations/apple-calendar.png'
  },
  {
    id: 'calendar-bridge',
    name: 'CalendarBridge',
    description: 'Cross-platform calendar synchronization.',
    status: 'disabled',
    category: ['calendar'],
    imagePath: '/integrations/calendar-bridge.png'
  },
  {
    id: 'exchange',
    name: 'Exchange Calendar',
    description: 'Microsoft Exchange calendar integration.',
    status: 'disabled',
    category: ['calendar'],
    imagePath: '/integrations/exchange-calendar.png'
  },

  // Email Messaging
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email integration with Google Workspace.',
    status: 'disabled',
    category: ['email'],
    imagePath: '/integrations/gmail.png'
  },
  {
    id: 'outlook-mail',
    name: 'Outlook Mail',
    description: 'Microsoft Outlook email integration.',
    status: 'disabled',
    category: ['email'],
    imagePath: '/integrations/outlook-mail.png'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing platform.',
    status: 'disabled',
    category: ['email'],
    imagePath: '/integrations/sendgrid.png'
  },
  {
    id: 'constant-contact',
    name: 'Constant Contact',
    description: 'Email marketing and automation tools.',
    status: 'disabled',
    category: ['email'],
    imagePath: '/integrations/constant-contact.png'
  },
  {
    id: 'amazonses',
    name: 'Amazon SES',
    description: 'Cloud-based email sending service.',
    status: 'disabled',
    category: ['email'],
    imagePath: '/integrations/amazonses.png'
  }
];