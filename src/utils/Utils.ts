/*
Combines multiple classes.
First call's params are always used.
Subsequent calls' params are only used if the first param evals to true.

Ex:
classCombo('a')(true,'b','c')(false, 'd')()
gives: 'a b c'
*/
export function classCombo(...initialParams: any): any {
  let classes: string[] = [];
  function addParams(params) {
    params.forEach(param => {param && classes.push(param)})
  }
  addParams(initialParams);
  const combine = function(...params: any): any {
    if (params.length === 0) {
      // not called with an arg, join and return the classname
      return classes.join(' ');
    }
    if(typeof params[0] === 'boolean' || !params[0]) {
      if(params[0]) {
        // add all others if the first evals to true
        addParams(params.splice(1));
      }
    } else {
      addParams(params);
    }
    return combine;
  };
  return combine;
}

export function dangerousHtml(html) {
  return {
    __html: html,
  };
}

export function randInt(min=0, max=2147483647) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randString(len=10) {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr: string[] = [];
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    arr.push(charSet.substring(randomPoz,randomPoz+1));
  }
  return arr.join('');
}

/**
 * Returns true if two sets contain the same elements && have the same size
 * @param s1
 * @param s2
 */
export function setsEqual(s1,s2) {
  function isIn(s1) {
    return function (a) {
      return s1.has(a);
    }
  }

  function all(pred) {
    for (const a of s1) if (!pred(a)) return false;
    return true;
  }

  return s1.size === s2.size && all(isIn(s2));
}

export function isNil(v) {
  return v === null || v === undefined;
}

/**
 * Sort an array of objects based on some property.
 * https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
 * E.g.
 * People = [
 *  {name:'a'}, {name:'b'}
 * ]
 * People.sort(objectsSorter('name'))
 * @param property name of a property. prepend '-' if we want to reverse the sort order. Undefined values are treated
 * as 0
 * @returns {Function}
 */
export function objectsSorter(property) {
  let sortOrder = 1;
  if(property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b): number {
    let aVal = a[property] === undefined ? 0 : a[property];
    let bVal = b[property] === undefined ? 0 : b[property];
    const result = (aVal < bVal) ? -1 : (aVal > bVal) ? 1 : 0;
    return result * sortOrder;
  }
}