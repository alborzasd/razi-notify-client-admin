import { useState } from "react";

// accept any props for img tag. plus a url for fallback image
function Image({fallbackSrc, src, alt, ...rest}) {
    // first loading error happened or not
    const [firstError, setFirstError] = useState(false);
    
    const handleImageError = (e) => {
        if(!firstError) {
            // console.log(e.target);
            e.target.onerror = null;
            e.target.src = fallbackSrc;

            setFirstError(true);
        }
    }

    return (
        <img
            {...rest}
            alt={alt}
            src={src}
            onError={handleImageError}
        />
    );
}

export default Image;