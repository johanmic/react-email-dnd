import { Section, Row, Column, Heading, Text, Button } from '@react-email/components';
import type { CustomBlockDefinition, CustomBlockPropEditorProps } from 'react-email-dnd';
import { SparkleIcon } from '@phosphor-icons/react';

export interface HeroBlockProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  backgroundColor?: string;
  textColor?: string;
}

function HeroBlock({
  title,
  description,
  ctaLabel,
  ctaHref,
  backgroundColor = '#0ea5e9',
  textColor = '#ffffff',
}: HeroBlockProps) {
  return (
    <Section style={{ backgroundColor, padding: '32px 24px' }}>
      <Row>
        <Column style={{ textAlign: 'center' }}>
          <Heading style={{ color: textColor, fontSize: 28, marginBottom: 12 }}>{title}</Heading>
          <Text style={{ color: textColor, fontSize: 16, lineHeight: '24px', marginBottom: 20 }}>
            {description}
          </Text>
          <Button
            href={ctaHref}
            style={{
              backgroundColor: '#f97316',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: 24,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {ctaLabel}
          </Button>
        </Column>
      </Row>
    </Section>
  );
}

export const heroBlockDefinition: CustomBlockDefinition<HeroBlockProps> = {
  id: 'hero-banner',
  type: 'custom',
  label: 'Hero Banner',
  icon: SparkleIcon,
  defaults: {
    componentName: 'HeroBlock',
    props: {
      title: 'Launch something delightful',
      description: 'Announce a promotion, product update, or new feature with a bold hero.',
      ctaLabel: 'Shop now',
      ctaHref: 'https://example.com',
      backgroundColor: '#0ea5e9',
      textColor: '#ffffff',
    },
  },
  component: HeroBlock,
};

function HeroBlockPropsEditor({
  value,
  onChange,
  disabled,
}: CustomBlockPropEditorProps<HeroBlockProps>) {
  const fieldCls =
    'w-full px-3 py-2 rounded-md text-sm border border-base-300 bg-base-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition';
  const labelCls = 'block text-sm font-medium mb-2 text-base-content/80';
  const helpCls = 'block text-xs mt-1 text-base-content/60';

  return (
    <fieldset disabled={disabled} className="space-y-6">
      <div>
        <label className={labelCls}>Title</label>
        <input
          type="text"
          className={fieldCls}
          value={value.title ?? ''}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Launch something delightful"
        />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${fieldCls} resize-y min-h-[80px]`}
          value={value.description ?? ''}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Announce a promotion, product update, or new feature with a bold hero."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>CTA Label</label>
          <input
            type="text"
            className={fieldCls}
            value={value.ctaLabel ?? ''}
            onChange={(event) => onChange({ ctaLabel: event.target.value })}
            placeholder="Shop now"
          />
        </div>
        <div>
          <label className={labelCls}>CTA URL</label>
          <input
            type="url"
            className={fieldCls}
            value={value.ctaHref ?? ''}
            onChange={(event) => onChange({ ctaHref: event.target.value })}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Background Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-12 h-10 rounded-md border border-base-300"
              value={value.backgroundColor ?? '#0ea5e9'}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
            />
            <input
              type="text"
              className={fieldCls}
              value={value.backgroundColor ?? '#0ea5e9'}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
            />
          </div>
          <span className={helpCls}>Controls the hero section background.</span>
        </div>

        <div>
          <label className={labelCls}>Text Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-12 h-10 rounded-md border border-base-300"
              value={value.textColor ?? '#ffffff'}
              onChange={(event) => onChange({ textColor: event.target.value })}
            />
            <input
              type="text"
              className={fieldCls}
              value={value.textColor ?? '#ffffff'}
              onChange={(event) => onChange({ textColor: event.target.value })}
            />
          </div>
          <span className={helpCls}>Applies to heading and CTA text.</span>
        </div>
      </div>
    </fieldset>
  );
}

export const customBlocks = [heroBlockDefinition];
export const customBlockPropEditors = {
  HeroBlock: HeroBlockPropsEditor,
};
