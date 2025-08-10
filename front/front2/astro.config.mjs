// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), robotsTxt()]
});