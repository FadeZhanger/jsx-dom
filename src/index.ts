import {isObject, isArrayLike, isRef, isElement} from './util';

// https://facebook.github.io/react/docs/jsx-in-depth.html#booleans-null-and-undefined-are-ignored
// Emulate JSX Expression logic to ignore certain type of children or className.
function isVisibleChild(value: any) {
  return typeof value !== 'boolean' && value !== null;
}

/**
 * Convert a `value` to a className string.
 * `value` can be a string, an array or a `Dictionary<boolean>`.
 */
function className(value: any): string {
  if (Array.isArray(value)) {
    return value.map(className).filter(Boolean).join(' ');
  } else if (isObject(value)) {
    return Object.keys(value).filter((k) => value[k]).join(' ');
  } else if (isVisibleChild(value)) {
    return '' + value;
  } else {
    return '';
  }
}

export function Fragment(attr: {children: any}) {
  const fragment = document.createDocumentFragment();
  appendChildren(attr.children, fragment);
  return fragment;
}

export {createElement as h};
export function createElement(tag: any, attr: any, ...children: any[]) {
  attr = attr || {};
  let node: HTMLElement = document.createElement(tag);
  if (typeof tag === 'string') {
    attributes(attr, node);
    appendChildren(children, node);
  } else if (typeof tag === 'function') {
    // Custom elements
    if (isObject(tag.defaultProps)) {
      attr = {...tag.defaultProps, ...attr};
    }
    node = tag({...attr, children});
  }

  if (isRef(attr.ref)) {
    attr.ref.current = node;
  } else if (typeof attr.ref === 'function') {
    attr.ref(node);
  }
  return node;
}

function appendChild(child: any, node: Node) {
  if (isArrayLike(child)) {
    appendChildren(child as any, node);
  } else if (typeof child === 'string' || typeof child === 'number') {
    node.appendChild(document.createTextNode(child as any));
  } else if (child === null) {
    node.appendChild(document.createComment(''));
  } else if (isElement(child)) {
    node.appendChild(child);
  }
}

function appendChildren<T>(children: T[], node: Node) {
  for (const child of children) {
    appendChild(child, node);
  }
  return node;
}

function attribute(key: string, value: any, node: HTMLElement) {
  switch (key) {
    case 'htmlFor': {
      node.setAttribute('for', value);
      return;
    }
    case 'innerHTML':
    case 'innerText':
    case 'textContent': {
      node[key] = value;
      return;
    }
    case 'spellCheck': {
      (node as HTMLInputElement).spellcheck = value;
      return;
    }
    case 'class':
    case 'className': {
      node.setAttribute('class', className(value));
      return;
    }
    case 'ref':
    case 'namespaceURI': return;
    case 'style': {
      if (isObject(value)) {
        Object.assign(node.style, value);
      }
      return;
    }
    default: break;
  }

  if (typeof value === 'function') {
    if (key[0] === 'o' && key[1] === 'n') {
      const name = key.slice(2).toLowerCase();
      listen(node, name, value);
    }
  } else if (value === true) {
    node.setAttribute(key, 'true');
  } else if (value !== false && value !== null) {
    node.setAttribute(key, value);
  }
}

function attributes(attr: {[key: string]: any}, node: HTMLElement) {
  for (const key of Object.keys(attr)) {
    attribute(key, attr[key], node);
  }
  return node;
}

function listen(node: Node, eventName: string, callback: (...args: any[]) => any) {
  node.addEventListener(eventName, callback);
  return node;
}
