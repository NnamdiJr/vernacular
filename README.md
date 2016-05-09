# Vernacular

The `gh-pages` branch of *Vernacular* has the website source code. See `master` branch for more info about the project and how to run the server.

## Building and Running
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