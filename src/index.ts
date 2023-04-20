import noMemberAccessibility from './rules/no-member-accessibility'
import * as recommended from './configs/recommended'

export const configs = {
  recommended,
}

export const rules = {
  'no-member-accessibility': noMemberAccessibility,
}

export default {
  configs,
  rules,
}
