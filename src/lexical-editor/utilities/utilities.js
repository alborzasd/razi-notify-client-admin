import { $isRangeSelection, $getRoot, $getNodeByKey } from "lexical";
import { $findMatchingParent } from "@lexical/utils";
import { $isLinkNode } from "@lexical/link";
import { $isCustomParagraphNode } from "../custom-ndoes/CustomParagraphNode";

function removeDuplicate(arr) {
  return Array.from(new Set(arr));
}

// export function $getBlockElementNodesFromSelection(selection) {
//   if (!$isRangeSelection(selection)) {
//     return false;
//   }
//   const blockElementNodes = [];
//   const nodes = selection.getNodes();
//   for (const node of nodes) {
//     // for example: a link node is element node (can have child)
//     // but it is inline
//     const element = $findMatchingParent(
//       node,
//       (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
//     );
//     if (element !== null) {
//       blockElementNodes.push(element);
//     }
//   }
//   return removeDuplicate(blockElementNodes);
// }

export function $getCustomParagraphNodesFromSelection(selection) {
  if (!$isRangeSelection(selection)) {
    return [];
  }
  const customParagraphNodes = [];
  const nodes = selection.getNodes();
  for (const node of nodes) {
    const element = $findMatchingParent(node, (parentNode) =>
      $isCustomParagraphNode(parentNode)
    );
    if (element !== null) {
      customParagraphNodes.push(element);
    }
  }
  return removeDuplicate(customParagraphNodes);
}

export function $getAlignmentValue(customParagraphNodes) {
  // if all custom paragraph nodes of the selection
  // have the same alignment value ("right" or "left" or ... or "")
  // this function returns that value
  // otherwise returns ""
  if (
    !Array.isArray(customParagraphNodes) ||
    customParagraphNodes.length === 0
  ) {
    return "";
  }
  const [firstElem, ...restElem] = customParagraphNodes;
  let result = firstElem?.getFormatType();
  for (const node of restElem) {
    if (node?.getFormatType() !== result) {
      return "";
    }
  }
  return result;
}

export function $getDirectionValue(customParagraphNodes) {
  // if all custom paragraph nodes of the selection
  // have the same direction value ("rtl", "ltr", "")
  // this function returns that value
  // otherwise returns ""
  if (
    !Array.isArray(customParagraphNodes) ||
    customParagraphNodes.length === 0
  ) {
    return "";
  }
  const [firstElem, ...restElem] = customParagraphNodes;
  let result = firstElem?.getInlineStyleDirection();
  for (const node of restElem) {
    if (node?.getInlineStyleDirection() !== result) {
      return "";
    }
  }
  return result;
}

export function $getLinkNodesFromSelection(selection, editor) {
  if (!$isRangeSelection(selection)) {
    return [];
  }

  const linkNodes = [];
  const selectedNodes = selection.getNodes();

  for (const selectedNode of selectedNodes) {
    const mayBeLinkNode = selectedNode.getParent();
    if ($isLinkNode(mayBeLinkNode)) {
      linkNodes.push(mayBeLinkNode);
      // linkNodes.push({
      //   key: mayBeLinkNode?.getKey(),
      //   node: mayBeLinkNode,
      //   domElement: editor?.getElementByKey(mayBeLinkNode?.getKey()),
      //   textContent: mayBeLinkNode?.getTextContent(),
      //   url: mayBeLinkNode?.getURL(),
      // });
    }
  }

  const linkNodesNoDuplicate = removeDuplicate(linkNodes);

  const linkNodesInfo = linkNodesNoDuplicate.map((linkNode) => ({
    key: linkNode?.getKey(),
    node: linkNode,
    domElement: editor?.getElementByKey(linkNode?.getKey()),
    textContent: linkNode?.getTextContent(),
    url: linkNode?.getURL(),
  }));

  return linkNodesInfo;
}

export function $editUrlForNodeKey(newUrl, nodeKey) {
  if (!newUrl || !nodeKey) return;

  const linkNode = $getNodeByKey(nodeKey);
  if ($isLinkNode(linkNode)) {
    linkNode?.setURL(newUrl);
  }
}

export function $convertLinkNodeToTextNode(nodeKey) {
  if (!nodeKey) return;

  const linkNode = $getNodeByKey(nodeKey);
  if (!$isLinkNode(linkNode)) return;

  // https://github.com/facebook/lexical/blob/main/packages/lexical-link/src/index.ts
  // toggleLink function (second if block)
  const children = linkNode?.getChildren();
  for (let i = 0; i < children.length; i++) {
    linkNode?.insertBefore(children[i]);
  }
  linkNode?.remove();
}

// called by submit handlers
export async function getEditorStateTextContent(editorState) {
  let textContent;
  await new Promise((res) => {
    editorState.read(() => {
      textContent = $getRoot().getTextContent();
      res();
    });
  });
  // by default lexical will add two endlines
  // at the end of each ElementNode when generate textContent
  // we replace it with a single endline
  textContent = textContent.replace(/\n\n/g, "\n");
  return textContent;
}
