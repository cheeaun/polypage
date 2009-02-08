/*
 * PolyPage 0.5 - for Mootools
 *
 * Copyright (c) 2007 New Bamboo (new-bamboo.co.uk)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * For help please open the index.html file in your web browser.
 *
 * Developed by Andy Kent & Natalie Downe 
 *
 */
 
var PolyPage = new Class({
	
	initialize: function(defaults){
		this.states = null;
		this.assignDisplayStyles();
		this.buildOptionsBar();
		this.setStartValues(defaults);
		this.refresh();
	},
	
	setStartValues: function(initValues){
		var self = this;
		
		if (initValues){
			initValues.each(function(value){
				if (Cookie){
					if (!Cookie.read(value)){
						// only set the initial value if it isnt already set 
						// otherwise setState will toggle off
						self.setState(value, true);
					} 
				}
				else{
					// if cookies are not being used set as usual
					self.setState(value, true);
				}
			});
		};
		var hashValues = window.location.hash.replace(/^#/,'').split(/_and_/);
		hashValues.each(function(value){
			// if it is on, turn it off 
			var val = (self.states[value]) ? false : true;
			// if it has been set elsewhere then the cookie also will be toggled
			self.setState(value,val);
		});
	},

	findStates: function(){
		var el = this.findAll();
		var self = this;
		this.states = {};
		el.each(function(elem){
			var s = self.extractDataFromClassName(elem.get('class'));
			var states = s.split(/_?not_|_or_|_and_/);
			states.each(function(state){
				if (self.states[state] == undefined && state != '' ){
					if (Cookie){
						// the state may be undefined but if the state has been set on another page 
						// we need to reset that state in our array to be on
						self.states[state] = !!Cookie.read(state);
					} else {
						// if we are not using cookies if its not in our aray we dont know about it
						self.states[state] = false;
					}
				}
			});
		});
		return this.states;
	},

	extractDataFromClassName: function(className){
		var classes = className.split(' ');
		for (var i=0, length=classes.length; i<length; i++)
			if (classes[i].match(/^pp_/)) return classes[i].replace(/^pp_/,'');
		return '';
	},

	findAll: function(){
		return $$("[class*='pp_']");
	},

	refresh: function(){
		var self = this;
		this.findAll().each(function(elem){
			self.evaluateNode(elem);
		});
	},

	assignDisplayStyles: function(){
		this.findAll().each(function(elem){
			elem.setStyle('display', elem.getStyle('display'));
		});
	},

	evaluateNode: function(node){
		// a node is an element with the pp_ class
		var on = this.evaluate(this.extractDataFromClassName(node.get('class')));
		// toggle on or off if to be displayed
		$(node).setStyle('display', (on) ? '' : 'none');
		return on;
	},

	evaluate: function(input){
		var str = input
		.replace(/^pp_/gi,'')
		.replace(/_and_/gi,' && ')
		.replace(/_or_/gi,' || ')
		.replace(/_?not_/gi,' !')
		.replace(/([a-z_0-9]+)/gi,"this.states['$1']");
		return eval(str);
	},

	setState: function(state,val){
		this.states[state] = val ? true : false;
		var pp_state_switch = $('pp_state_switch_'+state);
		if (pp_state_switch) pp_state_switch.toggleClass('active');

		// if the state needs to be set regardless of if it has been set already 
		// then the setState function is not the way to do it as it will toggle the state
		this.toggleCookie(state);
		this.refresh();
	},

	toggleCookie: function(state){
		if (Cookie && (state != '')){ 
			if (!Cookie.read(state)){
				// cookie never been set, set the cookie
				Cookie.write(state, 'yes', {"path":"/"});
			} else {
				// destroy the cookie
				Cookie.dispose(state, {"path":"/"});
			}
		}
	},
	
	alphabeticalStateNames: function(){
		var ret = [];
		for(var state in this.states) ret.push(state);
		return ret.sort();
	},

	buildOptionsBar: function(){
		this.findStates();
		var self = this;
		var pp_options = new Element('div', {
			'id': 'pp_options',
			'html': '<ul></ul>'
		}).inject(document.body);
		
		var alphaStates = this.alphabeticalStateNames();
		
		var pp_options_ul = pp_options.getElement('ul');
		
		alphaStates.each(function(state){
			// show hide options
			pp_options_ul.innerHTML += '<li><a href="#' + state + '" id="pp_state_switch_' + state + '">' + state.replace(/_/,' ') + '</a></li>';
		});

		alphaStates.each(function(state){
			var pp_state_switch = $('pp_state_switch_' + state);
			
			if (Cookie){
				// If we are using cookies, check cookies, 
				// if there is a positive cookie set then switch the state to be on and refresh
				if (Cookie.read(state)){
					// this state should be on because there is a cookie set
					self.states[state] = true;
					pp_state_switch.toggleClass('active');
					self.refresh();
				}
			}

			// switch event
			pp_state_switch.addEvent('click', function(){
				var state = this.get('id').replace('pp_state_switch_', '');
				self.setState(state, !self.states[state]);
				return false;
			});
		});
	}

});
