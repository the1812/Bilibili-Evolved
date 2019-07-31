export class Validator {
  constructor(key) {
    this.key = key
  }
  get originalValue () {
    return settings[this.key]
  }
  static getValidator (key) {
    switch (key) {
      case 'customStyleColor':
        return new ColorValidator(key)
      case 'blurBackgroundOpacity':
      case 'customControlBackgroundOpacity':
      case 'customNavbarBlurOpacity':
        return new OpacityValidator(key)
      case 'defaultPlayerMode':
      case 'defaultVideoQuality':
      case 'i18nLanguage':
      case 'deadVideoTitleProvider':
        return new DropDownValidator(key)
      case 'darkScheduleStart':
      case 'darkScheduleEnd':
        return new TimeValidator(key)
      case 'playerFocusOffset':
        return new NumberValidator(key)
      case 'sideBarOffset':
        return new RangedNumberValidator(key, -40, 40)
      default:
        return new Validator(key)
    }
  }
  isValidate (text) {
    return text
  }
  validate (text) {
    const result = this.isValidate(text)
    if (result === undefined) {
      return this.originalValue
    }
    return result
  }
}
export class ColorValidator extends Validator {
  isValidate (text) {
    if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(text)) {
      if (text.length < 7) {
        return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`
      } else {
        return text
      }
    }
  }
}
export class OpacityValidator extends Validator {
  isValidate (text) {
    if (/^([-+]?\d+)(\.\d+)?$/.test(text)) {
      const value = parseFloat(text)
      if (value >= 0 && value <= 1) {
        return text
      }
    }
  }
}
export class DropDownValidator extends Validator {
  isValidate (text) {
    const [dropdownInfo] = Object.values(Resource.manifest)
      .filter(it => it.dropdown && it.dropdown.key === this.key)
      .map(it => it.dropdown)
    if (dropdownInfo.items.indexOf(text) !== -1) {
      return text
    }
  }
}
export class TimeValidator extends Validator {
  isValidate (text) {
    const match = text.match(/^([\d]{1,2}):([\d]{1,2})$/)
    if (match && match.length >= 3) {
      const time = { hour: parseInt(match[1]), minute: parseInt(match[2]) };
      (function () {
        while (this.minute < 0) {
          this.minute += 60
          this.hour -= 1
        }
        while (this.minute >= 60) {
          this.minute -= 60
          this.hour += 1
        }
        while (this.hour < 0) {
          this.hour += 24
        }
        while (this.hour >= 24) {
          this.hour -= 24
        }
      }).call(time)
      return `${time.hour}:${(time.minute < 10 ? '0' + time.minute : time.minute)}`
    }
  }
}
export class NumberValidator extends Validator {
  isValidate (text) {
    const number = parseInt(text)
    if (!isNaN(number)) {
      return number
    }
  }
}
export class RangedNumberValidator extends Validator {
  constructor(key, min, max) {
    super(key)
    this.min = min
    this.max = max
  }
  isValidate (text) {
    const number = parseInt(text)
    if (!isNaN(number) && number >= this.min && number <= this.max) {
      return number
    }
  }
}
export default {
  export: {
    Validator,
    ColorValidator,
    DropDownValidator,
    OpacityValidator,
    TimeValidator,
    NumberValidator
  }
}
