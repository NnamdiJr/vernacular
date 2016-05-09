"use strict";
import autoTextOptions from './data';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as chroma from 'chroma-js';
import config from './config';

import Urban from './urban';
import Output from './output';

const API = `${config.server}/api/tokens`;
const WORD_RE = /([\w']+)/g;

/**
 * Translate tome text.
 */
const translate = (tokens, whole, proper) =>
    new Promise((resolve, reject) =>
        $.ajax({
            type: "POST",
            url: API,
            contentType: 'application/json',
            data: JSON.stringify({
                tokens: tokens,
                whole_words: whole,
                no_proper_nouns: !proper
            }),
            dataType: 'json',
            error: () => reject('Error connecting to server')
        }).then(resolve, reject));

/**
 * Split text into tokens.
 */
const tokenize = text => {
    const tokens = text.split(WORD_RE);
    return tokens.map((token, i) => ({
        id: i,
        token: token
    }));
};

const translateTextInput = (text, whole, proper) => {
    const tokens = tokenize(text);
    return translate(tokens, whole, proper)
        .then(result => {
            if (result.error)
                throw result.error;
            return result.tokens;
        });
};

const resizeTextArea = () =>
    $('textarea').each(function (x) {
        $(this).height(0).height($(this).get()[0].scrollHeight);
    });

/**
 * 
 */
class Site extends React.Component {
    constructor() {
        super();
        this.state = {
            input: '',
            proper: true,
            whole: false,
            tokens: []
        };
    }

    componentWillMount() {
        this.setState({ input: this.props.input || '' });
        if (this.props.choices) {
            const choices = Object.keys(this.props.choices);
            choices[0] && this.onSelectChoice(choices[0]);
        }
    }

    componentDidUpdate() {
        resizeTextArea();
    }

    translate(text, whole, proper) {
        translateTextInput(text, whole, proper)
            .then(tokens => {
                this.setState({ tokens: tokens, error: null });
            })
            .catch(error => {
                this.setState({ tokens: [], error: error });
            });
    }

    onSubmit() {
        this.translate(this.state.input, this.state.whole, this.state.proper);
    }

    onInputChange(e) {
        this.setState({ input: e.target.value });
    }

    onSelect(e) {
        this.onSelectChoice(e.target.value);
    }

    onSelectChoice(choice) {
        let text = autoTextOptions[choice];
        if (!text)
            return;
        text = text.replace(/\\n/g, '\n');
        this.setState({ input: text });
        this.translate(text, this.state.whole, this.state.proper);
    }

    render() {
        const choices = Object.keys(this.props.choices || {}).map(title => (
            <option key={title} value={title}>{title}</option>
        ));

        return (
            <div id="interactive">
                <header className="interative-header">
                    <h1>
                        <a href=".."><div>vern</div><div>ac</div><div>ular</div></a>
                    </h1>
                    <h2>(interactive)</h2>
                </header>

                <div id="pre-text-choices" >
                    <select onChange={this.onSelect.bind(this) }>{choices}</select>
                </div>

                <div id="ouput-container" className="container-fluid">
                    <div id="results" className="row">
                        <div id="input-container" className="col-lg-6">
                            <header className="result-header">
                                <h1>Input</h1>
                            </header>

                            <textarea id="input" onChange={this.onInputChange.bind(this) } value={this.state.input} />

                            <div id="submit-group">
                                <button onClick={this.onSubmit.bind(this) }>Submit</button>
                            </div>
                        </div>

                        <Output error={this.state.error} tokens={this.state.tokens} />
                    </div>
                </div>
            </div>);
    }
};


$(() => {
    $(window).resize(resizeTextArea);

    resizeTextArea();
});


ReactDOM.render(
    <Site choices={autoTextOptions} />,
    document.getElementById('target'));
