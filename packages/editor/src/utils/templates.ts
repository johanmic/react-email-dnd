import type { CanvasDocument } from '@react-email-dnd/shared';

/**
 * Metadata for email templates
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: 'transactional' | 'marketing' | 'notification' | 'blank';
  thumbnail?: string;
  tags?: string[];
}

/**
 * Complete template definition with metadata and document
 */
export interface EmailTemplate {
  metadata: TemplateMetadata;
  document: CanvasDocument;
}

/**
 * Generates a unique ID for blocks/sections/rows/columns
 */
function generateId(prefix: string): string {
  const globalCrypto =
    typeof globalThis !== 'undefined'
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;

  const randomSuffix =
    globalCrypto && typeof globalCrypto.randomUUID === 'function'
      ? globalCrypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${randomSuffix}`;
}

/**
 * Blank template - just an empty canvas
 */
const blankTemplate: EmailTemplate = {
  metadata: {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch with an empty canvas',
    category: 'blank',
    tags: ['empty', 'custom'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Untitled Email',
      description: 'A new email created with react-email-dnd',
    },
    variables: {},
    sections: [],
  },
};

/**
 * Welcome email template
 */
const welcomeTemplate: EmailTemplate = {
  metadata: {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'A warm welcome message for new users',
    category: 'transactional',
    tags: ['welcome', 'onboarding', 'getting-started'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Welcome Email',
      description: 'Welcome new users to your service',
      tags: ['welcome', 'onboarding'],
    },
    variables: {
      user_name: 'John Doe',
      company_name: 'Acme Inc.',
      dashboard_url: 'https://example.com/dashboard',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#f6f9fc',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                backgroundColor: '#ffffff',
                padding: '48px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Welcome to {{company_name}}!',
                      as: 'h1',
                      align: 'center',
                      fontSize: 32,
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      margin: '0 0 24px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Hi {{user_name}},',
                      fontSize: 16,
                      color: '#525f7f',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        "Thanks for joining us! We're excited to have you on board. You're now ready to start using all of our features.",
                      fontSize: 16,
                      color: '#525f7f',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        'To get started, click the button below to access your dashboard.',
                      fontSize: 16,
                      color: '#525f7f',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('button'),
                    type: 'button',
                    props: {
                      label: 'Go to Dashboard',
                      href: '{{dashboard_url}}',
                      align: 'center',
                      backgroundColor: '#656ee8',
                      color: '#ffffff',
                      borderRadius: 5,
                      padding: '12px 32px',
                      fontSize: 16,
                      fontWeight: 'bold',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e6ebf1',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'If you have any questions, feel free to reach out to our support team.',
                      fontSize: 14,
                      color: '#8898aa',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Password reset template
 */
const passwordResetTemplate: EmailTemplate = {
  metadata: {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Help users securely reset their password',
    category: 'transactional',
    tags: ['password', 'reset', 'security', 'authentication'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Password Reset Request',
      description: 'Password reset email for users',
      tags: ['password', 'reset'],
    },
    variables: {
      user_name: 'John Doe',
      reset_link: 'https://example.com/reset-password?token=abc123',
      expiry_time: '1 hour',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#ffffff',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                backgroundColor: '#ffffff',
                padding: '40px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Reset Your Password',
                      as: 'h1',
                      align: 'center',
                      fontSize: 28,
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      margin: '0 0 24px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Hello {{user_name}},',
                      fontSize: 16,
                      color: '#444444',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        'We received a request to reset your password. Click the button below to choose a new password.',
                      fontSize: 16,
                      color: '#444444',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('button'),
                    type: 'button',
                    props: {
                      label: 'Reset Password',
                      href: '{{reset_link}}',
                      align: 'center',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      borderRadius: 6,
                      padding: '14px 40px',
                      fontSize: 16,
                      fontWeight: 'bold',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'This link will expire in {{expiry_time}}.',
                      fontSize: 14,
                      color: '#666666',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '24px 0 0 0',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#dddddd',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        "If you didn't request a password reset, you can safely ignore this email.",
                      fontSize: 14,
                      color: '#999999',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Email verification template
 */
const verificationTemplate: EmailTemplate = {
  metadata: {
    id: 'verification',
    name: 'Email Verification',
    description: 'Verify user email addresses with a code',
    category: 'transactional',
    tags: ['verification', 'code', 'authentication', 'security'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Verify Your Email',
      description: 'Email verification with code',
      tags: ['verification', 'email'],
    },
    variables: {
      verification_code: '123456',
      user_email: 'user@example.com',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#ffffff',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                backgroundColor: '#ffffff',
                padding: '40px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Verify Your Email',
                      as: 'h1',
                      align: 'center',
                      fontSize: 28,
                      color: '#0a85ea',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Enter the following code to verify your email address:',
                      fontSize: 16,
                      color: '#444444',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: '{{verification_code}}',
                      fontSize: 40,
                      color: '#000000',
                      fontWeight: 'bold',
                      align: 'center',
                      margin: '0 0 32px 0',
                      padding: '20px',
                      className: 'verification-code',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'This code will expire in 10 minutes.',
                      fontSize: 14,
                      color: '#666666',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0 0 24px 0',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e0e0e0',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: "If you didn't request this code, please ignore this email.",
                      fontSize: 14,
                      color: '#999999',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Newsletter template
 */
const newsletterTemplate: EmailTemplate = {
  metadata: {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Engage your audience with regular updates',
    category: 'marketing',
    tags: ['newsletter', 'marketing', 'updates', 'content'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Monthly Newsletter',
      description: 'Newsletter template for marketing campaigns',
      tags: ['newsletter', 'marketing'],
    },
    variables: {
      company_name: 'Acme Inc.',
      month: 'January',
      year: '2024',
      unsubscribe_url: 'https://example.com/unsubscribe',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#f5f5f5',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                backgroundColor: '#ffffff',
                padding: '40px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: '{{company_name}} Newsletter',
                      as: 'h1',
                      align: 'center',
                      fontSize: 32,
                      color: '#2d3748',
                      fontWeight: 'bold',
                      margin: '0 0 8px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: '{{month}} {{year}} Edition',
                      fontSize: 14,
                      color: '#718096',
                      align: 'center',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e2e8f0',
                      thickness: 2,
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Featured Story',
                      as: 'h2',
                      fontSize: 24,
                      color: '#2d3748',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        "Discover what's new this month. We've been working hard to bring you exciting updates and features that will help you achieve more.",
                      fontSize: 16,
                      color: '#4a5568',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0',
                    },
                  },
                  {
                    id: generateId('button'),
                    type: 'button',
                    props: {
                      label: 'Read Full Story',
                      href: 'https://example.com/story',
                      backgroundColor: '#4299e1',
                      color: '#ffffff',
                      borderRadius: 6,
                      padding: '12px 32px',
                      fontSize: 16,
                      fontWeight: 'medium',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e2e8f0',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Quick Updates',
                      as: 'h2',
                      fontSize: 20,
                      color: '#2d3748',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: '• New feature launches next week\n• Community event this Friday\n• Product update available now',
                      fontSize: 15,
                      color: '#4a5568',
                      lineHeight: '1.8',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e2e8f0',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'You received this email because you subscribed to our newsletter.',
                      fontSize: 12,
                      color: '#a0aec0',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0 0 8px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Unsubscribe',
                      fontSize: 12,
                      color: '#4299e1',
                      align: 'center',
                      margin: '0',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Order confirmation template
 */
const orderConfirmationTemplate: EmailTemplate = {
  metadata: {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Confirm customer orders with detailed information',
    category: 'transactional',
    tags: ['order', 'ecommerce', 'confirmation', 'receipt'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Order Confirmation',
      description: 'E-commerce order confirmation email',
      tags: ['order', 'confirmation'],
    },
    variables: {
      customer_name: 'John Doe',
      order_number: '#12345',
      order_date: 'January 15, 2024',
      total_amount: '$99.99',
      tracking_url: 'https://example.com/track/12345',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#fafafa',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                backgroundColor: '#ffffff',
                padding: '48px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Order Confirmed!',
                      as: 'h1',
                      align: 'center',
                      fontSize: 32,
                      color: '#10b981',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Thank you for your order, {{customer_name}}!',
                      fontSize: 18,
                      color: '#374151',
                      align: 'center',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e5e7eb',
                      thickness: 1,
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: 'Order Details',
                      as: 'h2',
                      fontSize: 20,
                      color: '#1f2937',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Order Number: {{order_number}}',
                      fontSize: 15,
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: '0 0 8px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Order Date: {{order_date}}',
                      fontSize: 15,
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: '0 0 8px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Total Amount: {{total_amount}}',
                      fontSize: 18,
                      color: '#1f2937',
                      fontWeight: 'bold',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('button'),
                    type: 'button',
                    props: {
                      label: 'Track Your Order',
                      href: '{{tracking_url}}',
                      align: 'center',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      borderRadius: 8,
                      padding: '14px 32px',
                      fontSize: 16,
                      fontWeight: 'bold',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#e5e7eb',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        'If you have any questions about your order, please contact our support team.',
                      fontSize: 14,
                      color: '#9ca3af',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Notification template
 */
const notificationTemplate: EmailTemplate = {
  metadata: {
    id: 'notification',
    name: 'Notification',
    description: 'Alert users about important updates or events',
    category: 'notification',
    tags: ['notification', 'alert', 'update'],
  },
  document: {
    version: 1,
    meta: {
      title: 'New Notification',
      description: 'General notification template',
      tags: ['notification'],
    },
    variables: {
      notification_title: 'New Activity',
      notification_message: 'You have new activity on your account.',
      action_url: 'https://example.com/notifications',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#ffffff',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                padding: '32px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: '{{notification_title}}',
                      as: 'h1',
                      fontSize: 24,
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: '{{notification_message}}',
                      fontSize: 16,
                      color: '#4a4a4a',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0',
                    },
                  },
                  {
                    id: generateId('button'),
                    type: 'button',
                    props: {
                      label: 'View Details',
                      href: '{{action_url}}',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      borderRadius: 6,
                      padding: '12px 28px',
                      fontSize: 15,
                      fontWeight: 'medium',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Invitation template
 */
const invitationTemplate: EmailTemplate = {
  metadata: {
    id: 'invitation',
    name: 'Team Invitation',
    description: 'Invite users to join your team or workspace',
    category: 'transactional',
    tags: ['invitation', 'team', 'collaboration'],
  },
  document: {
    version: 1,
    meta: {
      title: 'Team Invitation',
      description: 'Invite users to join your team',
      tags: ['invitation', 'team'],
    },
    variables: {
      recipient_name: 'Jane Smith',
      inviter_name: 'John Doe',
      team_name: 'Engineering Team',
      invitation_url: 'https://example.com/accept-invite/abc123',
    },
    sections: [
      {
        id: generateId('section'),
        type: 'section',
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
        rows: [
          {
            id: generateId('row'),
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: generateId('column'),
                type: 'column',
                backgroundColor: '#ffffff',
                padding: '48px',
                blocks: [
                  {
                    id: generateId('heading'),
                    type: 'heading',
                    props: {
                      content: "You've Been Invited!",
                      as: 'h1',
                      align: 'center',
                      fontSize: 30,
                      color: '#0f172a',
                      fontWeight: 'bold',
                      margin: '0 0 24px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content: 'Hello {{recipient_name}},',
                      fontSize: 16,
                      color: '#334155',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        '{{inviter_name}} has invited you to join {{team_name}}. Accept the invitation to start collaborating with your team.',
                      fontSize: 16,
                      color: '#334155',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0',
                    },
                  },
                  {
                    id: generateId('button'),
                    type: 'button',
                    props: {
                      label: 'Accept Invitation',
                      href: '{{invitation_url}}',
                      align: 'center',
                      backgroundColor: '#0ea5e9',
                      color: '#ffffff',
                      borderRadius: 8,
                      padding: '14px 36px',
                      fontSize: 16,
                      fontWeight: 'bold',
                    },
                  },
                  {
                    id: generateId('divider'),
                    type: 'divider',
                    props: {
                      color: '#cbd5e1',
                      thickness: 1,
                      margin: '32px 0',
                    },
                  },
                  {
                    id: generateId('text'),
                    type: 'text',
                    props: {
                      content:
                        "If you weren't expecting this invitation, you can safely ignore this email.",
                      fontSize: 13,
                      color: '#94a3b8',
                      lineHeight: '1.6',
                      align: 'center',
                      margin: '0',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * All available templates
 */
export const emailTemplates: EmailTemplate[] = [
  blankTemplate,
  welcomeTemplate,
  passwordResetTemplate,
  verificationTemplate,
  newsletterTemplate,
  orderConfirmationTemplate,
  notificationTemplate,
  invitationTemplate,
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((template) => template.metadata.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: TemplateMetadata['category']
): EmailTemplate[] {
  return emailTemplates.filter((template) => template.metadata.category === category);
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): EmailTemplate[] {
  return emailTemplates.filter(
    (template) => template.metadata.tags?.includes(tag)
  );
}

/**
 * Create a new document from a template
 * Generates fresh IDs for all sections, rows, columns, and blocks
 */
export function createDocumentFromTemplate(templateId: string): CanvasDocument | null {
  const template = getTemplateById(templateId);
  if (!template) {
    return null;
  }

  // Deep clone the document and regenerate all IDs
  const clonedDoc = JSON.parse(JSON.stringify(template.document)) as CanvasDocument;
  
  // Regenerate IDs for all sections, rows, columns, and blocks
  clonedDoc.sections = clonedDoc.sections.map((section) => ({
    ...section,
    id: generateId('section'),
    rows: section.rows.map((row) => ({
      ...row,
      id: generateId('row'),
      columns: row.columns.map((column) => ({
        ...column,
        id: generateId('column'),
        blocks: column.blocks.map((block) => ({
          ...block,
          id: generateId(block.type),
        })),
      })),
    })),
  }));

  return clonedDoc;
}

/**
 * List all available template categories
 */
export function getTemplateCategories(): TemplateMetadata['category'][] {
  const categories = new Set(
    emailTemplates.map((template) => template.metadata.category)
  );
  return Array.from(categories);
}

/**
 * List all available template tags
 */
export function getTemplateTags(): string[] {
  const tags = new Set<string>();
  emailTemplates.forEach((template) => {
    template.metadata.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}
