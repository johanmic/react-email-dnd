# Email Templates

Ready-made email templates for the React Email DnD editor.

## Overview

The editor package includes a collection of professionally designed, production-ready email templates that you can use as starting points for your email campaigns. Each template follows best practices for email design and includes customizable variables.

## Available Templates

### Blank Template
- **ID**: `blank`
- **Category**: blank
- **Description**: Start from scratch with an empty canvas
- **Best for**: Custom designs from the ground up

### Welcome Email
- **ID**: `welcome`
- **Category**: transactional
- **Description**: A warm welcome message for new users
- **Variables**: `user_name`, `company_name`, `dashboard_url`
- **Best for**: User onboarding and first impressions

### Password Reset
- **ID**: `password-reset`
- **Category**: transactional
- **Description**: Help users securely reset their password
- **Variables**: `user_name`, `reset_link`, `expiry_time`
- **Best for**: Account security and password recovery

### Email Verification
- **ID**: `verification`
- **Category**: transactional
- **Description**: Verify user email addresses with a code
- **Variables**: `verification_code`, `user_email`
- **Best for**: Email confirmation and two-factor authentication

### Newsletter
- **ID**: `newsletter`
- **Category**: marketing
- **Description**: Engage your audience with regular updates
- **Variables**: `company_name`, `month`, `year`, `unsubscribe_url`
- **Best for**: Marketing campaigns and regular updates

### Order Confirmation
- **ID**: `order-confirmation`
- **Category**: transactional
- **Description**: Confirm customer orders with detailed information
- **Variables**: `customer_name`, `order_number`, `order_date`, `total_amount`, `tracking_url`
- **Best for**: E-commerce confirmations and receipts

### Notification
- **ID**: `notification`
- **Category**: notification
- **Description**: Alert users about important updates or events
- **Variables**: `notification_title`, `notification_message`, `action_url`
- **Best for**: Real-time alerts and system notifications

### Team Invitation
- **ID**: `invitation`
- **Category**: transactional
- **Description**: Invite users to join your team or workspace
- **Variables**: `recipient_name`, `inviter_name`, `team_name`, `invitation_url`
- **Best for**: Collaboration and team management

## Usage

### Basic Usage

```typescript
import { createDocumentFromTemplate } from '@react-email-dnd/editor';

// Create a document from a template
const document = createDocumentFromTemplate('welcome');

// Use it with the EmailEditor
<CanvasProvider initialDocument={document}>
  <EmailEditor />
</CanvasProvider>
```

### Finding Templates

```typescript
import {
  emailTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByTag,
  getTemplateCategories,
  getTemplateTags,
} from '@react-email-dnd/editor';

// Get all templates
console.log(emailTemplates);

// Get a specific template
const welcomeTemplate = getTemplateById('welcome');

// Get all transactional templates
const transactional = getTemplatesByCategory('transactional');

// Get templates with a specific tag
const authTemplates = getTemplatesByTag('authentication');

// Get all available categories
const categories = getTemplateCategories();

// Get all available tags
const tags = getTemplateTags();
```

### Template Previews

```typescript
import {
  generateTemplatePreview,
  generateTemplatePreviews,
  generatePlainTextSummary,
  generateHtmlPreview,
  generateTemplateStatistics,
} from '@react-email-dnd/editor';

// Generate preview metadata for a single template
const welcomeTemplate = getTemplateById('welcome');
const preview = generateTemplatePreview(welcomeTemplate);
console.log(preview.blockCount, preview.variableCount);

// Generate previews for all templates
const allPreviews = generateTemplatePreviews(emailTemplates);

// Generate plain text summary
const summary = generatePlainTextSummary(document);

// Generate HTML preview snippet
const htmlPreview = generateHtmlPreview(document);

// Get statistics across all templates
const stats = generateTemplateStatistics(emailTemplates);
console.log(stats.totalTemplates, stats.averageBlockCount);
```

### Working with Template Variables

Templates include variables that can be replaced with actual values:

```typescript
import { createDocumentFromTemplate } from '@react-email-dnd/editor';
import { renderDocument } from '@react-email-dnd/renderer';

// Create a document from template
const document = createDocumentFromTemplate('welcome');

// Variables are stored in document.variables
console.log(document.variables);
// {
//   user_name: 'John Doe',
//   company_name: 'Acme Inc.',
//   dashboard_url: 'https://example.com/dashboard'
// }

// Update variables with your actual data
document.variables = {
  user_name: 'Jane Smith',
  company_name: 'My Company',
  dashboard_url: 'https://mycompany.com/dashboard',
};

// Render with replaced variables
const html = renderDocument(document);
```

## Template Structure

Each template follows the `EmailTemplate` interface:

```typescript
interface EmailTemplate {
  metadata: {
    id: string;
    name: string;
    description: string;
    category: 'transactional' | 'marketing' | 'notification' | 'blank';
    thumbnail?: string;
    tags?: string[];
  };
  document: CanvasDocument;
}
```

## Template Categories

Templates are organized into four categories:

- **transactional**: User-triggered emails (welcome, password reset, order confirmation)
- **marketing**: Promotional and engagement emails (newsletters, announcements)
- **notification**: System alerts and updates (notifications, reminders)
- **blank**: Empty starting points for custom designs

## Creating Custom Templates

You can create your own templates by following the same structure:

```typescript
import type { EmailTemplate } from '@react-email-dnd/editor';

const myCustomTemplate: EmailTemplate = {
  metadata: {
    id: 'my-template',
    name: 'My Custom Template',
    description: 'A custom template for my use case',
    category: 'transactional',
    tags: ['custom', 'special'],
  },
  document: {
    version: 1,
    meta: {
      title: 'My Template',
      description: 'Custom template description',
    },
    variables: {
      custom_var: 'Default value',
    },
    sections: [
      // Your custom sections, rows, columns, and blocks
    ],
  },
};
```

## Best Practices

1. **Always use `createDocumentFromTemplate()`** instead of directly cloning templates - this ensures unique IDs for all elements.

2. **Customize variables** to match your application's data:
   ```typescript
   const doc = createDocumentFromTemplate('welcome');
   doc.variables = { ...doc.variables, user_name: actualUserName };
   ```

3. **Preview templates** before using them in production:
   ```typescript
   const preview = generateTemplatePreview(template);
   console.log(`This template has ${preview.blockCount} blocks`);
   ```

4. **Use categories and tags** to organize templates in your UI:
   ```typescript
   const categories = getTemplateCategories();
   categories.forEach(category => {
     const templates = getTemplatesByCategory(category);
     // Display templates grouped by category
   });
   ```

## Example: Template Gallery

See the example app for a complete implementation of a template gallery:

```bash
cd packages/editor/example
pnpm dev
```

Navigate to the "Templates" tab to see the template picker in action.

## API Reference

### Template Functions

#### `emailTemplates: EmailTemplate[]`
Array of all available templates.

#### `getTemplateById(id: string): EmailTemplate | undefined`
Get a specific template by its ID.

#### `getTemplatesByCategory(category: string): EmailTemplate[]`
Get all templates in a specific category.

#### `getTemplatesByTag(tag: string): EmailTemplate[]`
Get all templates with a specific tag.

#### `createDocumentFromTemplate(templateId: string): CanvasDocument | null`
Create a new document from a template with fresh IDs for all elements.

#### `getTemplateCategories(): string[]`
Get all available template categories.

#### `getTemplateTags(): string[]`
Get all available template tags (sorted alphabetically).

### Preview Functions

#### `generateTemplatePreview(template: EmailTemplate): TemplatePreview`
Generate preview metadata for a template.

#### `generateTemplatePreviews(templates: EmailTemplate[]): TemplatePreview[]`
Generate previews for multiple templates.

#### `generatePlainTextSummary(document: CanvasDocument): string`
Generate a plain text summary of a document.

#### `generateHtmlPreview(document: CanvasDocument): string`
Generate an HTML preview snippet for display in a template picker.

#### `generateTemplateStatistics(templates: EmailTemplate[]): TemplateStatistics`
Calculate statistics across a collection of templates.

## Contributing

To add new templates to the library:

1. Add your template to `packages/editor/src/utils/templates.ts`
2. Follow the existing template structure
3. Include appropriate metadata (name, description, category, tags)
4. Add variables for customization
5. Test your template validates against the schema
6. Update this documentation

## License

See the root LICENSE file for license information.
