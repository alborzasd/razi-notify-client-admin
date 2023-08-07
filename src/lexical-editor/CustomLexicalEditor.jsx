import styles from "./CustomLexicalEditor.module.scss";

import {
  $getRoot,
  $createParagraphNode,
  $createLineBreakNode,
  $createTabNode,
  $createTextNode,
} from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
// import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

import ToolbarPlugin from "./custom-plugins/ToolbarPlugin";

import generateClassNames from "classnames";

const theme = {
  // Theme styling goes here
};

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
// function onChange(editorState) {
//   editorState.read(() => {
//     // Read the contents of the EditorState here.
//     const root = $getRoot();
//     const selection = $getSelection();

//     console.log(root, selection);
//   });
// }

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
// function MyCustomAutoFocusPlugin() {
//   const [editor] = useLexicalComposerContext();

//   useEffect(() => {
//     // Focus the editor when the effect fires!
//     editor.focus();
//   }, [editor]);

//   return null;
// }

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function CustomLexicalEditor({
  namespace = "DefaultEditorName",
  onChange,
  // default value may be EditorState json object
  // json string or raw text string
  defaultValue,
  defaultValueIsRawText, // raw text with multiple lines ('\n')
  // containerClassName,
  // contentEditableClassName,
  classNames,
  placeholderComponent: PlaceholderComponent,
  isEditable,
}) {
  const initialConfig = {
    // TODO: initialize editorState in message details page
    namespace,
    theme,
    onError,
    editable: isEditable,
    // editorState: defaultValue,
    editorState:
      defaultValueIsRawText === true
        ? () => initializeEditorStateWithRawText(defaultValue)
        : defaultValue,
  };

  return (
    <div className={styles.CustomLexicalEditor + " " + classNames?.container}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin classNames={{ container: classNames?.toolbar }} />
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
          placeholder={
            Boolean(PlaceholderComponent) && (
              <PlaceholderComponent className={styles.placeholder} />
            )
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
          onChange={onChange || (() => null)}
          ignoreSelectionChange={true}
        />
        <HistoryPlugin />
        {/* <MyCustomAutoFocusPlugin /> */}
      </LexicalComposer>
    </div>
  );
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
