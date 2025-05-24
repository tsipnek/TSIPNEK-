import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  const key = 'visits'
  let count = await redis.get(key)

  if (!count) {
    count = 1
    await redis.set(key, count)
  } else {
    count = parseInt(count) + 1
    await redis.set(key, count)
  }

  res.status(200).json({ visits: count })
}
