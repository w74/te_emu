## Te_emu: Table of Contents
+ [What's **Te\_emu**?](https://github.com/w74/te_emu)
+ [Setup](https://github.com/w74/te_emu)
+ [Terminology](https://github.com/w74/te_emu)
+ [Usage](https://github.com/w74/te_emu)
    * [HTML](https://github.com/w74/te_emu)
    * [JS](https://github.com/w74/te_emu)
+ [Best Practices](https://github.com/w74/te_emu)
    * [PSHHH, I DO WHAT I WANT](https://github.com/w74/te_emu)
    * [Templates](https://github.com/w74/te_emu)
+ [Contributing](https://github.com/w74/te_emu)
    * [What's Next?](https://github.com/w74/te_emu)

## What's Te\_emu?
**Te\_emu** is a terminal emulator meant to visually replicate the linux terminal on a webpage. It's main purpose is to allow function calls via the terminal syntax `function argument1 argument2 --flag1 --flag2 etc.`. It is written in vanilla JS, has zero dependencies, and is less than 5kb.

## Setup
Nothing to install! Download `dist/te\_emu.min.js` and include it in your HTML or JS code. **Te\_emu** doesn't do anything until instantiated, so it can be in the `<head>` or `<body>`.

## Terminology
#### Pattern of an OS command line interface:
| Prompt | Command | Subcommand | Arguments | Flags
|:--- |:--- |:--- |:--- |:--- |
| `$` | `npm` | `install` | `arg1 arg2 ... argN` | `--save-dev -v ...` |

#### Flatness
A "flat" Command has no Subcommands and will run with or without arguments or flags. For example, in `rm /path/to/file.js`, `rm` is a flat Command cause it only does one thing and therefore doesn't need Subcommands. In **Te\_emu**, flat Commands will only run their `defaultFx` Function thought they can be modified via Flags.

## Usage
#### HTML
1. Create a `<div>` with a unique class or id (default `teemu-window`) to house the terminal input/output.
```html
    <div id="teemu-window"></div>           <!-- or -->
    <div class="teemu-window"></div>        <!-- or -->
    <div id="unique-window-id"></div>       <!-- or -->
    <div class="unique-window-class"></div>
```
2. Create an `<input type="text">` field with a unique class or id (default `teemu-cl`) for the user to interact with. A `<form>` element **is not required** since no submit events occur, but you can include the `<form>` element if you want to be semantic.
```html
    <input type="text" id="teemu-cl">           <!-- or -->
    <input type="text" class="teemu-cl">        <!-- or -->
    <input type="text" class="unique-cl-id">    <!-- or -->
    <input type="text" class="unique-cl-class">
```

#### JS
1. Instantiate a `new Te_emu` Object.
```javascript
    var te_emu = new Te_emu({options: 'see table below'});
```
| Options   | Req?  | Default   | Description   |
|:--- |:--- |:--- |:--- |
| commandLine | N | `[".teemu-cl", "#teemu-cl"]` | {Array} of classes and ids of elements **Te\_emu** will watch for input |
| outputEl | N | `"code"` | HTML tag to wrap output |
| windows | N | `[".teemu-window", "#teemu-window"]` | {Array} of classes and ids of elements **Te_emu** will output to |
| prompt | N | `"$"` | {String} or character used to denote user input |

2. Add a new `Command` Object.
```javascript
    te_emu.addCommand({options: 'see table below'});
```
| Options   | Req?  | Default   | Description   |
|:--- |:--- |:--- |:--- |
| key | Y |  | {String} keyword to reference Command (case sensitive)
| defaultFx | N | `Function()` | {Function} ran if user-specified Subcommand isn't found or if Command is "flat". By default, the Function outputs attached Subcommands. See [Templates](https://github.com/w74/te_emu) below. |
| flat | N | `false` | {Boolean} determines if a Command is "flat" |

3. Add a new Subcommand.
```javascript
    te_emu.cmd('subcommand').addSub({options: 'see table below'})
```
| Options   | Req?  | Default   | Description   |
|:--- |:--- |:--- |:--- |
| key | Y |  | {String} keyword to reference Subcommand (case sensitive)
| fx | Y |  | {Function} Declaration: `function([Array of Arguments], [Array of Flags]){}`. See [Templates](https://github.com/w74/te_emu) below. |
| format | N | `undefined` | **recommended**; {String} to show how the Subcommand should be called. Ex. `"npm install <git:// url> flag"`` |
| flags | N | `undefined` | {Object} which describes a flag and its description. Ex. `{"-v": "shows version number"}` |