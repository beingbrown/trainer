import React from 'react';
import {createPortal} from 'react-dom';

export default ({children,closeBehavior}) => {
    return createPortal(
        <div>
        <div>{children}</div>
        </div>,
        document.getElementById('modal-root')
    );
}