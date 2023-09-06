import styles from "./Image.module.scss";

import { useCallback, useState, useRef } from "react";

import Button from "./Button";

import { RiDeleteBin6Line } from "react-icons/ri";
import { HiPlus } from "react-icons/hi";

// accept any props for img tag. plus a url for fallback image
function Image({ className, fallbackSrc, src, alt, ...rest }) {
  // first loading error happened or not
  const [firstError, setFirstError] = useState(false);

  const handleImageError = (e) => {
    if (!firstError) {
      // console.log(e.target);
      e.target.onerror = null;
      e.target.src = fallbackSrc;

      setFirstError(true);
    }
  };

  return (
    <img
      {...rest}
      className={styles.Image + " " + className}
      alt={alt}
      src={src || ""} // if src==undefined then, error event will not trigger. so we pass '' instead of undefined
      onError={handleImageError}
    />
  );
}

export function ImagePicker({
  containerClassName,
  imageClassName,
  initialSrc,
  emptyImageSrc,
  // will be shown if initial or empty image src has error
  fallbackSrc,
  onImageChange,
  // ...rest
}) {
  const [currentSrc, setCurrentSrc] = useState(initialSrc || emptyImageSrc);
  // if not initialSrc is passed, then set isEmpty to true
  const [isEmpty, setIsEmpty] = useState(!(initialSrc));

  const fileInputRef = useRef();
  // keep track of previous object url to revoke later
  const objectUrlRef = useRef();

  // we want to mount a new Image compoenent when image changes
  // because error handling in image component only runs 1 time
  const [imageComponentKey, setImageComponentKey] = useState(0);

  const toggleImageComponentKey = useCallback(() => {
    setImageComponentKey((prev) => (prev === 0 ? 1 : 0));
  }, [setImageComponentKey]);

  const handleDeleteImageClick = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef);
    }
    objectUrlRef.current = null;
    
    setCurrentSrc(emptyImageSrc);
    setIsEmpty(true);
    toggleImageComponentKey();

    if(typeof onImageChange === "function") {
      onImageChange(null);
    }
  }, [setCurrentSrc]);

  const handleAddImageClick = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }, [fileInputRef]);

  const handleFileChange = useCallback((e) => {
    // console.log('file change');
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef);
    }
    const file = e.target.files[0];
    const currentObjectUrl = URL.createObjectURL(file);
    objectUrlRef.current = currentObjectUrl;

    setCurrentSrc(currentObjectUrl);
    setIsEmpty(false);
    toggleImageComponentKey();

    // reset the file input value
    // so uploading the same file can be processed again
    e.target.value = null;

    if(typeof onImageChange === "function") {
      onImageChange(file);
    }
  }, []);

  return (
    <div className={styles.ImagePicker + " " + containerClassName}>
      <Image
        // {...rest}
        key={imageComponentKey}
        className={imageClassName + " " + styles.image}
        fallbackSrc={fallbackSrc}
        src={currentSrc}
      />

      {!(isEmpty) ? (
        <Button
          className={styles.button}
          title="حذف تصویر"
          onClick={handleDeleteImageClick}
        >
          <RiDeleteBin6Line />
        </Button>
      ) : (
        <Button
          className={styles.button}
          title="افزودن تصویر"
          onClick={handleAddImageClick}
        >
          <HiPlus />
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept="image/png, image/gif, image/jpeg"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Image;
