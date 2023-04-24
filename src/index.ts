import * as all from './configs/all'
import * as recommended from './configs/recommended'
import noMemberAccessibility from './rules/no-member-accessibility'

export const configs = {
  all,
  recommended,
}

export const rules = {
  'no-member-accessibility': noMemberAccessibility,
}

export default {
  configs,
  rules,
}
