export function isElement(val: any): val is Element {
  return val && typeof val.nodeType === 'number';
}

export function isObject(val: any) {
  return typeof val === 'object' ? val !== null : typeof val === 'function';
}

export function isArrayLike(obj: any): obj is ArrayLike<any> {
  return isObject(obj)
    && typeof obj.length === 'number'
    && typeof obj.nodeType !== 'number';
}

interface Ref<T extends Element> {
  current: null | T;
}
export function createRef<T extends Element = Element>(): Ref<T> {
  return Object.seal({current: null});
}
export function isRef<T extends Element>(maybeRef: any): maybeRef is Ref<T> {
  return isObject(maybeRef) && 'current' in maybeRef;
}
