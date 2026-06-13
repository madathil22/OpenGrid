import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'API Reference',
      items: ['api/column-defs', 'api/grid-options', 'api/grid-api'],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/virtualization',
        'features/sorting',
        'features/filtering',
        'features/grouping',
        'features/selection',
        'features/export',
        'features/theming',
      ],
    },
  ],
};

export default sidebars;
