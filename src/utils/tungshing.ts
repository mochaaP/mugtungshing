import { Identifier, Tungshing } from '@mugtungshing/core'
import { User } from 'typegram'
import { Lunar, pangu, htmlEscape } from '.'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function getTungshingByUser (user: User, tz = 'Asia/Shanghai', date = new Date()): Promise<string> {
  const lunar = new Lunar(date, tz).toString()

  const result = new Tungshing(new Identifier(`${user.id}$${BOT_TOKEN}`), date)
  return `
📅 ${isToday(date, tz) ? '今' : '那'}天是 ${pangu.spacing(date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: tz }))}
${getSeasonEmoji(date, tz)} 农历${lunar}


<strong>黄历姬掐指一算，<a href="tg://user?id=${user.id}">${getNickname(user)}</a> ${isToday(date, tz) ? '今' : '那'}天：</strong>
· <strong>宜</strong> ${result.activity[0].action}：${result.activity[0].reason}
· <strong>忌</strong> ${result.activity[1].action}：${result.activity[1].reason}

<strong>黄历姬为 <a href="tg://user?id=${user.id}">${getNickname(user)}</a> 推荐：</strong>
· 今日音游：${result.daily}
· 打移动端音游最佳朝向：${result.direction}
· 街机音游黄金位：${result.slot}

<strong>黄历码</strong> <pre>${result.identifier.toString('bagua') as string /* makes eslint happy */}</pre>
`
}

export async function getTungshingByIdentifier (identifier: Identifier, tz = 'Asia/Shanghai', date = new Date()): Promise<string> {
  const lunar = new Lunar(date, tz).toString()

  const result = new Tungshing(identifier, date)
  return `
📅 ${isToday(date, tz) ? '今' : '那'}天是 ${pangu.spacing(date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: tz }))}
${getSeasonEmoji(date, tz)} 农历${lunar}


<strong>黄历姬经过严密的计算，${isToday(date, tz) ? '今' : '那'}天：</strong>
· <strong>宜</strong> ${result.activity[0].action}：${result.activity[0].reason}
· <strong>忌</strong> ${result.activity[1].action}：${result.activity[1].reason}

<strong>黄历姬严选推荐：</strong>
· 今日音游：${result.daily}
· 打移动端音游最佳朝向：${result.direction}
· 街机音游黄金位：${result.slot}

<strong>黄历码</strong> <pre>${result.identifier.toString('bagua') as string /* makes eslint happy */}</pre>
`
}

function getSeasonEmoji (date = new Date(), tz = 'Asia/Shanghai'): string {
  const spring = '🌸'
  const summer = '🏝️'
  const autumn = '🍁'
  const winter = '⛄'
  switch (Math.floor((parseInt(date.toLocaleDateString('en-US').split('/')[0]) - 3) / 3)) {
    case 0: return spring
    case 1: return summer
    case 2: return autumn
    case 3: return winter
    default: return winter
  }
}

export function isToday (date: Date, tz: string): boolean {
  return dayjs.tz(date, tz).diff(new Date(), 'day') === 0
}

export function getNickname (from: User): string {
  var name = from.first_name
  if (from.last_name != null) {
    name += ` ${from.last_name}`
  }

  return htmlEscape(name)
}
