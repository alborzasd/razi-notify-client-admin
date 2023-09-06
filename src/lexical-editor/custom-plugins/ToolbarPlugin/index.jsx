import styles from "./styles.module.scss";

import { useState, useCallback, useEffect, useRef } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";

import { $getSelectionStyleValueForProperty } from "@lexical/selection";

import {
  $getCustomParagraphNodesFromSelection,
  $getAlignmentValue,
  $getDirectionValue,
} from "../../utilities/utilities";

import {
  registerCustomCommands,
  SET_DIRECTION_COMMAND,
  APPLY_STYLE_TEXT_COMMAND,
} from "../../custom-commands/commands";

import ToolbarButton from "./ui/ToolbarButton";
import ColorPickerButton from "./ui/ColorPickerButton";
import LinkButton from "./ui/LinkButton";

import { toast } from "react-toastify";
import { resolvedToastOptions } from "../../../components/shared/CustomToastContainer";

import { availableNameSpaces } from "../../constants/constants";

import { AiOutlineBold } from "react-icons/ai";
import { AiOutlineItalic } from "react-icons/ai";
import { RiUnderline } from "react-icons/ri";
import { RiAlignRight } from "react-icons/ri";
import { RiAlignCenter } from "react-icons/ri";
import { RiAlignLeft } from "react-icons/ri";
import { RiAlignJustify } from "react-icons/ri";
import { ImRtl } from "react-icons/im";
import { ImLtr } from "react-icons/im";
import { MdOutlineFormatColorText } from "react-icons/md";
import { MdFormatColorFill } from "react-icons/md";
import { RiSave3Fill } from "react-icons/ri";
import { LiaFileUploadSolid } from "react-icons/lia";
import { AiOutlineLink } from "react-icons/ai";

import generateClassNames from "classnames";

function ToolbarPlugin({ classNames, isEditable, namespace }) {
  const [editor] = useLexicalComposerContext();

  const fileInputRef = useRef(null);

  // placeholder
  const [showPlaceholder, setShowPlaceholder] = useState(
    namespace !== availableNameSpaces.messageDetailsPageEditor
  );

  // format
  const [isBoldActivated, setIsBoldActivated] = useState(false);
  const [isItalicActivated, setIsItalicActivated] = useState(false);
  const [isUnderlineActivated, setIsUnderlineActivated] = useState(false);

  // direction
  const [isRtlActivated, setIsRtlActivated] = useState(false);
  const [isLtrActivated, setIsLtrActivated] = useState(false);

  // alignment
  const [isAlignRightActivated, setIsAlignRightActivated] = useState(false);
  const [isAlignCenterActivated, setIsAlignCenterActivated] = useState(false);
  const [isAlignLeftActivated, setIsAlignLeftActivated] = useState(false);
  const [isAlignJustifyActivated, setIsAlignJustifyActivated] = useState(false);

  // colors
  const [currentSelectionTextColor, setCurrentSelectionTextColor] =
    useState("NULL");
  const [currentSelectionBackgroundColor, setCurrentSelectionBackgroundColor] =
    useState("NULL");

  // register custom commands
  // should be in useEffect
  // so registration can be unsubscribed when unmount happens
  useEffect(() => {
    return registerCustomCommands(editor);
  }, [editor]);

  const $updateToolbar = useCallback(() => {
    const root = $getRoot();
    const selection = $getSelection();
    // TODO: $isNodeSelection is needed?
    if ($isRangeSelection(selection)) {
      // render placeholder
      const rootChildren = root.getChildren();
      const firstChild = rootChildren[0];
      if (firstChild?.isEmpty() === false || rootChildren?.length > 1) {
        setShowPlaceholder(false);
      } else {
        setShowPlaceholder(true);
      }
      // format
      setIsBoldActivated(selection.hasFormat("bold"));
      setIsItalicActivated(selection.hasFormat("italic"));
      setIsUnderlineActivated(selection.hasFormat("underline"));
      // get block element parents from selection
      const customParagraphNodes =
        $getCustomParagraphNodesFromSelection(selection);
      // direction
      const directionValue = $getDirectionValue(customParagraphNodes);
      setIsRtlActivated(directionValue === "rtl");
      setIsLtrActivated(directionValue === "ltr");
      // alignment
      const alignmentValue = $getAlignmentValue(customParagraphNodes);
      setIsAlignRightActivated(alignmentValue === "right");
      setIsAlignCenterActivated(alignmentValue === "center");
      setIsAlignLeftActivated(alignmentValue === "left");
      setIsAlignJustifyActivated(alignmentValue === "justify");
      // color
      setCurrentSelectionTextColor(
        // third param returns if no value found
        $getSelectionStyleValueForProperty(selection, "color", "NULL")
      );
      setCurrentSelectionBackgroundColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "NULL"
        )
      );
    }
  }, [editor]);

  // format
  const handleBoldClick = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }, [editor]);

  const handleItalicClick = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }, [editor]);

  const handleUnderlineClick = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }, [editor]);

  // direction
  const handleRtlClick = useCallback(() => {
    editor.dispatchCommand(SET_DIRECTION_COMMAND, "rtl");
  }, [editor]);

  const handleLtrClick = useCallback(() => {
    editor.dispatchCommand(SET_DIRECTION_COMMAND, "ltr");
  }, [editor]);

  // alignment
  const handleAlignRightClick = useCallback(() => {
    editor.dispatchCommand(
      FORMAT_ELEMENT_COMMAND,
      isAlignRightActivated ? "" : "right"
    );
  }, [editor, isAlignRightActivated]);

  const handleAlignCenterClick = useCallback(() => {
    editor.dispatchCommand(
      FORMAT_ELEMENT_COMMAND,
      isAlignCenterActivated ? "" : "center"
    );
  }, [editor, isAlignCenterActivated]);

  const handleAlignLeftClick = useCallback(() => {
    editor.dispatchCommand(
      FORMAT_ELEMENT_COMMAND,
      isAlignLeftActivated ? "" : "left"
    );
  }, [editor, isAlignLeftActivated]);

  const handleAlignJustifyClick = useCallback(() => {
    editor.dispatchCommand(
      FORMAT_ELEMENT_COMMAND,
      isAlignJustifyActivated ? "" : "justify"
    );
  }, [editor, isAlignJustifyActivated]);

  // color
  const handleChangeTextColor = useCallback(
    (newColorRgbaString) => {
      editor.dispatchCommand(APPLY_STYLE_TEXT_COMMAND, {
        color: newColorRgbaString,
      });
    },
    [editor]
  );

  const handleChangeBackgroundColor = useCallback(
    (newColorRgbaString) => {
      editor.dispatchCommand(APPLY_STYLE_TEXT_COMMAND, {
        "background-color": newColorRgbaString,
      });
    },
    [editor]
  );

  // import/export
  const handleImportClick = useCallback(() => {
    // forward click event to hidden file input
    if (fileInputRef.current) {
      // trigger handleFileChange
      fileInputRef.current.click();
    }
  }, [editor]);

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const jsonStr = await file.text();
          // lexical can set editor state
          // from json string or json object
          const editorState = editor.parseEditorState(jsonStr);
          editor.setEditorState(editorState);
          toast.success(
            "فایل پیش نویس در ویرایشگر وارد شد.",
            resolvedToastOptions
          );
        } catch (err) {
          console.error("Parse editor state error => ", err);
          toast.error("فایل پیش نویس قابل پردازش نیست", resolvedToastOptions);
        }
      }

      // reset the file input value
      // so uploading the same file can be processed again
      e.target.value = null;
    },
    [editor]
  );

  const handleExportClick = useCallback(() => {
    const editorState = editor.getEditorState();
    const jsonStr = JSON.stringify(editorState, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const aElement = document.createElement("a");
    aElement.href = url;
    aElement.download = "razi-notify-message-draft.json";
    aElement.click();

    URL.revokeObjectURL(url);
  }, [editor]);

  // call $updateToolbar when one of it's buttons is clicked
  // or selection position changed
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateToolbar();
      });
    });
  }, [editor, $updateToolbar]);

  const toolbarClassName = generateClassNames(styles.Toolbar, classNames?.container, {
    // if editor is empty
    // showPlaceholder will be true
    // and we want to unset position sticky
    [styles.noSticky]: showPlaceholder
  });

  return (
    <div className={toolbarClassName}>
      <ToolbarButton
        isActivated={isBoldActivated}
        // setIsActivated={setIsBoldActivated}
        isDisabled={!isEditable}
        onClickProp={handleBoldClick}
        title="برجسته"
      >
        <AiOutlineBold />
      </ToolbarButton>

      <ToolbarButton
        isActivated={isItalicActivated}
        // setIsActivated={setIsItalicActivated}
        isDisabled={!isEditable}
        onClickProp={handleItalicClick}
        title="مورب"
      >
        <AiOutlineItalic />
      </ToolbarButton>

      <ToolbarButton
        isActivated={isUnderlineActivated}
        // setIsActivated={setIsUnderlineActivated}
        isDisabled={!isEditable}
        onClickProp={handleUnderlineClick}
        title="زیر خط"
      >
        <RiUnderline />
      </ToolbarButton>

      <div className={styles.verticalSeparator}></div>

      <ToolbarButton
        className={styles.rtlButton}
        isActivated={isRtlActivated}
        isDisabled={!isEditable}
        onClickProp={handleRtlClick}
        title="راست به چپ"
      >
        <ImRtl />
      </ToolbarButton>

      <ToolbarButton
        className={styles.ltrButton}
        isActivated={isLtrActivated}
        isDisabled={!isEditable}
        onClickProp={handleLtrClick}
        title="چپ به راست"
      >
        <ImLtr />
      </ToolbarButton>

      <div className={styles.verticalSeparator}></div>

      <ToolbarButton
        isActivated={isAlignRightActivated}
        isDisabled={!isEditable}
        onClickProp={handleAlignRightClick}
        title="تراز از راست"
      >
        <RiAlignRight />
      </ToolbarButton>

      <ToolbarButton
        isActivated={isAlignCenterActivated}
        isDisabled={!isEditable}
        onClickProp={handleAlignCenterClick}
        title="تراز از وسط"
      >
        <RiAlignCenter />
      </ToolbarButton>

      <ToolbarButton
        isActivated={isAlignLeftActivated}
        isDisabled={!isEditable}
        onClickProp={handleAlignLeftClick}
        title="تراز از چپ"
      >
        <RiAlignLeft />
      </ToolbarButton>

      <ToolbarButton
        isActivated={isAlignJustifyActivated}
        isDisabled={!isEditable}
        onClickProp={handleAlignJustifyClick}
        title="تراز کامل"
      >
        <RiAlignJustify />
      </ToolbarButton>

      <div className={styles.verticalSeparator}></div>

      <ColorPickerButton
        currentSelectionColor={currentSelectionTextColor}
        onChangeComplete={handleChangeTextColor}
        iconElement={<MdOutlineFormatColorText />}
        // toolbar button internal props
        className={styles.textColorButton}
        isDisabled={!isEditable}
        title="رنگ متن"
      />

      <ColorPickerButton
        currentSelectionColor={currentSelectionBackgroundColor}
        onChangeComplete={handleChangeBackgroundColor}
        iconElement={<MdFormatColorFill />}
        isForBackground={true}
        // toolbar button internal props
        className={styles.backgroundColorButton}
        isDisabled={!isEditable}
        title="رنگ زمینه"
      />

      <div className={styles.verticalSeparator}></div>

      <LinkButton
        iconElement={<AiOutlineLink />}
        // toolbar button internal props
        className={styles.linkButton}
        isDisabled={!isEditable}
        title="ایجاد/حذف لینک"
      />

      <div className={styles.verticalSeparator}></div>

      <ToolbarButton
        className={styles.importButton}
        isDisabled={!isEditable}
        onClickProp={handleImportClick}
        title="گرفتن پیش نویس از فایل"
      >
        {/* hidden input element to get file */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <LiaFileUploadSolid />
      </ToolbarButton>

      <ToolbarButton
        className={styles.exportButton}
        isDisabled={false} // anyone can save message of any other channel
        onClickProp={handleExportClick}
        title="ذخیره پیش نویس"
      >
        <RiSave3Fill />
      </ToolbarButton>

      {showPlaceholder && (
        <div className={styles.placeholder + " " + styles.default}>
          متن پیام
        </div>
      )}
    </div>
  );
}

export default ToolbarPlugin;
