# Vernacular

Vernacular is an experiment that finds occurrences of Urban Dictionary entries in text. This provides a fun new reading experiance and alters text in ways the authors probably never imagined.

<div align="center" >
    <p align="center">Example from <i>Pride and Prejudice</i></p>
    <img src="https://raw.githubusercontent.com/mattbierner/vernacular/master/documentation/in-that-way.png" alt="" />
</div>

-------

<div align="center" >
    <p align="center">All entries found in the opening of <i>Huckleberry Finn</i></p>
    <img src="https://raw.githubusercontent.com/mattbierner/vernacular/master/documentation/huck-finn.png" alt="" />
</div>


**Links**

* [Main site]() - Shows example matches from various texts. Only matches of three words or more are shown. 
* [Interactive]() - Enter your own text, shows all matches.


## Building
The `master` branch has the main server code, while the website code is stored in the `gh-pages` branch.

### Server
Very simple server that uses express. Start using:

```bash
$ cd vernacular
$ git checkout master
$ npm install
$ node server.js
```

### Website
The website uses [Jekyll](http://jekyllrb.com/) and [Webpack](http://webpack.github.io/) for buildings

```bash
$ cd vernacular
$ git checkout gh-pages
$ npm install
```

Start Jekyll with:

```bash
$ jekyll serve -w
```

Start webpack with:

```bash
$ webpack --watch
```

Main Javascript is stored in `src` and output to `js`.