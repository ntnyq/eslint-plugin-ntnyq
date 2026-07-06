/**
 * @file meta.ts
 */

import { name, version } from '../../package.json'

/**
 * npm package name, it's unique
 */
export const packageName = name

/**
 * Shared meta info
 */
export const appTitle: string = packageName
export const appVersion: string = version
export const appUrl: string = `https://${packageName}.ntnyq.com`
export const appDescription: string = 'An opinionated ESLint plugin.'
