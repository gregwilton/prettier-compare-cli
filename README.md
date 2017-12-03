# Compare changes if Prettier was run on a project

The [Prettier](https://prettier.io/) code formatter can list which files will
change but does not provide an easy way to inspect all changes that will be
made. This command line tool will take a source directory, copy the files, apply
Prettier to the copy and then open [Meld](http://meldmerge.org/) in directory
comparison mode so a diff of all files can be viewed.

## Installation

```
yarn global add git+https://github.com/gregwilton/prettier-compare.git
```

[Meld](http://meldmerge.org/) must be also installed and available on the path.

## Example usage

Run the comparison using a specific configuration:

```
prettier-compare --src /Git/my-project --dest /Temp/output --config /Git/my-project/prettier.config.js
```

Not passing the `config` argument will call Prettier with the `no-config`
option.

```
prettier-compare --src /Git/my-project --dest /Temp/output --config /Git/my-project/prettier.config.js
```

## Command line arguments

Argument | Description
---------| ----------------------------------------------
src      | Path to source directory
dest     | Path to destination directory
config   | Path to the Prettier config file (optional)
