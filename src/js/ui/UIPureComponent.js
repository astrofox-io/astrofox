import React from 'react';
import { autoBind } from '../util/object';

export default class UIPureComponent extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        autoBind(this);
    }
}