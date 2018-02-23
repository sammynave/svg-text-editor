const SVG_NS = 'http://www.w3.org/2000/svg';
const CHAR = 'c';

export function tspanify(line) {
  return `<tspan x="0" dy="1.2em">${line}</tspan>`;
}

export function remove(array, element) {
  return array.filter(e => e !== element);
}

/*
 * To measure text in SVG, first we append the `containerElement` to the
 * `parentElement`. Then, we set the text content on `textElement` and measure
 * the bounding box. Finally, we remove the `containerElement` from the parent.
 *
 * The root element of the context may be any `SVGElement` including `<text>`
 * elements, so find the best `<text>` element for measuring. We prioritize
 * exact `<text>` elements, then the first existing `<text>` element descendent,
 * then finally we will just create a new `<text>` element.
 */

function baseMeasure(text, parentEl) {
  let containerEl = parentEl.parentElement;
  let attrNames = remove(remove(parentEl.getAttributeNames(), 'id'), 'class');

  let tempText = document.createElementNS(SVG_NS, 'text');
  attrNames.forEach((k) => {
    tempText.setAttribute(k, parentEl.getAttribute(k));
  });

  tempText.id = 'temp-text';

  let tspan = document.createElementNS(SVG_NS, 'tspan')
  tempText.appendChild(tspan);
  tspan.setAttribute('x', 0);
  tspan.setAttribute('dy', '1.2em');
  tspan.textContent = text;
  containerEl.appendChild(tempText);

  let { width, height } = tempText.getBBox();
  containerEl.removeChild(tempText); // element.remove() doesn't work in IE11
  return { width, height };
}

export function measure(text, parentEl) {
  if (text.trim() === '') {
    return { width: 0, height: 0 };
  }

  let lineMeasurements = text.trim().split('\n').map((line) => baseMeasure(line, parentEl));

  return {
    // calculate height of all lines
    height: lineMeasurements.reduce((acc, m) => acc + m.height, 0),
    // calculate maximum width
    width: lineMeasurements.reduce((acc, m) => Math.max(acc, m.width), 0)
  };
}

const IS_WHITESPACE = /\s/;
const IS_DIVIDER = /\W/;

function shouldCreateNewToken(token, char) {
  if (!token) {
    return [char];
  }
  const lastCharacter = token[token.length - 1];
  if (IS_WHITESPACE.test(lastCharacter) && IS_WHITESPACE.test(char)) {
    return [token + char];
  } else if (IS_WHITESPACE.test(lastCharacter) || IS_WHITESPACE.test(char)) {
    return [token, char];
  } else if (!(IS_DIVIDER.test(lastCharacter))) {
    return [token + char];
  } else if (lastCharacter === char) {
    return [token + char];
  } else {
    return [token, char];
  }
}

function tokenize(text) {
  return text.split('').reduce((tokens, char) => {
    return tokens.slice(0, -1).concat(shouldCreateNewToken(tokens[tokens.length - 1], char));
  }, ['']);
}

export function breakUp(line, parentEl, maxWidth) {
  const tokens = tokenize(line);
  // count chars in each token
  const tokensWithWidth = tokens.map((token, i) => {
    return { token, width: measure(token, parentEl).width, i };
  });

  const totalWidth = tokensWithWidth.reduce((totalWidth, token) => {
    return totalWidth + token.width;
  }, 0);

  if (totalWidth <= maxWidth) {
    return line;
  } else {
    let firstNonSpaceFound = false;
    let firstSpace = false;
    let len = tokensWithWidth.length;
    while(!firstSpace && len--) {
      if (firstNonSpaceFound === false) {
        (tokensWithWidth[len].width > 0) && (firstNonSpaceFound = true);
      } else {
        (tokensWithWidth[len].width === 0) && (firstSpace = tokensWithWidth[len]);
      }
    }
    if (firstSpace) {
      tokensWithWidth[firstSpace.i].token = '\n';
      let tokens = tokensWithWidth.map((t) => t.token);
      return tokens.join('').split('\n');
    } else {
      throw new Error('will need to break with dash');
    }
  }
}

export function formatText(lines, maxWidth, parentEl) {
  return lines.reduce((acc, line) => {
    let formatted = breakUp(line, parentEl, maxWidth);
    if (Array.isArray(formatted)) {
      return acc.concat(formatted);
    } else {
      acc.push(formatted);
      return acc
    }
  }, []);
}
