import pkg from '../package.json'
import * as all from './configs/all'
import * as recommended from './configs/recommended'
import noMemberAccessibility from './rules/no-member-accessibility'

export const meta = {
  name: pkg.name,
  version: pkg.version,
}

export const configs = {
  all,
  recommended,
}

export const rules = {
  'no-member-accessibility': noMemberAccessibility,
}

export default {
  meta,
  configs,
  rules,
}
