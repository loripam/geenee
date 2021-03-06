/* ns__file unit: static-command, comp: check.ts */
/*
* This file is autogenerated using the easy-oclif-cli template with ns-flip. Please view
* the instructions for this code base at meta/instructions.md.
*/

/* ns__start_section imports */
import {Command, flags} from '@oclif/command'

/* ns__custom_start customImports */
const {links, dirNames, fileNames, suffixes} = require('magicalstrings').constants

import {logEntry} from '../custom/shared/logEntry'
const {resolveDir} = require('magicalstrings').resolveDir
const checkCode = require('geenee-check')

/* ns__custom_end customImports */
/* ns__end_section imports */

export default class Check extends Command {
static description = `checks that the code has been entered safely, meaning that regeneration won't lose any changes
`

static examples = [
/* ns__custom_start examples */
// replace this when you change your command!! To regenerate fresh, first delete everything between the squre brackets.
  `$ geenee check sampleCode
`,
/* ns__custom_end examples */
]

static flags = {
  help: flags.help({char: 'h'}),
}

static args = [
  {
    name: 'code',
    description: 'path to the code base to check',
    required: true,
  },
]

async run() {
  const {args} = this.parse(Check)

  const {code} = args
  /* ns__custom_start run */
  const codeDir = resolveDir(code)
  const testDir = `${codeDir}${suffixes.TEST_DIR}`
  const testMetaDir = `${testDir}/${dirNames.META}`

  const diffsFile = `${testMetaDir}/${fileNames.DIFFS}`
  const logFile = `${testMetaDir}/${fileNames.TESTS_LOG}`

  const problemsFound = await checkCode(codeDir)

  let logMessage = `
You will find all files showing discrepancies in the file ${diffsFile}.
Any discrepancy shown is a problem. See ${links.SAFE_CODE_RULES} for more info
about NoStack compatible code.  For specific instructions to resolve
discrepancies, see ${links.TEST_RESULTS}. `
  if (problemsFound) {
    this.log(`

:( The app did not pass the tests. :(
See the log file ${logFile} or the above messages for more information.`)
    await logEntry(
      logFile, `

:( The app did not pass the tests. :(`, false
    )
    await logEntry(
      logFile, logMessage, true
    )

    this.log(`For documentation: ${links.TEST_RESULTS}`)

    return 1
  }

  logMessage = `
:) The app is passing all tests! :)`
  await logEntry(
    logFile, logMessage, true
  )

  this.log(`Finished the test.  For documentation: ${links.DOCUMENTATION}`)

  return 0
  /* ns__custom_end run */
}
}
