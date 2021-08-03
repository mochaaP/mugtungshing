import { Tungshing } from '@mugtungshing/core'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import MarkdownIt from 'markdown-it'
import PanguPlugin from './pangu'
import solarToLunar from './lunar'

dayjs.extend(utc)
dayjs.extend(timezone)

const md = new MarkdownIt().use(PanguPlugin)

export default function getTungshing (seed: string, nickname: string, tz = 'Asia/Shanghai'): string {
  const date = new Date()
  const lunar = solarToLunar(date, tz)
  console.log(lunar)

  const result = new Tungshing(seed, date)
  return md.renderInline(`
📅 今天是${date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: tz })}
${getSeasonEmoji(tz, date)} 农历${lunar.year}年${lunar.month}月${lunar.date}


**黄历姬掐指一算，${nickname} 今天：**
🌟 宜${result.activity[0].action}：${result.activity[0].reason}
💥 忌${result.activity[1].action}：${result.activity[1].reason}

**黄历姬为 ${nickname} 推荐：**
🎹 今日音游：${result.daily}
📱 打移动端音游最佳朝向：${result.direction}
👾 街机音游黄金位：${result.slot}
  `)
}

function getSeasonEmoji (tz: string, date: Date = new Date()): string {
  const spring = '🌸'
  const summer = '🏝️'
  const autumn = '🍁'
  const winter = '☃️'
  switch (Math.floor(dayjs(date).tz(tz).get('month') / 4)) {
    case 0: return spring
    case 1: return summer
    case 2: return autumn
    case 3: return winter
    default: return spring
  }
}
