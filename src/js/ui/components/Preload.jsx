import React from 'react';
import fontOptions from '../../../config/fonts.json';

const Preload = () => {
    let fonts = fontOptions.map((item, index) => {
        return <div key={index} style={{fontFamily: item.name}}>{item.name}</div>;
    });

    return (
        <div className="hidden">
            {fonts}
        </div>
    );
};

export default Preload;