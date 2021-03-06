import {installDevPackagesTaskList} from './setup/installDevPackagesTaskList'
const {docPages, dirNames, fileNames, links, suffixes} = require('magicalstrings').constants
import {Configuration} from 'magicalstrings'
const getConfig = require('magicalstrings').configs.getConfig
import {CustomCodeRepository}  from 'magicalstrings'
const {dirOptions} = require('magicalstrings').dirOptions
import {createNewCode} from './createNewCode'
import {installMainPackagesTaskList} from './setup/installMainPackagesTaskList'
import {preCommandsTaskList} from './setup/preCommandsTaskList'
import {interactiveSequence} from './setup/interactiveSequence'
const setNsInfo = require('magicalstrings').nsFiles.setNsInfo
import {NsInfo}  from 'magicalstrings'

const fs = require('fs-extra')
const Listr = require('listr')
const yaml = require('js-yaml')

async function checkFolder(starterDir: string) {
  if (await fs.pathExists(starterDir)) {
    try {
      await fs.remove(starterDir)
    } catch (error) {
      throw new Error(`cannot remove the starter ${starterDir}: ${error}`)
    }
  }
}

export async function createStarterAndNewCode(
  templateDir: string,
  codeDir: string,
  session: any,
) {
  const starterDir = codeDir + suffixes.STARTUP_DIR
  const config: Configuration = await getConfig(templateDir)
  const {setupSequence} = config
  if (!setupSequence) throw new Error('\'generate\' cannot run because ' +
    '\'setupSequence\' is undefined in the config of the template.' +
    ` See ${links.DOCUMENTATION}/${docPages.SETUP}.`)

  const {mainInstallation, devInstallation, preCommands, interactive} = setupSequence

  await checkFolder(starterDir)
  if (interactive) await interactiveSequence(interactive, starterDir)

  const starterCreationTaskList = [
    {
      title: 'Execute Pre-Commands',
      task: async () => {
        if (!preCommands) return
        const preCommandsTasks = preCommandsTaskList(
          preCommands, starterDir, session
        ).filter(x => x !== null)
        return new Listr(preCommandsTasks)
      },
    },
    {
      title: 'Add Meta-Data',
      task:
        async () => {
          const metaDir = `${starterDir}/${dirNames.META}`
          const customCode = `${metaDir}/${fileNames.CUSTOM_CODE_FILE}`

          let nsInfo: NsInfo
          try {
            const nsYml = fs.readFileSync(`${templateDir}/${fileNames.SAMPLE_NS_FILE}`, 'utf8')
            nsInfo = await yaml.safeLoad(nsYml)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`error opening sample ns file in the template directory ${templateDir}`)
            throw error
          }

          if (nsInfo) nsInfo.starter = starterDir

          const customDir = `${starterDir}/${config.dirs.custom}`
          const customCodeRepository: CustomCodeRepository = {
            addedCode: {},
            replacedCode: {},
            removedCode: {},
          }

          try {
            await fs.ensureDir(metaDir, dirOptions)
            await fs.ensureDir(customDir, dirOptions)
            await setNsInfo(starterDir, nsInfo)
            await fs.outputJson(customCode, customCodeRepository)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)
          }
        },
    },
  ]

  const dependenciesInstallationTasks = [
    {
      title: 'Install General Packages...',
      task: async () => {
        if (!mainInstallation) return
        return new Listr(installMainPackagesTaskList(mainInstallation, starterDir))
      },
    },
    {
      title: 'Install Dev Packages...',
      task: async () => {
        if (!devInstallation) return
        return new Listr(installDevPackagesTaskList(devInstallation, starterDir))
      },
    },
  ]

  const installDependencies = new Listr(dependenciesInstallationTasks)
  const setup = new Listr(starterCreationTaskList)
  try {
    await setup.run()
    await installDependencies.run()
    const nsFilePath = `${codeDir}/${dirNames.META}/${fileNames.NS_FILE}`
    if (!await fs.pathExists(nsFilePath)) {
      // if the settings file doesn't exist yet then it's brand newTemplate...
      const newAppTasks = await createNewCode(codeDir, starterDir)// , finalTemplateDir)
      await newAppTasks.run()
    }
  } catch (error) {
    throw new Error(`cannot create sample app at ${codeDir}: ${error}`)
  }
}
