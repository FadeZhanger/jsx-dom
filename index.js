function isElement(val) {
  return val && typeof val.nodeType === "number";
}

function isObject(val) {
  return typeof val === "object" ? val !== null : typeof val === "function";
}

function isArrayLike(obj) {
  return (
    isObject(obj) &&
    typeof obj.length === "number" &&
    typeof obj.nodeType !== "number"
  );
}

function isRef(maybeRef) {
  return isObject(maybeRef) && "current" in maybeRef;
} // https://facebook.github.io/react/docs/jsx-in-depth.html#booleans-null-and-undefined-are-ignored
// Emulate JSX Expression logic to ignore certain type of children or className.

function isVisibleChild(value) {
  return typeof value !== "boolean" && value !== null;
}
/**
 * Convert a `value` to a className string.
 * `value` can be a string, an array or a `Dictionary<boolean>`.
 */

function className(value) {
  if (Array.isArray(value)) {
    return value
      .map(className)
      .filter(Boolean)
      .join(" ");
  } else if (isObject(value)) {
    return Object.keys(value)
      .filter(k => value[k])
      .join(" ");
  } else if (isVisibleChild(value)) {
    return "" + value;
  } else {
    return "";
  }
}

function Fragment(attr) {
  const fragment = document.createDocumentFragment();
  appendChildren(attr.children, fragment);
  return fragment;
}

function createElement(tag, attr, ...children) {
  attr = attr || {};
  let node = document.createElement(tag);

  if (typeof tag === "string") {
    attributes(attr, node);
    appendChildren(children, node);
  } else if (typeof tag === "function") {
    // Custom elements
    if (isObject(tag.defaultProps)) {
      attr = Object.assign({}, tag.defaultProps, attr);
    }

    node = tag(
      Object.assign({}, attr, {
        children
      })
    );
  }

  if (isRef(attr.ref)) {
    attr.ref.current = node;
  } else if (typeof attr.ref === "function") {
    attr.ref(node);
  }

  return node;
}

function appendChild(child, node) {
  if (isArrayLike(child)) {
    appendChildren(child, node);
  } else if (typeof child === "string" || typeof child === "number") {
    node.appendChild(document.createTextNode(`${child}`));
  } else if (child === null) {
    node.appendChild(document.createComment(""));
  } else if (isElement(child)) {
    node.appendChild(child);
  }
}

function appendChildren(children, node) {
  for (const child of children) {
    appendChild(child, node);
  }

  return node;
}

function attribute(key, value, node) {
  switch (key) {
    case "htmlFor": {
      node.setAttribute("for", value);
      return;
    }

    case "innerHTML":
    case "innerText":
    case "textContent": {
      node[key] = value;
      return;
    }

    case "spellCheck": {
      node.spellcheck = value;
      return;
    }

    case "class":
    case "className": {
      node.setAttribute("class", className(value));
      return;
    }

    case "ref":
    case "namespaceURI":
      return;

    case "style": {
      if (isObject(value)) {
        Object.assign(node.style, value);
      }

      return;
    }

    default:
      break;
  }

  if (typeof value === "function") {
    if (key[0] === "o" && key[1] === "n") {
      const name = key.slice(2).toLowerCase();
      listen(node, name, value);
    }
  } else if (value === true) {
    node.setAttribute(key, "true");
  } else if (value !== false && value !== null) {
    node.setAttribute(key, value);
  }
}

function attributes(attr, node) {
  for (const key of Object.keys(attr)) {
    attribute(key, attr[key], node);
  }

  return node;
}

function listen(node, eventName, callback) {
  node.addEventListener(eventName, callback);
  return node;
}

export { Fragment, createElement, createElement as h };
