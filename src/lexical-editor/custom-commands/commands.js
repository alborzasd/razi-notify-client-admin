import {
  $getSelection,
  $isRangeSelection,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";

import { CONTROLLED_TEXT_INSERTION_COMMAND } from "lexical";
import { COMMAND_PRIORITY_CRITICAL } from "lexical";

import { $patchStyleText } from "@lexical/selection";

import { mergeRegister } from "@lexical/utils";

import { $getCustomParagraphNodesFromSelection } from "../utilities/utilities";

import { $isCustomParagraphNode } from "../custom-ndoes/CustomParagraphNode";

// set text direction on block element nodes that is wrapped by range selection
export const SET_DIRECTION_COMMAND = createCommand("SET_DIRECTION_COMMAND");
// set inline style for all text nodes that is wrapped by range selection
export const APPLY_STYLE_TEXT_COMMAND = createCommand(
  "APPLY_STYLE_TEXT_COMMAND"
);

export function registerCustomCommands(editor) {
  const removeListener = mergeRegister(
    editor.registerCommand(
      SET_DIRECTION_COMMAND,
      (directionValue) => {
        const selection = $getSelection();
        const customParagraphNodes =
          $getCustomParagraphNodesFromSelection(selection);
        for (const node of customParagraphNodes) {
          node.setInlineStyleDirection(directionValue);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),

    editor.registerCommand(
      APPLY_STYLE_TEXT_COMMAND,
      // stylesObj
      // {color: '#00000000', ...}
      // {'background-color': '#00000000', ...}
      (stylesObj) => {
        const selection = $getSelection();
        // console.log('selection', selection);
        // console.log('style', stylesObj);
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, stylesObj);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    )

    // for debug purposes
    // editor.registerCommand(
    //   CONTROLLED_TEXT_INSERTION_COMMAND,
    //   (payload) => {
    //     console.log('CONTROLLED_TEXT_INSERTION_COMMAND', payload);
    //     return false;
    //   },
    //   COMMAND_PRIORITY_CRITICAL,
    // ),
  );

  return removeListener;
}
