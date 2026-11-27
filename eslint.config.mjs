import next from 'eslint-config-next';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'docs/ca2/**',
      'scripts/ca2/**',
      'hardware/**',
      'public/assets/**',
    ],
  },
  ...next,
];

export default config;
