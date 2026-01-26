/**
 * @copyright {@link https://github.com/eslint-stylistic/eslint-stylistic}
 */

import { toArray } from '@ntnyq/utils'
import { deepMerge, isObjectNotArray } from './merge'
import type { Rule } from 'eslint'
import type {
  RuleContext,
  RuleListener,
  RuleWithMeta,
  RuleWithMetaAndName,
} from '../types'

export interface ESLintRuleModule<TOptions extends readonly unknown[]>
  extends Rule.RuleModule {
  defaultOptions: TOptions
}

export interface PluginDocs {
  recommended?: boolean
}

function createRule<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
>({
  create,
  defaultOptions,
  meta,
}: Readonly<
  RuleWithMeta<TOptions, TMessageIds, PluginDocs>
>): ESLintRuleModule<TOptions> {
  const resolvedDefaultOptions = toArray(defaultOptions) as unknown as TOptions
  return {
    defaultOptions: resolvedDefaultOptions,
    create: ((
      context: Readonly<RuleContext<TMessageIds, TOptions>>,
    ): RuleListener => {
      const optionsCount = Math.max(
        context.options.length,
        resolvedDefaultOptions.length,
      )
      const optionsWithDefault = Array.from(
        { length: optionsCount },
        (_, i) => {
          /* v8 ignore start */
          if (
            isObjectNotArray(context.options[i]) &&
            isObjectNotArray(resolvedDefaultOptions[i])
          ) {
            return deepMerge(resolvedDefaultOptions[i], context.options[i])
          }
          return context.options[i] ?? resolvedDefaultOptions[i]
          /* v8 ignore stop */
        },
      ) as unknown as TOptions
      return create(context, optionsWithDefault)
    }) as unknown as Rule.RuleModule['create'],
    meta: {
      ...meta,
      defaultOptions: resolvedDefaultOptions as unknown as unknown[],
    },
  }
}

function RuleCreator(urlCreator: (name: string) => string) {
  return function createNamedRule<
    TOptions extends readonly unknown[],
    TMessageIds extends string,
  >({
    meta,
    name,
    ...rule
  }: Readonly<
    RuleWithMetaAndName<TOptions, TMessageIds, PluginDocs>
  >): ESLintRuleModule<TOptions> {
    return createRule<TOptions, TMessageIds>({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name),
        },
      },
      ...rule,
    })
  }
}
export const createESLintRule: <
  TOptions extends readonly unknown[],
  TMessageIds extends string,
>({
  meta,
  name,
  ...rule
}: Readonly<
  RuleWithMetaAndName<TOptions, TMessageIds, PluginDocs>
>) => ESLintRuleModule<TOptions> = RuleCreator(
  ruleName => `https://eslint-plugin.ntnyq.com/rules/${ruleName}.html`,
)
