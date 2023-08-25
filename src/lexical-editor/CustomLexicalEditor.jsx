import styles from "./CustomLexicalEditor.module.scss";

import {
  $getRoot,
  $createParagraphNode,
  $createLineBreakNode,
  $createTabNode,
  $createTextNode,
  ParagraphNode,
} from "lexical";

import { LinkNode } from "@lexical/link";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

import ToolbarPlugin from "./custom-plugins/ToolbarPlugin";
import TriggerUpdatePlugin from "./custom-plugins/TriggerUpdatePlugin";
import { CustomParagraphNode } from "./custom-ndoes/CustomParagraphNode";
import CustomTheme from "./custom-theme/CustomEditorTheme";

import { availableNameSpaces } from "./constants/constants";

import generateClassNames from "classnames";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function CustomLexicalEditor({
  namespace = availableNameSpaces.default,
  onChange,
  // default value may be EditorState json object
  // json string or raw text string
  defaultValue,
  classNames,
  isEditable,
}) {
  const initialConfig = {
    namespace,
    theme: CustomTheme,
    onError,
    editable: isEditable,
    editorState: (editor) => populateEditorState(editor, defaultValue),
    nodes: [
      LinkNode,
      CustomParagraphNode,
      {
        replace: ParagraphNode,
        with: (node) => new CustomParagraphNode(),
      },
    ],
  };

  return (
    <div className={styles.CustomLexicalEditor + " " + classNames?.container}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin
          classNames={{ container: classNames?.toolbar }}
          isEditable={isEditable}
          namespace={namespace}
        />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={generateClassNames(
                styles.contentEditable,
                classNames?.contentEditable,
                {
                  [styles.active]: isEditable,
                }
              )}
            />
          }
          // toolbar plugin will render placeholder
          // placeholder={}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
          onChange={onChange || (() => null)}
          ignoreSelectionChange={true}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <TriggerUpdatePlugin />
      </LexicalComposer>
    </div>
  );
}

function populateEditorState(editor, defaultValue) {
  if (!editor || !defaultValue) return;
  // try to parse it as json string (the output from this editor itself)
  // if throws error
  // parse it as a raw string (my be raw text is added to db manually)
  try {
    const editorState = editor.parseEditorState(defaultValue);
    editor.setEditorState(editorState);
  } catch (err) {
    // console.log("Parse editor state error => ", err);
    if (typeof defaultValue === "string") {      
      initializeEditorStateWithRawText(defaultValue);
    }
  }
}

function initializeEditorStateWithRawText(rawText) {
  const root = $getRoot();
  if (root.getFirstChild() !== null) return;

  const paragraphNode = $createParagraphNode();

  const parts = rawText.split(/(\r?\n|\t)/);
  const length = parts.length;
  for (let i = 0; i < length; i++) {
    const part = parts[i];
    if (part === "\n" || part === "\r\n") {
      paragraphNode.append($createLineBreakNode());
    } else if (part === "\t") {
      paragraphNode.append($createTabNode());
    } else {
      paragraphNode.append($createTextNode(part));
    }
  }

  root.append(paragraphNode);
}

export default CustomLexicalEditor;
