/**
 * Epitome Dropdown v1.0
 * 
 * Authored by Fred Dessaint
 * www.freddessaint.com
 * @freddessaint
 *
 * Copyright 2017, Fred Dessaint
 * License: GNU General Public License, version 3 (GPL-3.0)
 * http://www.opensource.org/licenses/gpl-3.0.html
 */

(function(global, factory) {
	'use strict';
	if (typeof define == 'function' && define.amd) {
		// AMD
		define(['jquery'], function($) {
			$.fn.EpitomeDropdown = factory($);
		});
	}
	else {
		// Global
		var $ = global.jQuery;
		$.fn.EpitomeDropdown = factory($);
	}

})(window, function($) {

	/**
	 * EpitomeDropdown - About info.
	 *
	 * @param	Objet options - A set of options, see vars below.
	 *
	 * @var 	jQuery Object element - The target element (optional).
	 *
	 * @return	jQuery plugin.
	 */
	return function(options) {
		var settings = $.extend({
			trigger: 'click',
			dataToggleName: 'epitome-toggle',
			timeoutDelay: 250,
			openMenuSpeed: null,
			closeMenuSpeed: null,
			nodeSelector: '.menu-item',
			menuSelector: '.menu',
			openMenuHandle: null,
			closeMenuHandle: null,
			openTransitionHandle: null,
			closeTransitionHandle: null,
			eventMenuHandle: null
		}, options);

		var dropdownSettings = new Map();

		dropdownSettings.set('basic', {
			openMenuSpeed: 0,
			closeMenuSpeed: 0
		});

		dropdownSettings.set('accordion', {
			openMenuSpeed: 350,
			closeMenuSpeed: 350
		});

		dropdownSettings.set('mega', {
			openMenuSpeed: 0,
			closeMenuSpeed: 0
		});

		// if ('' == settings.eventType) {
		// 	throw new Error("No option passed to EpitomeDropdown.");
		// }

		if($(this).length > 0) {
			var plugin = this,
				elements = $(this);

			/**
			 * Get data from an attibute if it exists or a default value if not exists.
			 *
			 * @since 1.0
			 */
			var getData = function(attr, defaultValue) {
				return ((typeof attr !== typeof undefined && attr !== false) ? attr : defaultValue);
			};

			/**
			 * Description.
			 *
			 * @since 1.0
			 */
			var requestAnimFrame = (
				window.requestAnimationFrame       ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function(callback) {
					setTimeout(callback, 1000 / 60);
				}
			);

			/**
			 * Description.
			 *
			 * @since 1.0
			 */
			var guidGenerator = function() {
				var S4 = function() {
					return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
				};
				return (S4() + S4());
			};

			/**
			 * Description.
			 *
			 * @since 1.0
			 */
			var setClass = function(element, className) {
				if(!element.hasClass(className)) {
					element.addClass(className);
				}
			};

			/**
			 * Description.
			 *
			 * @since 1.0
			 */
			var setup = function() {
				elements.each(function() {
					var element = $(this),
						isMenuBasic = false,
						isMenuMega = false,
						isMenuAccordion = false;

					switch(getData(element.attr('data-epitome-dropdown'), 'basic')) {
						case 'basic':
							isMenuBasic = true;
							break;

						case 'accordion':
							isMenuAccordion = true;
							break;

						case 'mega':
							isMenuMega = true;
							break;

						default:
							isMenuBasic = true;
							break;
					}

					setClass(element, 'menu');

					element.find('li').each(function() {
						var item = $(this);
						var link = item.children('a');
						var isFirstLevel = item.closest('ul').is(element);
						var menu = item.children('ul');
						var hasSubmenu = (menu.length > 0);

						setClass(item, 'menu-item');
						setClass(link, 'menu-link');

						if(hasSubmenu) {
							var hasDropdownNode = false;

							if(isMenuMega && isFirstLevel) {
								hasDropdownNode = true;
							}
							else if(isMenuBasic || isMenuAccordion) {
								hasDropdownNode = true;
							}

							if(isFirstLevel) {
								setClass(link, 'menu-link-entry');

								if(link.children('.menu-icon').length == 0) {
									link.append(' <i class="eg eg-chevron-down menu-icon" aria-hidden="true"></i>');
								}
							}
							else {
								if(hasDropdownNode) {
									setClass(link, 'menu-link-entry');

									if(link.children('.menu-icon').length == 0) {
										if(isMenuBasic) {
											link.append(' <i class="eg eg-chevron-right menu-icon" aria-hidden="true"></i>');
										}
										else if(isMenuAccordion) {
											link.append(' <i class="eg eg-chevron-down menu-icon" aria-hidden="true"></i>');
										}
									}
								}
								else {
									setClass(link, 'menu-link-title');
								}
							}

							setClass(menu, 'menu');

							if(hasDropdownNode) {
								setClass(menu, 'menu-vertical');

								menu.attr('data-epitome-trigger',
									getData(menu.attr('data-epitome-trigger'), settings.trigger)
								);

								// menu.attr('data-epitome-toggle',
								// 	getData(menu.attr('data-epitome-toggle'), 'is-active')
								// );

								menu.hide();
							}

							menu.attr('role', 'menu');
						}

						if(!hasSubmenu) {
							if(!link.hasClass('menu-link-brand') &&
								!link.hasClass('menu-link-search') &&
								!link.hasClass('menu-link-hamburger')
							) {
								setClass(link, 'menu-link-entry');
							}
						}
					});
				});
			};

			/**
			 * Description.
			 *
			 * @since 1.0
			 */
			var init = function() {
				settings.openMenuHandle = settings.openMenuHandle || openMenu;
				settings.closeMenuHandle = settings.closeMenuHandle || closeMenu;
				settings.eventMenuHandle = settings.eventMenuHandle || eventMenu;
				settings.openTransitionHandle = settings.openTransitionHandle || openTransitionJS;
				settings.closeTransitionHandle = settings.closeTransitionHandle || closeTransitionJS;

				setup();

				elements.each(function() {
					var element = $(this),
						nodes = null,
						menuType = null,
						openMenuSpeed = 0,
						closeMenuSpeed = 0;

					switch(getData(element.attr('data-epitome-dropdown'), 'basic')) {
						case 'basic':
							menuType = 'basic';
							nodes = element.find(settings.nodeSelector);
							break;

						case 'accordion':
							menuType = 'accordion';
							nodes = element.find(settings.nodeSelector);
							break;

						case 'mega':
							menuType = 'mega';
							nodes = element.children(settings.nodeSelector);
							break;
					}

					openMenuSpeed = (
						settings.openMenuSpeed === null ?
						dropdownSettings.get(menuType).openMenuSpeed : settings.openMenuSpeed
					);
					closeMenuSpeed = (
						settings.closeMenuSpeed === null ?
						dropdownSettings.get(menuType).closeMenuSpeed : settings.closeMenuSpeed
					);

					nodes.each(function() {
						var node = $(this);

						if(node.length > 0) {
							var menu = node.children(settings.menuSelector).first();

							if(menu.length > 0) {
								/**
								 * Create a local object that contains the necessary values for each dropdown.
								 *
								 * @see Function.prototype.bind()
								 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
								 *
								 * @see Stack Overflow - How to access the correct this inside a callback?
								 * @link https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
								 *
								 * @since 1.0
								 */
								var dropdown = {
									element: element,
									timeout: null,
									node: node,
									menu: menu,
									menuType: menuType,
									trigger: getData(menu.attr('data-epitome-trigger'), settings.trigger),
									openMenuSpeed: parseInt(getData(menu.attr('data-epitome-dropdown-speed'), openMenuSpeed)),
									closeMenuSpeed: parseInt(getData(menu.attr('data-epitome-dropdown-speed'), closeMenuSpeed)),
									transitionByToggler: (
										getData(menu.attr('data-epitome-trigger'), '').length > 0 &&
										getData(menu.attr('data-epitome-toggle'), '').length > 0 ?
										true : false
									),
									isActive: node.hasClass('is-active'),
									open: function() {
										var handle = settings.openMenuHandle.bind(this);

										return handle();
									},
									close: function() {
										var handle = settings.closeMenuHandle.bind(this);

										return handle();
									},
									transition: function(action) {
										var handle = null;

										if('open' == action) {
											if(this.transitionByToggler) {
												handle = openTransitionCSS.bind(this);
											}
											else {
												handle = settings.openTransitionHandle.bind(this);
											}
										}
										else if('close' == action) {
											if(this.transitionByToggler) {
												handle = closeTransitionCSS.bind(this);
											}
											else {
												handle = settings.closeTransitionHandle.bind(this);
											}
										}

										var returnValue = null;

										if(this.transitionByToggler) {
											requestAnimFrame(handle);
										}
										else {
											returnValue = (handle != null ? handle() : null);
										}

										return returnValue;
									},
									event: function() {
										var handle = settings.eventMenuHandle.bind(this);

										handle();
									},
									init: function() {
										this.event();
									}
								};

								dropdown.init();
							}
						}
					});
				});
			};

			/**
			 * Process the initializations for open and close actions.
			 *
			 * @since 1.0
			 */
			var eventMenu = function() {
				var self = this;

				/**
				 * Description.
				 *
				 * @since 1.0
				 */
				// if(self.transitionByToggler) {
				// 	self.node.EpitomeToggle({
				// 		eventType: 'active',
				// 		dataToggleName: settings.dataNodeToggleName
				// 	});
				// }

				/**
				 * Description.
				 *
				 * @since 1.0
				 */
				if(self.transitionByToggler) {
					self.menu.EpitomeToggle({
						eventType: 'active',
						dataToggleName: settings.dataToggleName
					});
				}

				/**
				 * This click event open or close the menu. Maybe the menu was previously opened,
				 * so check if the user has clicked to close the menu.
				 *
				 * @since 1.0
				 */
				if('click' == self.trigger) {
					self.node.on('click', function(e) {
						var target = $(this);

						if(!$(e.target).closest(self.menu).length) {
							e.preventDefault();

							if(!self.open()) {
								self.close();
							}
						}
					});
				}

				/**
				 * This hover event open or close the menu. Maybe the menu was previously opened,
				 * so check if the user has clicked to close the menu.
				 *
				 * @since 1.0
				 */
				if('hover' == self.trigger) {
					self.node.off('mouseenter mouseleave').on('mouseenter', function(e) {
						clearTimeout(self.timeout);
						self.timeout = setTimeout(function() {
							self.open();
						}, settings.timeoutDelay);
					}).on('mouseleave', function() {
						clearTimeout(self.timeout);
						self.timeout = setTimeout(function() {
							self.close();
						}, settings.timeoutDelay);
					});
				}

				/**
				 * Close the menu on a click event outside the menu itself.
				 *
				 * @since 1.0
				 */
				$(document).on('click', function(e) {
					if(!$(e.target).closest(self.node).length) {
						self.close();
					}
				});

				/**
				 * Close the menu when the user hits the escape key.
				 *
				 * @since 1.0
				 */
				$(document).keyup(function(e) {
					if(27 == e.keyCode) {
						self.close();
						return false;
					}
				});
			}

			/**
			 * Open the menu if the conditions meet the needs.
			 *
			 * @since 1.0
			 */
			var openMenu = function() {
				var self = this;
				var done = false;

				if(!self.isActive) {
					self.isActive = true;
					self.node.addClass('is-active');
					self.node.attr('aria-expanded', true);
					self.menu.attr('aria-hidden', false);
					self.transition('open');
					done = true;
				}

				return done;
			};

			/**
			 * Close the menu if the conditions meet the needs.
			 *
			 * @since 1.0
			 */
			var closeMenu = function() {
				var self = this;
				var done = false;

				if(self.isActive) {
					self.isActive = false;
					self.node.removeClass('is-active');
					self.node.attr('aria-expanded', false);
					self.menu.attr('aria-hidden', true);
					self.transition('close');
					done = true;
				}

				return done;
			};

			/**
			 * Process the transition of close action through CSS toggler.
			 *
			 * @since 1.0
			 */
			var openTransitionCSS = function() {
				var self = this;

				var complete = function() {
					EpitomeToggle.trigger({
						element: self.menu,
						eventType: 'active'
					});
				};

				switch(self.menuType) {
					case 'basic':
						self.menu.show().promise().done(complete);
						break;

					case 'accordion':
						self.menu.slideDown({
							duration: self.openMenuSpeed,
							queue: false,
							complete: complete
						});
						break;

					case 'mega':
						self.menu.show().promise().done(complete);
						break;
				}
			};

			/**
			 * Process the transition of open action through CSS toggler.
			 *
			 * @since 1.0
			 */
			var closeTransitionCSS = function() {
				var self = this;

				var complete = function() {
					EpitomeToggle.trigger({
						element: self.menu,
						eventType: 'active'
					});
				};

				switch(self.menuType) {
					case 'basic':
						self.menu.css('display', 'none').promise().done(complete);
						break;

					case 'accordion':
						self.menu.slideUp({
							duration: self.closeMenuSpeed,
							queue: false,
							complete: complete
						});
						break;

					case 'mega':
						self.menu.css('display', 'none').promise().done(complete);
						break;
				}
			};

			/**
			 * Process the transition of open action through JavaScript plugin.
			 *
			 * @since 1.0
			 */
			var openTransitionJS = function() {
				var self = this;

				var complete = function() {
					if('mega' == self.menuType) {
						self.menu.children('.menu-item').css({
							opacity: 0,
							transform: 'translateY(6px)'
						});

						var ids = Array();
						self.menu.children('.menu-item').each(function () {
							ids.push($(this).get(0));
						});

						/**
						 * Process the transition of elements.
						 * Keep transitions duration at or under 300ms as users will see them frequently.
						 *
						 * @see Functional Animation In UX Design: What Makes a Good Transition? (Point 5: Quick).
						 * @link https://uxplanet.org/functional-animation-in-ux-design-what-makes-a-good-transition-d6e7b4344e5e
						 *
						 */
						anime({
							targets: ids,
							duration: 300,
							easing: 'easeOutSine',
							opacity: 1,
							translateY: 0
						});
					}
				};

				switch(self.menuType) {
					case 'basic':
						self.menu.show().promise().done(complete);
						break;

					case 'accordion':
						self.menu.slideDown({
							duration: self.openMenuSpeed,
							queue: false,
							complete: complete
						});
						break;

					case 'mega':
						self.menu.show().promise().done(complete);
						break;
				}
			};

			/**
			 * Process the transition of close action through JavaScript plugin.
			 *
			 * @since 1.0
			 */
			var closeTransitionJS = function() {
				var self = this;

				switch(self.menuType) {
					case 'basic':
						self.menu.css('display', 'none');
						break;

					case 'accordion':
						self.menu.slideUp({
							duration: self.closeMenuSpeed,
							queue: false
						});
						break;

					case 'mega':
						self.menu.css('display', 'none');
						break;
				}
			};

			init();

			return $(this);
		}
	};

});
