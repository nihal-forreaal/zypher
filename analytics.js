// Import the inject function from @vercel/analytics
// This uses the ES module from node_modules
import { inject } from './node_modules/@vercel/analytics/dist/index.mjs';

// Initialize Vercel Web Analytics
inject();

console.log('Vercel Analytics initialized');
