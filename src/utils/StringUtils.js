import {isNil} from './Utils';

export class StringUtils {
  static capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * @param str
   * @returns {boolean} true if str is not nil and length is > 0
   */
  static isSet(str) {
    return !isNil(str) && str.length > 0;
  }

  // https://stackoverflow.com/questions/29855098/is-there-a-built-in-javascript-function-similar-to-os-path-join
  static joinPaths = (...args) => {
    return args.map((part, i) => {
      if (i === 0){
        return part.trim().replace(/[/]*$/g, '')
      } else {
        return part.trim().replace(/(^[/]*|[/]*$)/g, '')
      }
    }).filter(x=>x.length).join('/')
  };

  static numberSuffix = (number) => {
    switch (number) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  /**
   * https://stackoverflow.com/a/10073788
   */
  static pad = (n, width, z='0') => {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
}
