import { SparkleIcon } from '@phosphor-icons/react';
import type { CustomBlockDefinition, CustomBlockPropEditorProps } from '@react-email-dnd/shared';
import { ComponentType } from 'react';

import { Section, Img, Text, Row, Column, Link } from '@react-email/components';

interface FooterProps extends Record<string, unknown> {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  backgroundColor?: string;
  textColor?: string;
}
export const Footer = ({
  title,
  description,
  backgroundColor = '#f8f9fa',
  textColor = '#6c757d',
}: FooterProps) => {
  return (
    <Section style={{ backgroundColor, padding: '32px 24px' }}>
      <table className="w-full">
        <tr className="w-full">
          <td align="center">
            <Img
              alt="React Email logo"
              height="42"
              src="https://react.email/static/logo-without-background.png"
            />
          </td>
        </tr>
        <tr className="w-full">
          <td align="center">
            <Text style={{ color: textColor, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              {title}
            </Text>
            <Text style={{ color: textColor, fontSize: 14, marginBottom: 0 }}>{description}</Text>
          </td>
        </tr>
        <tr>
          <td align="center">
            <Row className="table-cell h-[44px] w-[56px] align-bottom">
              <Column className="pr-[8px]">
                <Link href="#">
                  <Img
                    alt="Facebook"
                    height="36"
                    src="https://react.email/static/facebook-logo.png"
                    width="36"
                  />
                </Link>
              </Column>
              <Column className="pr-[8px]">
                <Link href="#">
                  <Img alt="X" height="36" src="https://react.email/static/x-logo.png" width="36" />
                </Link>
              </Column>
              <Column>
                <Link href="#">
                  <Img
                    alt="Instagram"
                    height="36"
                    src="https://react.email/static/instagram-logo.png"
                    width="36"
                  />
                </Link>
              </Column>
            </Row>
          </td>
        </tr>
        <tr>
          <td align="center">
            <Text style={{ color: textColor, fontSize: 14, marginBottom: 4 }}>
              123 Main Street Anytown, CA 12345
            </Text>
            <Text style={{ color: textColor, fontSize: 14, marginBottom: 0 }}>
              mail@example.com +123456789
            </Text>
          </td>
        </tr>
      </table>
    </Section>
  );
};

export function FooterPropsEditor({
  value,
  onChange,
  disabled,
}: CustomBlockPropEditorProps<FooterProps>) {
  const fieldCls =
    'w-full px-3 py-2 rounded-md text-sm border border-base-300 bg-base-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition';
  const labelCls = 'block text-sm font-medium mb-2 text-base-content/80';
  const helpCls = 'block text-xs mt-1 text-base-content/60';

  return (
    <fieldset disabled={disabled} className="space-y-6">
      <div>
        <label className={labelCls}>Company Title</label>
        <input
          type="text"
          className={fieldCls}
          value={value.title ?? ''}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Acme Corporation"
        />
      </div>

      <div>
        <label className={labelCls}>Tagline</label>
        <input
          type="text"
          className={fieldCls}
          value={value.description ?? ''}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Think different"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Background Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-12 h-10 rounded-md border border-base-300"
              value={value.backgroundColor ?? '#f8f9fa'}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
            />
            <input
              type="text"
              className={fieldCls}
              value={value.backgroundColor ?? '#f8f9fa'}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
            />
          </div>
          <span className={helpCls}>Controls the footer background.</span>
        </div>

        <div>
          <label className={labelCls}>Text Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-12 h-10 rounded-md border border-base-300"
              value={value.textColor ?? '#6c757d'}
              onChange={(event) => onChange({ textColor: event.target.value })}
            />
            <input
              type="text"
              className={fieldCls}
              value={value.textColor ?? '#6c757d'}
              onChange={(event) => onChange({ textColor: event.target.value })}
            />
          </div>
          <span className={helpCls}>Applies to all text in the footer.</span>
        </div>
      </div>
    </fieldset>
  );
}

export const footerBlockDefinition: CustomBlockDefinition<FooterProps> = {
  id: 'footer',
  type: 'custom',
  label: 'Footer',
  icon: SparkleIcon,
  defaults: {
    componentName: 'Footer',
    props: {
      title: 'Acme Corporation',
      description: 'Think different',
      ctaLabel: 'Learn More',
      ctaHref: 'https://example.com',
      backgroundColor: '#f8f9fa',
      textColor: '#6c757d',
    },
  },
  component: Footer,
  propEditor: FooterPropsEditor,
};
