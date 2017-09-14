import React from 'react';
import { autoBind } from 'util/object';

export default class UIPureComponent extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
    }
}