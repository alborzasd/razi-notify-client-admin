import styles from './styles.module.scss';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

function ToolbarPlugin({classNames}) {
  return (
    <div className={styles.toolbar + ' ' + classNames?.container}>
      Toolbar
    </div>
  );
}

export default ToolbarPlugin;