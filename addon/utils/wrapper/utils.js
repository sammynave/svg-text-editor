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
export function measure(item, parentEl) {
  if (item.trim() === '') {
    return { width: 0, height: 0 };
  }

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
  tspan.textContent = item;
  containerEl.appendChild(tempText);

  let { width, height } = tempText.getBBox();

  containerEl.removeChild(tempText); // element.remove() doesn't work in IE11
  return { width, height };
}

export function breakUp(line, maxWidth, parentEl) {
  let charWidth = measure(CHAR, parentEl).width;
  line = line.replace(/^ +| +$/gm, '');
  let targetSplitIndexFromEnd = Math.round((line.length * charWidth) - maxWidth);
  let targetSplitIndex = line.length - targetSplitIndexFromEnd;

  while(targetSplitIndex > 0) {
    if (line[targetSplitIndex] === ' ') {
      break;
    } else {
      targetSplitIndex--;
    }
  }

  return [line.slice(0, targetSplitIndex), line.slice(targetSplitIndex)];
}

export function formatText(text, maxWidth, parentEl) {
  let lines = text.split('\n');
  return lines.reduce((acc, line) => {
    let fits = (measure(line, parentEl).width <= maxWidth);
    if (fits) {
      acc.push(line);
    } else {
      let brokenLines = breakUp(line, maxWidth, parentEl);
      acc = acc.concat(brokenLines);
    }
    return acc;
  }, []);
}
