import preferIfNewline from './rules/prefer-if-newline'
import * as recommended from './configs/recommended'

export const configs = {
  recommended,
}

export default {
  rules: {
    'prefer-if-newline': preferIfNewline,
  },
}
