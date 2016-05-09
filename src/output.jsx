"use strict";
import React from 'react';
import ReactDOM from 'react-dom';

import DefinitionPane from './definition_pane';
import Urban from './urban';

/**
 * A single token.
 */
class Token extends React.Component {
    constructor() {
        super();
        this.state = { active: false };
    }
    
    _hasEntry() {
        return this.props.token.synonym;
    }
    
    getColor(token) {
        if (!token.synonym)
            return 'transparent';
            
        const alpha = this.state.active ? 0.6 : 0.3;
        return `rgba(0, 128, 0, ${alpha})`;
    }
    
    onMouseEnter() {
        if (this._hasEntry()) {
            this.props.onActivate(this.props.token.synonym);
        }
        this.setState({ active: true });
    }
    
    onMouseLeave() {
        this.setState({ active: false });
    }
    
    render() {
        const token = this.props.token;
        if (!token.synonym ) 
            return <span className="token">{token.token}</span>;
        
        const style = {
            backgroundColor: this.getColor(token)
        };
        return (
            <span className="token"
                style={style}
                onMouseEnter={this.onMouseEnter.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}>{token.tokens.map(x => x.token).join('')}</span>
        );
    }
}


/**
 * 
 */
export default class Output extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            outputCache: this.getOuputData(this.props.tokens)
        };
    }
    
    componentWillReceiveProps(newProps) {
        this.setState({
            outputCache: this.getOuputData(newProps.tokens || [])
        });
    }
    
    getOuputData(tokens) {
        let outputLength = 0;
        const nodes = tokens.map(token => {
            const word = token.synonym || token.token;
            outputLength += word.length;
            return <Token key={token.id} token={token} onActivate={this.onActivate.bind(this)} />;
        });
        return { nodes: nodes, length: outputLength };
    }
    
    onActivate(word) {
        Urban.instance.lookup(word).then(def => {
            if (def) {
                this.setState({
                    word: word,
                    definition: def
                });
            }
        });
    }
    
    render() {
        const output = this.state.outputCache;
       
        let outputElement;
        if (this.props.error) {
            outputElement = <p style={{color: 'red' }}>{this.props.error}</p>;
        } else {
            outputElement = <pre className="tokens">{output.nodes}</pre>;
        }
        
        return (
            <div id="result-output" className="col-lg-6">
                <header className="result-header">
                    <h1>Output</h1>
                </header>
                <div className="output-content">
                    {outputElement}
                </div>
                
                <DefinitionPane word={this.state.word} definition={this.state.definition} />
            </div>);
    }
};


