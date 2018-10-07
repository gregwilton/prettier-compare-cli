# Compare changes if Prettier was run on a project

The [Prettier](https://prettier.io/) code formatter can list which files will
change but does not provide an easy way to inspect all changes that will be
made. This command line tool will take a copy of the source directory, apply
Prettier to the copy and then open a directory diff showing the changes.

[Meld](http://meldmerge.org/) is used by default to display the diff but a
different diff program can be specified in the arguments.

**Note: Only GUI diff tools are currently supported.**

## Installation

```
yarn global add git+https://github.com/gregwilton/prettier-compare.git
```

The following applications must be available on the path:
- [Prettier](https://github.com/prettier/prettier)
- [Meld](http://meldmerge.org/) (if the `--difftool` argument isn't provided)

## Example usage

Run the comparison using a specific configuration:

```
prettier-compare --src /Git/my-project --config /Git/my-project/prettier.config.js
```

Not passing the `config` argument will call Prettier with the `no-config`
option.

```
prettier-compare --src /Git/my-project
```

Specify that Prettier should only be called on js and jsx files.

```
prettier-compare --src /Git/my-project --extensions js,jsx
```

## Command line arguments

Argument   | Description
---------- | ----------------------------------------------
src        | Path to source directory
config     | Path to the Prettier config file (optional)
extensions | Comma separated list of extensions (optional)
difftool   | The directory diff command (optional)
