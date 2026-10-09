/**
 * @file meta.ts
 */

import pkg from '../../package.json' with { type: 'json' }

/**
 * npm package name, it's unique
 */
export const packageName = pkg.name

/**
 * Shared meta info
 */
export const appTitle: string = packageName
export const appVersion: string = pkg.version
export const appUrl: string = `https://${packageName}.ntnyq.com`
export const appDescription: string = 'An opinionated ESLint plugin.'
