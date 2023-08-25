import { ParagraphNode } from "lexical";

// defining private static fields
// (if js was not a weird language we could do it inside class body)

const directionValues = ["rtl", "ltr"];
const directionEmptyValue = "";

const defaultDirection = directionEmptyValue;

const typeName = "custom-paragraph";

// this node is going to replace the parent ParagraphNode
// class hierarchy parent, not editor state parent
export class CustomParagraphNode extends ParagraphNode {
  // 'rtl', 'ltr'
  __inlineStyleDirection = defaultDirection;

  constructor(inlintStyleDirection, key) {
    super(key);
    if (
      directionValues.includes(inlintStyleDirection) ||
      directionEmptyValue === inlintStyleDirection
    ) {
      this.__inlineStyleDirection = inlintStyleDirection;
    }
  }

  // methods required to implement

  static getType() {
    return typeName;
  }

  static clone(node) {
    return new CustomParagraphNode(node.__inlineStyleDirection, node.__key);
  }

  // getter and setter

  getInlineStyleDirection() {
    const self = this.getLatest();
    return self.__inlineStyleDirection;
  }

  setInlineStyleDirection(dir) {
    if (directionValues.includes(dir) || directionEmptyValue === dir) {
      const self = this.getWritable();
      // if dir value is already set to current node
      // then it must be set to empty
      // by this approach
      // we can toggle direction and set or reset it
      if(self.__inlineStyleDirection === dir) {
        self.__inlineStyleDirection = directionEmptyValue;
      } else {
        self.__inlineStyleDirection = dir;
      }
    }
  }

  // view

  createDOM(config) {
    const domElement = super.createDOM(config);
    domElement.style.direction = this.__inlineStyleDirection;
    return domElement;
  }

  updateDOM(prevNode, domElement, config) {
    // this => reference to cloned and mutated custom paragraph node object
    const isUpdated = super.updateDOM(prevNode, domElement, config);
    if (prevNode.__inlineStyleDirection !== this.__inlineStyleDirection) {
      domElement.style.direction = this.__inlineStyleDirection;
    }
    // according to source code, we know super returns false
    // false means do not create new <p> element
    // just mutate the attributes of current <p> element
    return isUpdated;
  }

  // is called when copy pasting html from another editor to this editor
  // if we omit this method
  // a ParagraphNode is created from <p> tag (by super.importDom method)
  // then ParagraphNode is replaced by CustomPargraphNode (we defined replacement in config)
  // but the initial element.style.direction is ignored during the process
  // so we take control of importDom to access the initial dom element
  // and access to inline style and attributes
  static importDOM() {
    // console.log('importDOM');
    return {
      // the _htmlDomNode is useful
      // when we want to return specific conversion object
      // depending on the html node properties
      // (i.e. have specific attributes like style or not)
      p: (_htmlDomNode) => ({
        conversion: convertCustomParagraphElement,
        // this conversion function has more priority
        // than the ParagraphNode(parent class) conversion function
        // which is 0
        // it means any <p> tag must be converted
        // to custom paragraph node
        priority: 1,
      }),
    };
  }

  // is called when we copy content from this editor (add to clipboard)
  exportDOM(editor) {
    const { element } = super.exportDOM(editor);
    element.style.direction = this.getInlineStyleDirection();
    return { element };
  }

  static importJSON(serializedNode) {
    // console.log('import JSON');
    const node = $createCustomParagraphNode();

    // this part is directly taken from source code
    // https://github.com/facebook/lexical/blob/main/packages/lexical/src/nodes/LexicalParagraphNode.ts
    // line: 95-97
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);

    node.setInlineStyleDirection(serializedNode.inlineStyleDirection);

    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      inlineStyleDirection: this.getInlineStyleDirection(),
      type: typeName,
      version: 1,
    };
  }
}

export function $createCustomParagraphNode() {
  return new CustomParagraphNode();
}

export function $isCustomParagraphNode(node) {
  return node instanceof CustomParagraphNode;
}

function convertCustomParagraphElement(htmlDomNode) {
  // it's like calling super $createParagraphNode ??
  const node = $createCustomParagraphNode();
  // this part is directly taken from source code
  // because the function convertParagraphElement is not exported
  // https://github.com/facebook/lexical/blob/main/packages/lexical/src/nodes/LexicalParagraphNode.ts
  // line: 146-152
  if (htmlDomNode.style) {
    node.setFormat(htmlDomNode.style.textAlign);
    const indent = parseInt(htmlDomNode.style.textIndent, 10) / 20;
    if (indent > 0) {
      node.setIndent(indent);
    }
  }
  // now we add custom logic
  const inlineStyleDirection = htmlDomNode?.style?.direction;
  const inlineAttributeDirection = htmlDomNode?.dir;
  // set inline style direction if it already has
  if (directionValues.includes(inlineStyleDirection)) {
    node.setInlineStyleDirection(inlineStyleDirection);
  }
  // if not defined in styles, check dir attribute
  else if (directionValues.includes(inlineAttributeDirection)) {
    node.setInlineStyleDirection(inlineAttributeDirection);
  }
  // otherwise set to default
  // we can not get a valid value from direction field from parent ElementNode
  // because it always set to null at start
  // and it's value come from dom render process later (should be ooposite!)
  else {
    node.setInlineStyleDirection(defaultDirection);
  }

  return { node };
}
