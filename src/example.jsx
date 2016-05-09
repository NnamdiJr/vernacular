"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
import Urban from './urban';

class Definition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        };
    }

    onClick() {
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        return (
            <pre className={"definition " + (this.state.expanded ? 'active' : '') } onClick={this.onClick.bind(this) }>
                {this.props.definition}
            </pre>
        );
    }
}

/**
 * 
 */
export default class Example extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: null,
            expanded: false
        };
    }

    componentWillMount() {
        Urban.instance.lookup(this.props.synonym).then(def => {
            this.setState({ definition: def });
        });
    }
    render() {
        const style = { display: this.state.definition ? 'block' : 'none' };

        return (
            <div className="example" style={style}>
                <h2 className="synonym">{this.props.synonym}</h2>
                <blockquote className="excerpt">
                    <span className="pre">{this.props.pre}</span><b>{this.props.word}</b><span className="post">{this.props.post}</span>
                </blockquote>
                <Definition {...this.props} definition={this.state.definition} />
            </div>
        );
    }
};
