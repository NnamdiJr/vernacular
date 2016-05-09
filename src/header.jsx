"use strict";
import React from 'react';
import ReactDOM from 'react-dom';

const SERVER = "http://localhost:3000";

const letters = 'vernacular'.split('').map((x, i) => `${x}-${i}`);

const appearAnimationDelay = 0.2;
const letterDelay = 0.1;


/**
 * Single line of the header.
*/
class Letter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { animating: false };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.word !== newProps.word) {
            this.setState({ animating: false });
            this.forceUpdate();
        }
    }

    render() {
        const word = this.props.word || ''
        const pre = word.slice(0, this.props.index)
        const post = word.slice(this.props.index + 1);

        const animatingClass = this.state.animating ? 'fade' : '';
        if (!this.state.animating) {
            setTimeout(() => {
                this.setState({ animating: true });
                this.forceUpdate();
            }, 20);
        }

        const style = {
            'animationDelay': appearAnimationDelay + this.props.i * letterDelay + 's'
        };

        return (
            <div className="letter-line" style={style}>
                <b className="letter">{this.props.letter}</b>
                <div className="cols">
                    <div className={"pre col " + animatingClass}>
                        <span>{pre}</span>
                    </div>
                    <div  className={"post col " + animatingClass}>
                        <span>{post}</span>
                    </div>
                </div>
            </div>);
    }
}

const allIndicies = (str, c) => {
    const indices = [];
    for (let i = 0, len = str.length; i < len; ++i)
        if (str[i] === c)
            indices.push(i);
    return indices
}

/**
 * Page header.
 * 
 * Shows crosswords of random urban dictionary words, using up all your network :)
 */
export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        for (const l of letters)
            this.state[l] = { index: 0, word: '' };
        this._updates = new Set(letters);
    }

    componentDidMount() {
        this._source = new EventSource(`${SERVER}/noise`);
        this._source.addEventListener('message', e => this.updateText(e.data), false);
    }

    updateText(phrase) {
        const phraseLower = phrase.toLowerCase();
        for (const l of this._updates) {
            const indicies = allIndicies(phraseLower, l[0]);
            if (indicies.length) {
                indicies.sort(Math.random);
                const index = indicies[0];
                const update = {};
                update[l] = { word: phrase, index: index };
                this.setState(update);
                this._updates.delete(l);
                this._updates.add(l);
                break;
            }
        }
    }

    render() {
        const words = letters.map((l, i) => {
            const state = this.state[l];
            return <Letter key={l} letter={l[0]} word={state.word} index={state.index} i={i} />;
        });
        return (
            <header className="site-header">
                <div className="letters">{words}</div>
            </header>);
    }
}

