// react-custom-scrollbars2 users negative mergin-right to hide the native scrollbar on right side
// but if css direction is rtl, then native scrollbar is shown on left side
// but the negative margin is still on right side
// so both native and custom scrollbars are shown inside scrolling container
// in this component we pass a custom render prop to replace margin right with margin left

import Scrollbars from "react-custom-scrollbars-2";

function RtlScrollbars({children, ...props}){
    return (
        <Scrollbars
            {...props}
            renderView={props => (<div {...props} style={{ ...props.style, marginLeft: props.style.marginRight, marginRight: 0, }} /> )}
        >
            {children}
        </Scrollbars>
    );
}

export default RtlScrollbars;