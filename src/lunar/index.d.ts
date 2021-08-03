/**
 * 将日期转换为农历
 * @param date 日期
 * @param tz 时区
 * @return 农历对象
 */
export default function solarToLunar (date?: Date, tz?: string): {
  year: string
  month: string
  date: string
}
