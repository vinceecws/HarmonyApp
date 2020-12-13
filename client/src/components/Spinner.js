import React from 'react';
import { ReactComponent as Yinyang } from '../graphics/yin-yang-color-harmony.svg'

const Spinner = () => {

    return (
        <div className="app-spinner-container">
            <Yinyang className="app-spinner"/>
        </div>
    )
};

export default Spinner;