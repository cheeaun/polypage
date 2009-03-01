/*
 * PolyPage 0.6 - for Mootools
 *
 * Copyright (c) 2007 New Bamboo (new-bamboo.co.uk)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * For help please open the index.moo.html file in your web browser.
 *
 * Developed by Andy Kent & Natalie Downe 
 *
 */
 
var PolyPage = new Class({

	Implements: Options,
	
	options: {
		prefix: 'pp',
		separator: '_',
		label: 'Page States:'
	},
	
	initialize: function(defaults, options, elems){
		this.setOptions(options);
		this.states = null;
		this.findStates();
		this.buildOptionsBar(elems || document.body);
		this.setStartValues(defaults);
		this.refresh();
	},
		
	separated: function(val){
		return this.options.separator + val + this.options.separator;
	},
	
	setStartValues: function(initValues){
		var self = this;
		
		if (initValues){
			initValues.each(function(value){
				self.setState(value, true);
			});
		};
		var hashValues = window.location.hash.replace(/^#/,'').split(new RegExp(this.separated('and')));
		hashValues.each(function(value){
			self.setState(value, true);
		});
	},

	findStates: function(){
		var el = this.findAll();
		var self = this;
		this.states = {};
		el.each(function(elem){
			var s = self.extractDataFromClassName(elem.get('class'));
			var states = s.split(new RegExp(self.separated('?not') + '|' + self.separated('or') + '|' + self.separated('and')));
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
		for (var i in classes){
			var matcher = new RegExp('^' + this.options.prefix + this.options.separator);
			if (matcher.test(classes[i])) return classes[i].replace(matcher, '');
		}
		return '';
	},
	
	findAll: function(){
		return $$("[class*='" + this.options.prefix + this.options.separator + "']");
	},
	
	pageHasPPElements: function(){
		return this.findAll().length > 0;
	},
	
	refresh: function(){
		var self = this;
		this.findAll().each(function(elem){
			self.evaluateNode(elem);
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
			.replace(new RegExp(this.separated('and'), 'gi'), ' && ')
			.replace(new RegExp(this.separated('or'), 'gi'), ' || ')
			.replace(new RegExp(this.separated('?not'), 'gi'), ' !')
			.replace(/([a-z_0-9\-]+)/gi, "this.states['$1']");
		return eval(str);
	},
	
	setState: function(state, val){
		var pp_state_switch = $('pp_state_switch_'+state);
		if (val){
			this.states[state] = true;
			if (pp_state_switch) pp_state_switch.addClass('active');
		} else {
			this.states[state] = false;
			if (pp_state_switch) pp_state_switch.removeClass('active');
		}

		// if the state needs to be set regardless of if it has been set already 
		// then the setState function is not the way to do it as it will toggle the state
		this.setCookie(state, val);
		this.refresh();
	},
	
	setCookie: function(state, val){
		if (!Cookie) return;
		if (!state.length) return;
		var cookiePath = {path: '/'};
		(val) ? Cookie.write(state, 'yes', cookiePath) : Cookie.dispose(state, cookiePath);
	},
	
	alphabeticalStateNames: function(){
		var ret = [];
		for (var state in this.states) ret.push(state);
		return ret.sort();
	},
	
	buildOptionsBar: function(elems){
		if (!this.pageHasPPElements()) return;
		var self = this;
		var pp_options = new Element('div', {
			id: 'pp_options',
			html: '<p>' + this.options.label + '</p><ul></ul>'
		}).inject(elems);
		
		var alphaStates = this.alphabeticalStateNames();
		
		var html = '';
		alphaStates.each(function(state){
			html += '<li><a href="#' + state + '" id="pp_state_switch_' + state + '">' + state.replace(self.options.separator, ' ') + '</a></li>';
		});
		pp_options.getElement('ul').set('html', html);
		
		alphaStates.each(function(state){
			var stateSwitch = $('pp_state_switch_' + state);
			
			if (Cookie && Cookie.read(state)){
				self.states[state] = true;
				stateSwitch.toggleClass('active');
				self.refresh();
			};
			
			stateSwitch.addEvent('click', function(e){
				e.stop();
				var state = this.get('id').replace('pp_state_switch_', '');
				self.setState(state, !self.states[state]);
			});
		});
	}

});
