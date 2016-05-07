/************************************************
*	@name: Te_emu.js
*	@desc: A simple js library that emulates some basic features of a Linux terminal, especially from a visual aspect
*	@author: Wolfram Rong
*	@version: 1.0 (May 02, 2016)
*	@license: MPL-2.0
*	@contents:
*		I. Command Class
*			-. Constructor
*			A. Methods
*		II. Te_emu Class
*			-. Constructor
*			A. Methods
*			B. Helper Functions
*		
************************************************/

// I. Command Class
class Command{
	/**
	 *  Constructor
	 *  @param {Function} defaultFx -> fallback function, or if Command is "flat", the only executed function
	 *  @param {Boolean} flat -> if defined, the Command will be "flat" and will only run the default Function
	 */
	constructor(console, {defaultFx = function(){
		if(this.flat)
			this.console._output("Command is flat; no subcommands attached");
		else{
			this.console._output("Available Subcommands:");
			this.console._output(Object.keys(this.subs).join(', '));
		}
	}, flat = false}){
		this.default = defaultFx,
		this.flat = Boolean(flat),
		this.console = console
	}

	// A. Methods

	/**
	 * 	Function addSub
	 * 		-> adds an user-defined subcommand to the command
	 *  @param {String} key -> subcommand name
	 *  @param {Function} fx -> function to execute for subcommand
	 *  @param {String} format -> reference to call this subcommand
	 *    ex. "command subcommand <argument(s)> [flag(s)]"
	 *  @param {Object} flags -> optional flags to alter fx's behavior
	 */
	addSub({key, fx, format, flags}, force = false){
		if(this.flat){
			console.error("Command is flat");
		} else if(Command.validateSub({key, fx, format, flags})){
			if(!("subs" in this))
				this.subs = {};
			if(this.subs[key] && !force){
				console.error("Subcommand already exists");
			} else {
				this.subs[key] = {
					'fx': fx,
					'format': format,
					'flags': flags,
					'help': function(){
						let outArr = [];
						if(format)
							outArr.push("Command syntax:", format, "-".repeat(24));
						outArr.push("Available flags:");
						for(let f in flags)
							outArr.push(f + " ".repeat(24 - f.length) + flags[f]);
						this.console._output(outArr);
					}
				};
			}
		}
	}

	/**
	 *  Function _invoke
	 *  	-> calls an subcommand and passes variables to it
	 *  @param {String} key -> subcommand to be called
	 *  @param {Array} args -> arguments, Array is in order of user submission
	 *  @param {{Array} flags -> flags, Array is in order of user submission
	 */
	_invoke({key, args, flags}){
		if(key && this.subs[key]){
			if(flags.indexOf("-h") > -1 || flags.indexOf("--help") > -1){
				this.subs[key].help.call(this);
			} else {
				this.subs[key].fx.call(this, args, flags);	
			}
		} else {
			this.default.call(this, args, flags);
		}
	}

	/**
	 *  Static Function validate
	 *  	-> validates parameters to be of appropriate type and/or value
	 *  @return {Boolean} -> true if no errors, false otherwise
	 */
	static validate({key, defaultFx}){
		if(typeof key !== "string"){
			console.error("Invalid: key not of type String");
		} else if(typeof defaultFx !== "undefined" && typeof defaultFx !== "function") {
			console.error("Invalid: defaultFx not a Function");
		} else {
			return true;
		}
		return false;
	}

	/**
	 *  Function validateOp
	 *  	-> validates arguments to be added to a new Subcommand
	 *  @param {String} key -> subcommand name
	 *  @param {Function} fx -> function to execute for subcommand
	 *  @param {String} format -> reference to call this subcommand
	 *    ex. "command subcommand <argument(s)> [flag(s)]"
	 *  @param {Object} flags -> optional flags to alter fx's behavior
	 *  @return {Boolean} -> returns true if valid, false otherwise
	 */
	static validateSub({key, fx, format, flags}){
		if(typeof key !== "string"){
			console.error("Invalid: key not of type String");
		} else if(!(fx instanceof Function)){
			console.error("Invalid: fx not a Function");
		} else if(flags && (flags instanceof Object) && !(flags instanceof Array)){
			for(let f in flags){
				if(!/^-{1,2}[a-zA-Z0-9]+/.test(f)){
					console.error("flags must start with - or -- and be at least one alphanumeric character long");
					return false;
				}
				if(/^-h$|^--help$/.test(f)){
					console.error("-h and --help are reserved");
					return false;
				}
			}
			return true;
		} else {
			return true;
		}
		return false;
	}
} // End of Command class

const TE_EMU_DEFAULTS = {
	commandLine: [".teemu-cl", "#teemu-cl"],
	outputEl: "code", 
	windows: [".teemu-window", "#teemu-window"],
	prompt: "$",
	defaultCommands: {
		clear: new Command(this, {
			defaultFx: () => {this.clear();},
			flat: true
		})
	}
}; // End of const

// II. Te_emu Class
class Te_emu{
	/**
	 *  Constructor
	 *  @param {Object} opts -> settings to overwrite default settings
	 */
	constructor(opts = {}){
		this.options = Te_emu.extend(TE_EMU_DEFAULTS, opts);
		this.commands = this.options.defaultCommands;

		// Add event listeners for all commandLines
		let cl = document.querySelectorAll(this.options.commandLine.join());
		let self = this;
		for(let i = 0; i < cl.length; i++){
			cl[i].addEventListener('keypress', function(e){
				if(e.which === 13){
					self._output(self.options.prompt + " " + this.value);
					self._parse(this.value);
					this.value = "";
				}
			});
		}
	}

	// A. Methods
	
	/**
	 *  Getter cmd -> get a Command
	 *  @param {String} 'key' -> keyword of Command to get
	 *  @return {Object} -> Command if found, false otherwise
	 */
	cmd(key){
		return (Boolean(this.commands[key]) ? this.commands[key] : false);
	}

	/**
	 *  Function addCommand
	 *  	-> adds a new callable command to the terminal
	 *  @param {Object} obj -> object required to construct new Command
	 */
	addCommand(obj, force = false){
		// validates obj type of Object
		if(!(obj instanceof Object) || (obj instanceof Array)){
			console.error("addCommand: type Object expected; type " + typeof obj + " received");
		} else {
			if(this.commands[obj.key] && !force){
				console.error("Command already exists");
			} else if(Command.validate(obj)){
				this.commands[obj.key] = new Command(this, obj);
			}
		}
	}

	/**
	 *  Function _parse
	 *  	-> takes user inputted string and prepares it for invokation by Command Object
	 *  @param  {String} str -> user input
	 */
	_parse(str){
		let s = str.split(" ");
		var c = s.shift();
		// check if command exists
		if(!this.commands[c]){
			this._output(c + ": command not found");
			return;
		}
		if(!this.commands[c].flat){
			var o = s.shift();
		}
		// separate arguments and flags
		let f = [], a = [];
		for(let i = 0; i < s.length; i++){
			if(/^-{1,2}/.test(s[i])){
				f.push(s[i]);
			} else {
				a.push(s[i]);
			}
		}
		// send data to Command Object and let it invoke appropriate response
		this.commands[c]._invoke({
			key: o,
			flags: f,
			args: a
		});
	}

	/**
	 *	Function _output
	 * 		-> displays text to all windows as new DOM elements
	 *  @param {String|Array} str -> message(s) to be displayed; allows HTML tags and entities
	 */
	_output(str){
		if(typeof str === "string"){
			var str = [str];
		}
		let win = document.querySelectorAll(this.options.windows.join());

		for(let i = 0; i < str.length; i++){
			let newElement = document.createElement(this.options.outputEl);
			let newOutput = document.createTextNode(str[i]);
			newElement.appendChild(newOutput);

			for(let j = 0; j < win.length; j++){
				win[j].insertAdjacentHTML('beforeend', newElement.outerHTML);
			}
		}
	}

	// B. Helper Functions

	/**
	 *  Function extend
	 *  	-> replicates functionality of $.extends() method
	 *  !important -> modifies original values of parameter {a}
	 *  @param {Object} a -> object with default values
	 *  @param {Object}} b -> object with modifier values
	 *  @return {Object} Object a with updated values from Object b
	 */
	static extend(a, b){
		for(let key in a){
			if(b.hasOwnProperty(key)){
				if((b[key] instanceof Object) && !(b[key] instanceof Array)){
					extend(a[key], b[key]);
				} else {
					a[key] = b[key];
				}
			}
		}
		return a;
	}

	/**
	 *  Function clear -> clear attached windows
	 */
	clear(){
		let win = document.querySelectorAll(this.options.windows.join());
		for(let i = 0; i < win.length; i++)
			win[i].innerHTML = "";
	}
} // End of Te_emu class