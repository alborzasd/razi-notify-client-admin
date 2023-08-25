import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

// this plugin will trigger an update for the first time
// so the ref passed to the editor (defaultValueProp)
// can be initilized

function TriggerUpdatePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      // this will actually trigger update listener
      // other setter methods (i.e. setDirection) will call this method
      root.getWritable();
    });
  }, []);
}

export default TriggerUpdatePlugin;