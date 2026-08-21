'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Settings as SettingsIcon,
  Search,
  Palette,
  Mail,
  Puzzle,
  Upload,
  Globe,
  Languages,
  Clock,
  Image,
  Code,
  Send,
  ChevronDown,
  BarChart3,
  GitBranch,
  MessageSquare,
  CreditCard,
  Shield,
  Cloud,
} from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
] as const;

type TabId = (typeof tabs)[number]['id'];

const themeColors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#14b8a6',
  '#f97316',
  '#64748b',
];

const integrations = [
  {
    id: 'ga',
    name: 'Google Analytics',
    description: 'Track website traffic and user behavior',
    icon: BarChart3,
    connected: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and newsletter management',
    icon: Mail,
    connected: false,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN, security, and performance optimization',
    icon: Cloud,
    connected: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and version control',
    icon: GitBranch,
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: MessageSquare,
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscriptions',
    icon: CreditCard,
    connected: true,
  },
];

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
        enabled ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // General
  const [siteTitle, setSiteTitle] = useState('My Awesome Blog');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteUrl, setSiteUrl] = useState('https://example.com');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  // SEO
  const [metaTemplate, setMetaTemplate] = useState('%title% | %sitename%');
  const [metaDescription, setMetaDescription] = useState('');
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [robotsTxt, setRobotsTxt] = useState(
    'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml'
  );

  // Appearance
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [layoutOption, setLayoutOption] = useState<'sidebar' | 'topnav'>('sidebar');
  const [font, setFont] = useState('inter');
  const [customCss, setCustomCss] = useState('');

  // Email
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [encryption, setEncryption] = useState('tls');

  // Integrations
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.connected]))
  );

  const toggleIntegration = (id: string) => {
    setIntegrationStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Manage your site configuration and preferences
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-border">
        <div className="flex gap-0.5 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200',
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted border-transparent hover:text-foreground hover:border-border'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in duration-200">
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Site Title
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Site Description
              </label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
                placeholder="A brief description of your site..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Site URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light" />
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Logo
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors cursor-pointer group">
                <div className="h-12 w-12 bg-primary-light rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Drop your logo here or{' '}
                  <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted mt-1">
                  SVG, PNG, JPG up to 2MB
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted" />
                    Timezone
                  </div>
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light pointer-events-none" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST (UTC-5)</option>
                    <option value="CST">CST (UTC-6)</option>
                    <option value="MST">MST (UTC-7)</option>
                    <option value="PST">PST (UTC-8)</option>
                    <option value="IST">IST (UTC+5:30)</option>
                    <option value="CET">CET (UTC+1)</option>
                    <option value="JST">JST (UTC+9)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5 text-muted" />
                    Language
                  </div>
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light pointer-events-none" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="pt">Portuguese</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-border-light">
              <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Meta Title Template
                </label>
                <input
                  type="text"
                  value={metaTemplate}
                  onChange={(e) => setMetaTemplate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-xs text-muted mt-1.5">
                  Variables: %title%, %sitename%, %sep%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Default Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Default description for pages without a custom one..."
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            {/* OG Preview */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Social Sharing Preview
              </h3>
              <div className="border border-border rounded-xl overflow-hidden max-w-md">
                <div className="h-40 bg-gradient-to-br from-primary-light to-primary-lighter flex items-center justify-center">
                  <Image className="h-10 w-10 text-primary/40" />
                </div>
                <div className="p-4 bg-background">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">
                    example.com
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {siteTitle || 'Your Site Title'}
                  </p>
                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {metaDescription ||
                      'Your site description will appear here when shared on social media.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sitemap</p>
                  <p className="text-xs text-muted mt-0.5">
                    Automatically generate XML sitemap
                  </p>
                </div>
                <Toggle
                  enabled={sitemapEnabled}
                  onChange={() => setSitemapEnabled(!sitemapEnabled)}
                />
              </div>
              <div className="pt-4 border-t border-border-light">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Robots.txt
                </label>
                <textarea
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Theme Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={cn(
                      'h-10 w-10 rounded-full transition-all duration-200 hover:scale-110',
                      themeColor === color
                        ? 'ring-2 ring-offset-2 ring-offset-surface scale-110'
                        : ''
                    )}
                    style={{
                      backgroundColor: color,
                      ...(themeColor === color
                        ? { ringColor: color }
                        : {}),
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Layout
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLayoutOption('sidebar')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    layoutOption === 'sidebar'
                      ? 'border-primary bg-primary-light'
                      : 'border-border hover:border-muted-light'
                  )}
                >
                  <div className="flex gap-2 mb-3">
                    <div className="w-4 h-10 bg-foreground/10 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-foreground/10 rounded w-full" />
                      <div className="h-6 bg-foreground/5 rounded w-full" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">Sidebar</p>
                  <p className="text-xs text-muted mt-0.5">
                    Side navigation layout
                  </p>
                </button>
                <button
                  onClick={() => setLayoutOption('topnav')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    layoutOption === 'topnav'
                      ? 'border-primary bg-primary-light'
                      : 'border-border hover:border-muted-light'
                  )}
                >
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-foreground/10 rounded w-full" />
                    <div className="h-8 bg-foreground/5 rounded w-full" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Top Nav</p>
                  <p className="text-xs text-muted mt-0.5">
                    Top navigation layout
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Font Family
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light pointer-events-none" />
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="inter">Inter</option>
                    <option value="roboto">Roboto</option>
                    <option value="poppins">Poppins</option>
                    <option value="dm-sans">DM Sans</option>
                    <option value="nunito">Nunito</option>
                    <option value="lato">Lato</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Custom CSS
                </label>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  rows={6}
                  placeholder="/* Add your custom styles here */"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground font-mono placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* EMAIL TAB */}
        {activeTab === 'email' && (
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.example.com"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  SMTP Port
                </label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Encryption
              </label>
              <div className="relative w-full max-w-xs">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light pointer-events-none" />
                <select
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border-light">
              <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
                Save
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-primary text-foreground hover:text-primary rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary-light">
                <Send className="h-4 w-4" />
                Send Test Email
              </button>
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                        integrationStates[integration.id]
                          ? 'bg-primary-light text-primary'
                          : 'bg-background text-muted'
                      )}
                    >
                      <integration.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {integration.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    enabled={integrationStates[integration.id]}
                    onChange={() => toggleIntegration(integration.id)}
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-border-light">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
                      integrationStates[integration.id]
                        ? 'bg-success-light text-success'
                        : 'bg-background text-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        integrationStates[integration.id]
                          ? 'bg-success'
                          : 'bg-muted-light'
                      )}
                    />
                    {integrationStates[integration.id]
                      ? 'Connected'
                      : 'Disconnected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
