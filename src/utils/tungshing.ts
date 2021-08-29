import { Tungshing } from '@mugtungshing/core'
import { User } from 'typegram'
import { Lunar, pangu, hash } from '.'

export async function getTungshing (user: User, tz = 'Asia/Shanghai', date = new Date()): Promise<string> {
  const lunar = new Lunar(date, tz).toString()

  const result = new Tungshing(await hash(`${user.id}$${BOT_TOKEN}`), date)
  return `
📅 今天是 ${pangu.spacing(date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: tz }))}
${getSeasonEmoji(date, tz)} 农历${lunar}


<strong>黄历姬掐指一算，<a href="tg://user?id=${user.id}">${getNickname(user)}</a> 今天：</strong>
· <strong>宜</strong> ${result.activity[0].action}：${result.activity[0].reason}
· <strong>忌</strong> ${result.activity[1].action}：${result.activity[1].reason}

<strong>黄历姬为 ${getNickname(user)} 推荐：</strong>
· 今日音游：${result.daily}
· 打移动端音游最佳朝向：${result.direction}
· 街机音游黄金位：${result.slot}
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

export function getNickname (from: User): string {
  var name = from.first_name
  if (from.last_name != null) {
    name += ` ${from.last_name}`
  }

  return name
}
