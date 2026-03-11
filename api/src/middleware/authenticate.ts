import {type Request, type Response, type NextFunction} from 'express'

import {getPrisma} from '../lib/prisma'

export const authenticateRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.header('Auth')

  const prisma = getPrisma()

  const apiKey = await prisma.aPIKey.findFirst({where: {key}})

  if (apiKey) {
    res.locals.platform = apiKey.platform

    next()

    return
  }

  res.status(403)
  res.json({result: 'error', message: 'Invalid API Key'})
  return
}
