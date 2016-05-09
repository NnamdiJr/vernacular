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
        if (this._hasEntry())
            this.props.onActivate(this.props.token.synonym);
        
        this.setState({ active: true });
    }
    
    onMouseLeave() {
        if (this._hasEntry())
            this.props.onDeactivate(this.props.token.synonym);
        
        this.setState({ active: false });
    }
    
    onSelect(e) {
        if (this._hasEntry()) {
            this.props.onSelect(this.props.token.synonym);
            e.stopPropagation();
        }
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
                onClick={this.onSelect.bind(this)}
                onMouseEnter={this.onMouseEnter.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}>{token.tokens.map(x => x.token).join('')}</span>
        );
    }
}


/**
 * Set of output tokens.
 */
export default class Output extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            outputCache: this.getOuputData(this.props.tokens),
            selected: null
        };
    }
    
    componentWillReceiveProps(newProps) {
        this.setState({
            outputCache: this.getOuputData(newProps.tokens || []),
            selected: null
        });
    }
    
    getOuputData(tokens) {
        return tokens.map(token => 
            <Token key={token.id} token={token}
                onActivate={this.onActivate.bind(this)}
                onDeactivate={this.onDeactivate.bind(this)}
                onSelect={this.onSelect.bind(this)} />);
    }
    
    onActivate(word) {
        this.setWord(word);
    }
    
    onSelect(word) {
        this.setWord(word, (word, def) => {
            this.setState({ selected: word});
        });
    }
    
    onDeactivate(word) {
        if (!this.state.selected) {
            this.setState({ selected: null, word: null, definition: null });
        } else {
            this.onActivate(this.state.selected.word);
        }
    }
    
    setWord(word, selected) {
        Urban.instance.lookup(word).then(def => {
            const update = {};
            update.word = def ? word : this.state.selected.word;
            update.definition = def ? def : this.state.selected.def;
            
            if (selected)
                update.selected = { word: word, def: def };

            this.setState(update);
        });
    }
    
    onDefinitionClose() {
        this.setState({ selected: null, word: null, definition: null });
    }
    
    onClickContent() {
        this.setState({ selected: null, word: null, definition: null });
    }
    
    render() {
        const output = this.state.outputCache;
       
        let outputElement;
        if (this.props.error) {
            outputElement = <p style={{color: 'red' }}>{this.props.error}</p>;
        } else {
            outputElement = <pre className="tokens">{output}</pre>;
        }
        
        return (
            <div id="result-output" className="col-lg-6">
                <header className="result-header">
                    <h1>Output</h1>
                </header>
                <div className="output-content" onClick={this.onClickContent.bind(this)}>
                    {outputElement}
                </div>
                
                <DefinitionPane word={this.state.word} definition={this.state.definition} onClose={this.onDefinitionClose.bind(this)} />
            </div>);
    }
};


