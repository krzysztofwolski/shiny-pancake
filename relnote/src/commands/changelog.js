const {execSync} = require('child_process')
const {writeFileSync} = require('fs')
const path = require('path')

const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')

let detailedChangelog  = execSync('npx news-fragments preview').toString()
let prChangelog = execSync('npx auto-changelog --stdout --commit-limit false -u --template https://raw.githubusercontent.com/release-it/release-it/master/templates/changelog-compact.hbs').toString()

const getEncodedCharacters = string => {
  // Find all encoded special characters like `&#x60;`
  const regexp = /\&\#\w{3,4}\;/g
  // Set used for duplicate removal
  return [...new Set([...string.matchAll(regexp)].map(e => (e[0])))]
}
const encodedToChar = string => {
  // &#x60; -> 60
  return String.fromCharCode(parseInt(string.slice(3, -1), 16))
}
const decodeChangelog = changelog => {
  const encodedChars = getEncodedCharacters(changelog)
  let decodedChangelog = changelog
  encodedChars.forEach(char => {
    decodedChangelog = decodedChangelog.replace(new RegExp(char, 'g'), encodedToChar(char))
  })
  return decodedChangelog
}

class ChangelogCommand extends Command {
  async run() {
    const {flags} = this.parse(ChangelogCommand)
    const version = flags.version
    console.log(process.cwd().toString())
    let detailedChangelog  = execSync(`npx news-fragments preview -p ${version}`, {cwd: process.cwd().toString()}).toString()
    let prChangelog = execSync('npx auto-changelog --stdout --commit-limit false -u --template https://raw.githubusercontent.com/release-it/release-it/master/templates/changelog-compact.hbs').toString()

    console.log(decodeChangelog(detailedChangelog + '\n\n## Merged PRs\n' + prChangelog))
  }
}

ChangelogCommand.description = `
Command combines \`auto-changelog\` and \`release-notes\` plugins.
`

ChangelogCommand.flags = {
  version: flags.string({char: 'v', description: 'new version for changelog', required: true}),
}

module.exports = ChangelogCommand
