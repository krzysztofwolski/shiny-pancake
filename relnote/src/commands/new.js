const {execSync} = require('child_process')
const {writeFileSync} = require('fs')
const path = require('path')

const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')

const notesDir = 'release-notes'

const noteTypes = {
  intro: 'intro.md',
  feature: 'feature.md',
  fix: 'bugfix.md',
  doc: 'doc.md',
  deprecated: 'deprecated.md',
  breaking: 'breaking.md',
  misc: 'misc.md',
}

const gitBranchName = () => {
  return execSync('git branch --show-current', (error, stdout, stderr) => {
    if (error || stderr) {
      return
    }
    return stdout
  })
}

const defaultNoteName = () => {
  const branch = gitBranchName()
  if (!branch || ['master', 'main'].indexOf(branch) >= 0) {
    return 'new-note'
  }
  return branch.toString().trim()
}

const createNoteFile = (name, noteType) => {
  const filePath = path.join(process.cwd().toString(), notesDir, `${name}.${noteTypes[noteType]}`)
  writeFileSync(filePath, '')
}

class NewCommand extends Command {
  async run() {
    const {flags} = this.parse(NewCommand)
    let noteType = flags.noteType
    if (!noteType) {
      let responses = await inquirer.prompt([{
        name: 'noteType',
        message: 'select a note type',
        type: 'list',
        choices: Object.keys(noteTypes).map(noteType => {
          return {name: noteType}
        }),
      }])
      noteType = responses.noteType
    }

    let noteName = flags.name
    if (!noteName) {
      let responses = await inquirer.prompt([{
        name: 'noteName',
        message: 'enter a note name',
        type: 'input',
        default: defaultNoteName(),
      }])
      noteName = responses.noteName
    }

    createNoteFile(noteName, noteType)
  }
}

NewCommand.description = `Describe the command here
...
Extra documentation goes here
`

NewCommand.flags = {
  noteType: flags.string({char: 't', description: 'type of release note', options: Object.keys(noteTypes), required: false}),
  name: flags.string({char: 'n', description: 'name of release note', required: false}),
}

module.exports = NewCommand
