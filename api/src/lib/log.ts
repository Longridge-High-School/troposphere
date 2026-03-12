import chalk from 'chalk'

import {getPrisma} from './prisma'

export const log = async (
  message: string,
  subject: string,
  subjectId?: string
) => {
  const prisma = getPrisma()

  await prisma.logEntry.create({data: {subject, subjectId, message}})

  console.log(
    `${chalk.green(`[${subject}]`)}${subjectId ? chalk.blue(`[${subjectId}]`) : ''} ${message}`
  )
}
