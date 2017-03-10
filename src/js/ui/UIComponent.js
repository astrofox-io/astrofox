import React from 'react';
import { autoBind } from '../util/object';

export default class UIComponent extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
}