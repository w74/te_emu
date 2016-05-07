## Te_emu: Table of Contents
+ [What's **Te\_emu**?](https://github.com/w74/te_emu#whats-te_emu)
+ [Setup](https://github.com/w74/te_emu#setup)
+ [Terminology](https://github.com/w74/te_emu#terminology)
+ [Usage](https://github.com/w74/te_emu#usage)
    * [HTML](https://github.com/w74/te_emu#html)
    * [JS](https://github.com/w74/te_emu#js)
    * [Notes](https://github.com/w74/te_emu#notes)
+ [Recommended Practices](https://github.com/w74/te_emu#recommended-practices)
    * [PSHHH, I DO WHAT I WANT](https://github.com/w74/te_emu#pshhh-i-do-what-i-want)
    * [Templates](https://github.com/w74/te_emu#templates)
+ [Contributing](https://github.com/w74/te_emu#contributing)
    * [What's Next?](https://github.com/w74/te_emu#whats-next)

## What's Te\_emu?
**Te\_emu** is a terminal emulator meant to visually replicate the linux terminal on a webpage. It's main purpose is to allow function calls via the terminal syntax (`function argument1 argument2 --flag1 --flag2 etc.`). It is written in vanilla JS, has zero dependencies, and is less than 5kb.

## Setup
Nothing to install! Download `dist/te_emu.min.js` and include it in your HTML or JS code. **Te\_emu** doesn't do anything until instantiated, so it can be in the `<head>` or `<body>`.

## Terminology
#### Pattern of an OS command line interface:
| Prompt | Command | Subcommand | Arguments | Flags
|:--- |:--- |:--- |:--- |:--- |
| `$` | `npm` | `install` | `arg1 arg2 ... argN` | `--save-dev -v ...` |

#### Flatness
A "flat" Command has no Subcommands. For example, in `rm /path/to/file.js`, `rm` is a flat Command cause it only does one thing and therefore doesn't need Subcommands. In **Te\_emu**, flat Commands will only run their `defaultFx` Function but still accept arguments and flags.

## Usage
#### HTML
+ Create a `<div>` with a unique class or id (default `teemu-window`) to house the terminal input/output.
```html
<div id="teemu-window"></div>           <!-- or -->
<div class="teemu-window"></div>        <!-- or -->
<div id="unique-window-id"></div>       <!-- or -->
<div class="unique-window-class"></div>
```
+ Create an `<input type="text">` field with a unique class or id (default `teemu-cl`) for the user to interact with. A `<form>` element **is not required** since no submit events occur, but you can include the `<form>` element if you want to be semantic.
```html
<input type="text" id="teemu-cl">           <!-- or -->
<input type="text" class="teemu-cl">        <!-- or -->
<input type="text" class="unique-cl-id">    <!-- or -->
<input type="text" class="unique-cl-class">
```

#### JS
+ Instantiate a `new Te_emu` Object.
```javascript
var te_emu = new Te_emu({options: 'see table below'});
```
| Options   | Req?  | Default   | Description   |
|:--- |:--- |:--- |:--- |
| commandLine | N | `[".teemu-cl", "#teemu-cl"]` | {Array} of classes and ids of elements **Te\_emu** will watch for input |
| outputEl | N | `"code"` | HTML tag to wrap output |
| windows | N | `[".teemu-window", "#teemu-window"]` | {Array} of classes and ids of elements **Te_emu** will output to |
| prompt | N | `"$"` | {String} or character used to denote user input |

+ Add a new `Command` Object. Set `force` to `true` if it is acceptable to overwrite a Command with the same `key`.
```javascript
te_emu.addCommand({options: 'see table below'}, force = false);
```
| Options   | Req?  | Default   | Description   |
|:--- |:--- |:--- |:--- |
| key | Y |  | {String} keyword to reference Command (case sensitive)
| defaultFx | N | `Function()` | {Function} ran if user-specified Subcommand isn't found or if Command is "flat". By default, the Function outputs attached Subcommands. See [Templates](https://github.com/w74/te_emu) below. |
| flat | N | `false` | {Boolean} determines if a Command is "flat" |

+ Add a new Subcommand. Set `force` to `true` if it is acceptable to overwrite a Subcommand with the same `key`.
```javascript
te_emu.cmd('subcommand').addSub({options: 'see table below'}, force = false)
```
| Options   | Req?  | Default   | Description   |
|:--- |:--- |:--- |:--- |
| key | Y |  | {String} keyword to reference Subcommand (case sensitive)
| fx | Y |  | {Function} Declaration: `function([Array of Arguments], [Array of Flags]){}`. See [Templates](https://github.com/w74/te_emu) below. |
| format | N | `undefined` | **recommended**; {String} to show how the Subcommand should be called. Ex. `"npm install <git:// url> flag"`` |
| flags | N | `undefined` | {Object} which describes a flag and its description. Ex. `{"-v": "shows version number"}` |

#### Notes
1. Pretty much everything is cAsE-sEnSiTiVe.
2. You can be creative with arguments' syntax, such as `input:output`, but **Te\_emu** doesn't handle those and will pass the argument as `[..., "input:output", ...]`.
3. Flags must begin with either `-` or `--`, be at least one alphanumeric character long, and can't contain hyphens.
4. The `-h` and `--help` flags are reserved and cannot be functionally set.
5. Flags cannot chain; therefore `-Chain` will be interpreted as one flag, not five.
6. `<arguments>` and `[flags]` are passed in the order presented. For example, `command arg1 --flag2 arg2 --flag1` will result in `<arguments> = [arg1, arg2]` and `[flags] = [--flag2, --flag1]`.
7. When instantiating a **Te\_emu** object, there is a `defaultCommands` object you can also pass. However, that will remove all of the "shell commands" like `clear` and `cd`.

## Recommended Practices
Certain aspects of **Te\_emu** are purposefully loosely defined so that the developer may use use things as he/she sees fit. However, some suggestions on how to best use the plugin.

1. Flat Commands should ideally do one thing, and flags should only serve to modify that basic function. Different flags shouldn't lead to totally unrelated functions, those should be delegated to subcommands.
2. Single letter flags (`-e`) should have one dash while whole word flags (`--example`) should have two dashes.
4. Subcommands names should adequately describe the function.
5. Try to use only alphanumeric characters; punctuation and symbols may lead to unintended errors.

#### PSHHH, I DO WHAT I WANT
* If you want Flags to trigger completely different functions:
    + Set the `flat` property of the Command to `false` and, during the `.addSub()` method, set the `key` to a flag. As long as the flag appears directly after the Command in the command line, it'll be interpreted as a Subcommand.
    + To create: `...addSub({'key': '-F', ...})`
    + To invoke: `command -F <arguments> [other flags]`
* You can make your flags read `--F` or `-flag` if you really wish to.

#### Templates
Here are some templates based off of the Recommended Practices.

**Adding a Command**
```javascript
myTe_emu.addCommand({
    'key': 'commandName',
    // 'defaultFx': function(){},
    // 'flat': true
});
```

**Adding a Subcommand**
```javascript
myTe_emu.cmd('commandName').addSub({
    'key': "subName",
    'format': "commandName subName <arg1 arg2> [flags]",
    'fx': function(argsArray, flagsArray){
        // 'this' references the Command Object that the Subcommand belongs to
        
        /* code to handle [argsArray] */

        // if multiple flags can be executed
        if(flagsArray.indexOf('--F1') > -1){ /* code; */ }
        if(flagsArray.indexOf('--F2') > -1){ /* code; */ }
        // ...

        // if only one flag can be executed
        switch(flagsArray[0]){
            case '--F1': /* code; */ break;
            case '--F2': /* code; */ break;
            // ...
        }
    },
    'flags': {
        "--F1": "I am flag #1",
        "--F2": "I am flag #2"
        // ...
    }
});
```

## Contributing
Clone the repo onto local machine, open location in terminal, and run `npm up` to install all dev dependencies.

Any help adding new features, doing code tune-ups, or fixing errors is greatly appreciated. I am reachable via [wolfram.rong@gmail.com](mailto:wolfram.rong@gmail.com) for collaboration.

#### What's Next?
Some additional stuff I want to implement (in no particular order):

+ Simulate Directory Trees
    * Being able to `cd` and `ls` through a JSON file like a directory tree
    * Being able to `mkdir` and `rmdir` sections of said JSON file
    * Being able to `touch` and `rm` key:values of said JSON file
    * Having `prompt` keep track and display current location
    * Updating the JSON file (after implementing Sudo)
+ Sudo
    * Allowing password-protected actions
    * "Blind" password typing
+ History
    * Users can use Up and Down arrows to navigate previously typed Commands
+ Email
    * Allow user to use `email` Command to send me an email
+ Minigames
    * Maybe a text-based minigame with an AI, like nim or something simple