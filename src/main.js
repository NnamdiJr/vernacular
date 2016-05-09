"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import Header from './header'
import Description from './description';
import Example from './example';


const EXAMPLE_COUNT = 10;

const texts = {
    'Pride and Prejudice': 'samples/pride-and-prejudice.json',
    'Emma': 'samples/emma.json',
    
    "The Gentlemen's Book Of Etiquette": 'samples/gentlemens-etiquette.json',
    "Ladies' Book Of Etiquette": 'samples/ladies-etiquette.json',
    
    'King James Bible': 'samples/king-james-bible.json',
    'Paradise Lost': 'samples/paradise-lost.json',
    
    'The Communist Manifesto': 'samples/the-communist-manifesto.json',
    'Mein Kampf': 'samples/mein-kampf.json',
    
    'Memoirs of Fanny Hill': 'samples/memoirs-of-fanny-hill.json',
    
    'Brave New World': 'samples/brave-new-world.json',
    'Moby-Dick': 'samples/moby-dick.json',
    'Anna Karenina': 'samples/anna-karenina.json',

    'The Adventures of Huckleberry Finn': 'samples/huck-finn.json',
    'The Adventures of Sherlock Holmes': 'samples/the-adventures-of-sherlock-holmes.json',
    
};

const examples = {};

const getExample = (file) => {
    if (examples[file])
        return Promise.resolve(examples[file]);
    return new Promise((resolve, reject) => $.getJSON(file, resolve))
        .then(example => {
            examples[file] = example;
            return example;
        });
};

/**
 * 
 */
class Site extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active_examples: [],
            choice: '',
            example: null
        };
    }

    componentWillMount() {
        if (this.props.choices) {
            const choices = Object.keys(this.props.choices);
            choices[0] && this.onSelectChoice(choices[0]);
        }
    }

    onSelect(e) {
        this.onSelectChoice(e.target.value);
    }

    onSelectChoice(choice) {
        const pick = texts[choice];
        if (!pick)
            return;

        getExample(pick).then(example => {
            this.setState({
                choice: choice,
                example: example,
                active_examples: this.getExamples(example)
            });
        });
    }

    getExamples(examples) {
        const picked = [];
        const len = examples.length;
        for (let i = 0; i < EXAMPLE_COUNT; ++i)
            picked.push(examples[Math.floor(Math.random() * len)]);

        return picked.filter((x, i) => picked.indexOf(x) === i);
    }

    onRandom() {
        this.setState({
            active_examples: this.getExamples(this.state.example)
        });
    }

    render() {
        const choices = Object.keys(this.props.choices || {}).map(title =>
            <option key={title} value={title}>{title}</option>
        );

        const examples = this.state.active_examples.map(example =>
            <Example key={example.i} {...example} />
        );

        return (
            <div id="main">
                <Header />
                <div className="content container-fluid">
                    <Description />

                    <div id="pre-text-choices" >
                        <select onChange={this.onSelect.bind(this) }>{choices}</select><br/>
                        <button onClick={this.onRandom.bind(this) }>Shuffle</button>
                    </div>

                    <div id="ouput-container" className="container-fluid">{examples}</div>
                    
                    <button onClick={this.onRandom.bind(this) }>Shuffle</button>
                </div>
            </div>);
    }
};


ReactDOM.render(
    <Site choices={texts} />,
    document.getElementById('target'));
