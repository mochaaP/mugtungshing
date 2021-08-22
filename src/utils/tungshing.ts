import { Tungshing } from '@mugtungshing/core'
import { User } from 'typegram'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Lunar, pangu } from '.'

dayjs.extend(utc)
dayjs.extend(timezone)

export function getTungshing (user: User, tz = 'Asia/Shanghai'): string {
  const date = new Date()
  const lunar = new Lunar(date, tz).toString()

  const result = new Tungshing(`${user.id}`, date)
  return `
📅 今天是${pangu.spacing(date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: tz }))}
${getSeasonEmoji(tz, date)} 农历${lunar}


<strong>黄历姬掐指一算，<a href="tg://user?id=${user.id}]">${getNickname(user)}</a> 今天：</strong>
· <strong>宜</strong> ${result.activity[0].action}：${result.activity[0].reason}
· <strong>忌</strong> ${result.activity[1].action}：${result.activity[1].reason}

<strong>黄历姬为 ${getNickname(user)} 推荐：</strong>
· 今日音游：${result.daily}
· 打移动端音游最佳朝向：${result.direction}
· 街机音游黄金位：${result.slot}
  `
}

function getSeasonEmoji (tz: string, date: Date = new Date()): string {
  const spring = '🌸'
  const summer = '🏝️'
  const autumn = '🍁'
  const winter = '⛄'
  switch (Math.floor(dayjs(date).tz(tz).get('month') / 4)) {
    case 0: return spring
    case 1: return summer
    case 2: return autumn
    case 3: return winter
    default: return spring
  }
}

export function getNickname (from: User): string {
  var name = from.first_name
  if (from.last_name != null) {
    name += ` ${from.last_name}`
  }

  return name
}
