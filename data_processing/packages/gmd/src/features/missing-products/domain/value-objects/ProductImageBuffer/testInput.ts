import fs from 'fs'
import path from 'path'

export const imageBuffer768_1536 = Buffer.from(
  fs.readFileSync(path.resolve(__dirname, './testImages/768_1536.jpg')),
)
export const imageBuffer1440_900 = Buffer.from(
  fs.readFileSync(path.resolve(__dirname, './testImages/1440_900.jpg')),
)
export const imageBufferLargerThan1Mb4000_2250 = Buffer.from(
  fs.readFileSync(path.resolve(__dirname, './testImages/4000_2250.jpg')),
)
export const imageBuffer17Mb = Buffer.from(
  fs.readFileSync(path.resolve(__dirname, './testImages/4098_4177_17mb.jpg')),
)
export const imageBuffer39Mb = Buffer.from(
  fs.readFileSync(path.resolve(__dirname, './testImages/5494_5839_39mb.jpg')),
)
export const imageBuffer21x25 = Buffer.from(
  fs.readFileSync(path.resolve(__dirname, './testImages/21_25.png')),
)
