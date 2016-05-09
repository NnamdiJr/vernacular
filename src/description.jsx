"use strict";
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Page description.
 *
 */
export default class Description extends React.Component {
    render() {
        return (
            <div className="description">
                <p>
                    <i>Vernacular</i> is an experiment that finds occurrences of <i>Urban Dictionary</i> entries in text.<br/>
                    This provides a fun new reading experiance and alters text in ways the authors probably never imagined.
                </p>
                <nav className="links">
                    <a href="interactive">Vernacular Your Own Text</a>
                    <a href="https://github.com/mattbierner/vernacular">Source Code</a>
                </nav>
                <p>
                    This page has a few fully processed samples texts to investigate. To keep download sizes reasonable, only matches of three words or more are included in these examples.
                    Check out the <a>interative page</a> to lookup all entries.
                </p>
            </div>);
    }
}

