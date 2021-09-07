import {mssqlProviderNode} from '../mssqlProviderNode'
import {MSSQLProvider} from '../ports/MSSQLProvider'

const util = require('util')
const exec = util.promisify(require('child_process').exec)

async function execWithLogs(input: string) {
  const result = await exec(input)
  console.log(result.stdout)
  return result
}

async function stopMSSQLDockerContainer(containerName: string) {
  await exec(`docker rm -f '${containerName}'`)
}

type MSSQLDockerContainerConfig = {
  containerName: string
  saPassword: string
  port: number
  seedSQLFile: string
  sharedPath: string
}

async function runMSSQLDockerContainer({
  containerName,
  saPassword,
  port,
  seedSQLFile,
  sharedPath,
}: MSSQLDockerContainerConfig) {
  await stopMSSQLDockerContainer(containerName)
  await execWithLogs(
    `
      docker run -d --rm \\
        --name '${containerName}' \\
        -v ${sharedPath}:/shared \\
        -e 'ACCEPT_EULA=Y' \\
        -e 'SA_PASSWORD=${saPassword}' \\
        -p ${port}:1433 \\
        microsoft/mssql-server-linux:latest
      `,
  )
  await execWithLogs(
    `
      sleep 25 && docker exec '${containerName}' /opt/mssql-tools/bin/sqlcmd \\
        -l 120 \\
        -S 127.0.0.1 \\
        -U sa -P '${saPassword}' \\
        -i ./shared/${seedSQLFile}
      `,
  )
}

export async function mssqlProviderConnectedToTestEnvironment(
  config: Pick<MSSQLDockerContainerConfig, 'sharedPath' | 'seedSQLFile'>,
): Promise<MSSQLProvider> {
  const password = 'yourStrong(!)Password'
  const port = 1444

  await runMSSQLDockerContainer({
    containerName: 'mssql-testing',
    saPassword: password,
    port: port,
    ...config,
  })

  const sql = mssqlProviderNode({
    user: 'sa',
    password: password,
    server: process.env.DOCKER_ADDRESS ?? 'localhost',
    port: port,
  })

  await sql.connect()

  return sql
}
