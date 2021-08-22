interface ILunar {
  year: number
  month: number
  day: number
}

const lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'] as const

const lunarDay = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
] as const

const tianGanDiZhi = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛己', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸丑',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
] as const

/**
 * 从 Date 构造农历对象
 * @public
 * @param date - 时间
 * @param tz - 时区
 */
export class Lunar implements ILunar {
  year: number
  month: number
  day: number

  constructor (date: Date, tz = 'Asia/Shanghai') {
    const parsed = date.toLocaleString('ja-JP-u-ca-chinese', { dateStyle: 'short', timeZone: tz }).split('-')

    this.year = parseInt(date.toLocaleString('zh-u-ca-chinese', { year: 'numeric', timeZone: tz }).slice(0, -3))
    this.month = parseInt(parsed[1]) - 1
    this.day = parseInt(parsed[2]) - 1
  }

  toText (): {
    year: typeof tianGanDiZhi[number]
    month: typeof lunarMonth[number]
    day: typeof lunarDay[number]
  } {
    return {
      year: tianGanDiZhi[this.year % 60 - 4],
      month: lunarMonth[this.month],
      day: lunarDay[this.day]
    }
  }

  toString (): string {
    const text = this.toText()
    return `${text.year}年${text.month}月${text.day}日`
  }
}
