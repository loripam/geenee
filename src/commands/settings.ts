/* ns__file unit: static-command, comp: settings.ts */
/*
* This file is autogenerated using the easy-oclif-cli template with ns-flip. Please view
* the instructions for this code base at meta/instructions.md.
*/

/* ns__start_section imports */
import {Command, flags} from '@oclif/command'

/* ns__custom_start customImports */
import {settingsMenu} from '../custom/codeGeneration/codeBases/settings/settingsMenu'
import {promptToGenerateCode} from '../custom/codeGeneration/codeBases/inputs/promptToGenerateCode'
const {getConfig} = require('magicalstrings').configs
const {dirNames} = require('magicalstrings').constants
const {getNsInfo} = require('magicalstrings').nsFiles
const {resolveDir} = require('magicalstrings').resolveDir
const diff = require('deep-object-diff').diff
/* ns__custom_end customImports */
/* ns__end_section imports */

export default class Settings extends Command {
static description = `change your settings for the next generation
`

static examples = [
/* ns__custom_start examples */
// replace this when you change your command!! To regenerate fresh, first delete everything between the squre brackets.
  `$ geenee settings sampleCode
You have executed the settings command...
`,
/* ns__custom_end examples */
]

static flags = {
  help: flags.help({char: 'h'}),
}

static args = [
  {
    name: 'code',
    description: 'path to the code base',
    required: true,
  },
]

async run() {
  const {args} = this.parse(Settings)

  const {code} = args
  /* ns__custom_start run */
  const codeDir = resolveDir(code)

  try {
    const config = await getConfig(codeDir +
      `/${dirNames.META}/${dirNames.TEMPLATE}`)
    const nsInfo = await getNsInfo(codeDir)
    const originalSettings = JSON.parse(JSON.stringify(nsInfo))

    const updatedSettings = await settingsMenu(
      config, nsInfo, codeDir
    )
    if (!updatedSettings) return

    const changedSettings = diff(originalSettings, updatedSettings)
    if (Object.keys(changedSettings).length > 0) {
      // there were changes to the settings made
      await promptToGenerateCode(codeDir)
    }
  } catch (error) {
    this.error(error)
    throw new Error(`error with settings: ${error}`)
  }
  /* ns__custom_end run */
}
}
