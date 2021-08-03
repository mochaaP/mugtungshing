// exported from vendor
// see <https://github.com/backrunner/pangu.simple.js/blob/a774a3e/src/shared/core.js> for more info

const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff'

const SYMBOL_WIDE = '`~!@#$%*^&()/\\-+=<>?:"{}|,.;\'[\\]·~￥%——|\\\\'
const SYMBOL = '`~!@#$%^&()/\\-+=<>?:"{}|,.;\'[\\]·~￥%——|\\\\'
const SYMBOL_LEFT = '`~!@#$%^&(/\\-+=<>?:"{|,.;\'[·~￥%——|\\\\'
const SYMBOL_RIGHT = '`~!@#$%^&)/\\-+=<>?:"}|,.;\'\\]·~￥%——|\\\\'
const SYMBOL_SAFE = '`~!#$%^&/+=<>?:"|,;\'·~￥%——|\\\\'

const ANY_CJK = new RegExp(`[${CJK}]`)

const ALPHA_CJK = new RegExp(`([A-Za-z_])([${CJK}]+)`, 'g')
const CJK_ALPHA = new RegExp(`([${CJK}]+)([A-Za-z_])`, 'g')
const NUMBER_CJK = new RegExp(`([0-9_])([${CJK}]+)`, 'g')
const CJK_NUMBER = new RegExp(`([${CJK}]+)([0-9_])`, 'g')
const CJK_AND_ALPHA = new RegExp(`([${CJK}]+)(&)([A-Za-z_])`, 'g')
const ALPHA_AND_CJK = new RegExp(`([A-Za-z_])(&)([${CJK}]+)`, 'g')
const ALPHA_SYMBOL_CJK = new RegExp(`([A-Za-z_])([${SYMBOL_RIGHT}])([${CJK}])`, 'g')
const CJK_SYMBOL_ALPHA = new RegExp(`([${CJK}])([${SYMBOL_LEFT}])([A-Za-z_])`, 'g')
const NUMBER_SYMBOL_CJK = new RegExp(`([0-9_])([${SYMBOL}])([${CJK}])`, 'g')
const CJK_SYMBOL_NUMBER = new RegExp(`([${CJK}])([${SYMBOL}])([0-9_])`, 'g')
const CJK_BRACKET = new RegExp(`([${CJK}])([<\\[{\\(])`, 'g')
const BRACKET_CJK = new RegExp(`([>\\]\\)}])([${CJK}])`, 'g')
const ALPHA_NUMBER_CJK = new RegExp(`([A-Za-z_])([0-9_])([${CJK}])`, 'g')
const CJK_SYMBOL_SYMBOL = new RegExp(`([${CJK}])([${SYMBOL_WIDE}])([${SYMBOL_WIDE}])`, 'g')
const SYMBOL_SYMBOL_CJK = new RegExp(`([${SYMBOL_WIDE}])([${SYMBOL_WIDE}])([${CJK}])`, 'g')
const CJK_SYMBOL_CJK_SYMBOL_CJK = new RegExp(`([${CJK}])([${SYMBOL_SAFE}])([${CJK}])([${SYMBOL_SAFE}])([${CJK}])`, 'g')
const CJK_SYMBOL_CJK = new RegExp(`([${CJK}])([${SYMBOL_SAFE}])([${CJK}])`, 'g')
const CJK_ACCOUNT_CJK = new RegExp(`([${CJK}])(\\s*)(@[A-za-z0-9_]*)(\\s*)([${CJK}]+)(\\s*)([A-za-z0-9_]+)(\\s*)([${CJK}])`)

class Pangu {
  spacing (text: string): string {
    if (text.length <= 1 || !ANY_CJK.test(text)) {
      return text
    }

    let newText = text

    newText = newText.replace(ALPHA_NUMBER_CJK, '$1$2 $3')
    newText = newText.replace(ALPHA_CJK, '$1 $2')
    newText = newText.replace(CJK_ALPHA, '$1 $2')
    newText = newText.replace(NUMBER_CJK, '$1 $2')
    newText = newText.replace(CJK_NUMBER, '$1 $2')
    newText = newText.replace(CJK_AND_ALPHA, '$1 $2 $3')
    newText = newText.replace(ALPHA_AND_CJK, '$1 $2 $3')
    newText = newText.replace(ALPHA_SYMBOL_CJK, '$1$2 $3')
    newText = newText.replace(CJK_SYMBOL_ALPHA, '$1 $2$3')
    newText = newText.replace(NUMBER_SYMBOL_CJK, '$1$2 $3')
    newText = newText.replace(CJK_SYMBOL_NUMBER, '$1 $2$3')
    newText = newText.replace(CJK_SYMBOL_SYMBOL, '$1 $2$3')
    newText = newText.replace(SYMBOL_SYMBOL_CJK, '$1$2 $3')
    newText = newText.replace(BRACKET_CJK, '$1 $2')
    newText = newText.replace(CJK_BRACKET, '$1 $2')
    newText = newText.replace(CJK_SYMBOL_CJK_SYMBOL_CJK, '$1 $2 $3 $4 $5')
    newText = newText.replace(CJK_SYMBOL_CJK, '$1 $2 $3')
    newText = newText.replace(CJK_ACCOUNT_CJK, '$1 $3$5$7 $9')

    return newText
  }
}

export default new Pangu()
