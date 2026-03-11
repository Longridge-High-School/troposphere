import {getPrisma} from './lib/prisma'
import {v4 as uuid} from 'uuid'

const main = async () => {
  const prisma = getPrisma()

  const apiKey = await prisma.aPIKey.create({
    data: {platform: 'cli', key: uuid()}
  })

  console.log(apiKey.key)
}

main()
