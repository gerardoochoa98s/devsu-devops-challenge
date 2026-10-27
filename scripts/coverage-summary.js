import fs from 'node:fs'

const summaryPath = 'coverage/coverage-summary.json'

if (!fs.existsSync(summaryPath)) {
    console.log('_Coverage summary not found._')
    process.exit(0)
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
const format = (metric) => `${metric.pct.toFixed(2)}%`

console.log('## Test coverage')
console.log('')
console.log('| File | Lines | Statements | Functions | Branches |')
console.log('| --- | ---: | ---: | ---: | ---: |')

for (const [file, values] of Object.entries(summary)) {
    const name =
        file === 'total'
            ? '**Total**'
            : file.replace(`${process.cwd()}\\`, '').replace(`${process.cwd()}/`, '')
    console.log(
        `| ${name} | ${format(values.lines)} | ${format(values.statements)} | ${format(
            values.functions
        )} | ${format(values.branches)} |`
    )
}
