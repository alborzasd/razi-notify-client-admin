import styles from "./LinkButton.module.scss";
import customThemeStyles from "../../../custom-theme/CustomEditorTheme.module.scss";

import { useState, useCallback, useEffect, useRef } from "react";

import { $getSelection } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $convertLinkNodeToTextNode,
  $editUrlForNodeKey,
  $getLinkNodesFromSelection,
} from "../../../utilities/utilities";

import { TOGGLE_LINK_COMMAND } from "@lexical/link";

import ToolbarButton from "./ToolbarButton";

import Button from "../../../../components/shared/Button";
import RtlScrollbars from "../../../../components/shared/RtlScrollbars";

import { HiOutlineChevronDown } from "react-icons/hi";
import { MdOutlineDownloadDone } from "react-icons/md";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit } from "react-icons/fi";

import generateClassName from "classnames";

import useDropdownPosition from "./useDropdownPosition";

function LinkButton({ iconElement, ...rest }) {
  // is menu open
  const [isOpen, setIsOpen] = useState(false);

  const toolbarButtonRef = useRef(null);
  const menuContainerRef = useRef(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDocumentClick = useCallback(
    (e) => {
      if (!toolbarButtonRef.current) {
        return;
      }
      if (!toolbarButtonRef.current.contains(e.target)) {
        closeMenu();
      }
    },
    [toolbarButtonRef, toolbarButtonRef.current, closeMenu]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick, true);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick, true);
    };
  }, []);

  // render logic
  const openCloseIconClassName = generateClassName(styles.openCloseIcon, {
    [styles.rotate]: isOpen,
  });

  // const menuContainerClassName = generateClassName(styles.menuContainer, {
  //   [styles.open]: isOpen,
  // });

  return (
    <div ref={toolbarButtonRef} className={styles.LinkButton}>
      <ToolbarButton
        {...rest}
        activatedStyleSameAsHover={true}
        isActivated={isOpen}
        onClickProp={toggleOpen}
      >
        <HiOutlineChevronDown className={openCloseIconClassName} />
        {iconElement}
      </ToolbarButton>
      {/* IMPORTANT: the menu must be button or child of a button element
      otherwise when click on the menu, the selection is collpased */}
      {isOpen && (
        <button ref={menuContainerRef} className={styles.menuContainer}>
          <LinkMenu
            toolbarButtonRef={toolbarButtonRef}
            menuContainerRef={menuContainerRef}
            closeMenu={closeMenu}
          />
        </button>
      )}
    </div>
  );
}

function LinkMenu({ toolbarButtonRef, menuContainerRef, closeMenu }) {
  const [editor] = useLexicalComposerContext();

  const linkMenuWidth = 250;

  // will be false in useEffect
  const [isFirstRender, setIsFirstRender] = useState(true);
  // in second render
  // selection will be null (isCollapsed becomes false)
  // or object with same anchor and focus (isCollapsed becomes true)
  // or different anchor and focus (isCollapsed becomes false)
  const [currentSelection, setCurrentSelection] = useState(undefined);
  // we can't get the below values from currentSelection directly
  // because there is some selection methods that can be called
  // only inside the callback passed to editorState.read(_)
  const [selectionTextContent, setSelectionTextContent] = useState(null);
  const [isSelectionCollapsed, setIsSelectionCollapsed] = useState(null);
  // [{key, node, domElement, textContent, url}, ...]
  const [linkNodesInSelection, setLinkNodesInSelection] = useState([]);

  // runs only one time (when link menu is opened)
  // if user changes selection
  // this menu will close (because of "mousedown" event)
  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      setIsFirstRender(false);
      setCurrentSelection(selection);
      setSelectionTextContent(selection?.getTextContent());
      setIsSelectionCollapsed(Boolean(selection?.isCollapsed()));
      setLinkNodesInSelection($getLinkNodesFromSelection(selection, editor));
    });
  }, [editor]);

  useDropdownPosition(toolbarButtonRef, menuContainerRef, linkMenuWidth);

  // convert newest selection to link
  // if user tries to change selection before submit the input
  // the menu will close
  // so user has to open menu again to work with new selection
  const convertSelectionToLink = useCallback(
    (url) => {
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        closeMenu();
      }
    },
    [editor]
  );

  // edit to delete link node
  const editUrlForNodeKey = useCallback(
    (newUrl, nodeKey) => {
      if (newUrl && nodeKey) {
        editor.update(() => {
          $editUrlForNodeKey(newUrl, nodeKey);
        });
      } else if (!newUrl && nodeKey) {
        editor.update(() => {
          $convertLinkNodeToTextNode(nodeKey);
        });
      }
      closeMenu();
    },
    [editor]
  );

  // render logic
  let content;
  if (isFirstRender) {
    content = null;
  }
  // if selection is null (editor is not focused)
  // or
  // caret is collapsed
  // but it's not inside a link node
  // show dialog
  else if (
    !currentSelection ||
    (isSelectionCollapsed && linkNodesInSelection?.length === 0)
  ) {
    content = (
      <div className={styles.noSelectionDialog}>
        بخشی از متن را برای ایجاد لینک انتخاب کنید.
      </div>
    );
  }
  // if caret is expanded
  // but there is no link node in between
  // show an input to enter url
  else if (!isSelectionCollapsed && linkNodesInSelection?.length === 0) {
    content = (
      <LinkItem
        actionType="add"
        selectionTextContent={selectionTextContent}
        onSubmit={convertSelectionToLink}
      />
    );
  }
  // if caret is either collapsed or expanded
  // and there is at least one link node in between
  // show input for each link node
  else if (linkNodesInSelection?.length > 0) {
    const renderedLinkItems = linkNodesInSelection.map((nodeInfo) => (
      <LinkItem
        key={nodeInfo?.key}
        actionType="edit"
        nodeInfo={nodeInfo}
        onSubmit={editUrlForNodeKey}
      />
    ));
    // render scrollable container if there is more than 2 items
    if (linkNodesInSelection.length > 2) {
      content = (
        <RtlScrollbars>
          <div className={styles.paddingContainer}>{renderedLinkItems}</div>
        </RtlScrollbars>
      );
    } else {
      content = renderedLinkItems;
    }
  }

  const linkMenuClassName = generateClassName(styles.LinkMenu, {
    [styles.scrollable]: linkNodesInSelection?.length > 2,
  });

  return (
    <div className={linkMenuClassName} style={{ width: linkMenuWidth }}>
      {content}
    </div>
  );
}

// actionType: "add" | "edit"
function LinkItem({ actionType, onSubmit, nodeInfo, selectionTextContent }) {
  // const formRef = useRef();

  const [urlInput, setUrlInput] = useState(
    actionType === "edit" ? nodeInfo?.url : ""
  );

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (!onSubmit) return;
      if (actionType === "add") {
        onSubmit(urlInput);
      } else if (actionType === "edit") {
        onSubmit(urlInput, nodeInfo?.key);
      }
    },
    [urlInput, nodeInfo]
  );

  // that btn is a <div> not a <button>
  // so clicking it will not trigger submit event
  const handleSubmitBtnClick = useCallback(
    (e) => {
      // if (!formRef?.current) return;
      // formRef?.current?.submit(e);
      handleSubmit();
    },
    [handleSubmit]
  );

  // handle hover label (link element will be hovered automatically)
  const handleLabelMouseEnter = useCallback(() => {
    if (actionType !== "edit") return;
    const { domElement } = nodeInfo;
    if (domElement) {
      domElement.classList.add(customThemeStyles.autoHover);
    }
  }, [nodeInfo]);

  const handleLabelMouseLeave = useCallback(() => {
    if (actionType !== "edit") return;
    const { domElement } = nodeInfo;
    if (domElement) {
      domElement.classList.remove(customThemeStyles.autoHover);
    }
  }, [nodeInfo]);

  // render logic
  let labelText;
  let buttonTooltip;
  if (actionType === "edit") {
    labelText = nodeInfo?.textContent;
    buttonTooltip = "ویرایش / حذف لینک";
  } else if (actionType === "add") {
    labelText = selectionTextContent;
    buttonTooltip = "ایجاد لینک";
  }

  return (
    <form className={styles.LinkItem} onSubmit={handleSubmit}>
      <label
        htmlFor="link-input"
        className={styles.label}
        onMouseEnter={handleLabelMouseEnter}
        onMouseLeave={handleLabelMouseLeave}
      >
        "{labelText}"
      </label>
      <input
        className={styles.linkInput}
        id="link-input"
        type="text"
        placeholder="آدرس کامل لینک"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />
      <div
        title={buttonTooltip}
        className={styles.submitBtn}
        onClick={handleSubmitBtnClick}
      >
        {actionType === "add" ? (
          <HiOutlinePlus className={styles.addIcon} />
        ) : (
          <FiEdit className={styles.editIcon} />
        )}
      </div>
    </form>
  );
}

export default LinkButton;
