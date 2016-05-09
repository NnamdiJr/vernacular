import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Displays a definition.
 */
export default class DefinitionPane extends React.Component {
    render() {
        return (
            <div className="definition-panel" style={{ visible: !!this.props.word }}>
                <div>
                    <h1>{this.props.word}</h1>
                    <pre className="definition">{this.props.definition}</pre>
                </div>
            </div>
        );
    }
}