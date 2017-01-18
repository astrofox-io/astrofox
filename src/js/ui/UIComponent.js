import React from 'react';
import { autoBind } from '../util/object';

class UIComponent extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
}

export default UIComponent;