import { access, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { rules } from 'eslint-plugin-ntnyq'
import { format } from 'oxfmt'

const START_MARKER = '<!-- rules:start -->'
const END_MARKER = '<!-- rules:end -->'
const shouldCheck = process.argv.includes('--check')

for (const ruleId of Object.keys(rules)) {
  await access(new URL(`../docs/rules/${ruleId}.md`, import.meta.url))
  await access(new URL(`../tests/rules/${ruleId}.test.ts`, import.meta.url))
}

for (const [filename, baseUrl] of [
  ['README.md', 'https://eslint-plugin.ntnyq.com/rules/'],
  ['docs/rules/index.md', '/rules/'],
]) {
  const file = new URL(`../${filename}`, import.meta.url)
  const content = await readFile(file, 'utf8')
  const start = content.indexOf(START_MARKER)
  const end = content.indexOf(END_MARKER, start)
  if (start === -1 || end === -1) {
    throw new Error(`Missing rule table markers in ${filename}`)
  }

  const rows = Object.entries(rules).map(([ruleId, rule]) => {
    const meta = rule.meta
    if (!meta?.docs?.description) {
      throw new Error(`Missing documentation metadata for ${ruleId}`)
    }
    const description = meta.docs.description.replace(/^./u, char =>
      char.toUpperCase(),
    )
    return `| [${ruleId}](${baseUrl}${ruleId}.html) | ${description} | ${meta.fixable ? '🔧' : ''} | ${meta.hasSuggestions ? '💡' : ''} |`
  })
  const table = [
    '| Name | Description | 🔧 | 💡 |',
    '| :--- | :--- | :---: | :---: |',
    ...rows,
  ].join('\n')
  const formatted = await format('rules.md', table)
  if (formatted.errors.length) {
    throw new Error(`Cannot format rule table in ${filename}`)
  }
  const updated = `${content.slice(0, start + START_MARKER.length)}\n\n${formatted.code.trimEnd()}\n\n${content.slice(end)}`

  if (shouldCheck) {
    if (updated !== content) {
      throw new Error(`Stale rule table in ${filename}; run pnpm docs:generate`)
    }
  } else {
    await writeFile(file, updated)
    console.log(`Updated ${fileURLToPath(file)}`)
  }
}
