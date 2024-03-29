import * as all from './configs/all'
import * as recommended from './configs/recommended'
import noMemberAccessibility from './rules/no-member-accessibility'

// defined in tsup.config.ts
declare const __PKG_NAME__: string
declare const __PKG_VERSION__: string

export const meta = {
  name: __PKG_NAME__,
  version: __PKG_VERSION__,
}

export const configs = {
  all,
  recommended,
}

export const rules = {
  'no-member-accessibility': noMemberAccessibility,
}

const plugin = {
  meta,
  configs,
  rules,
}

export default plugin
