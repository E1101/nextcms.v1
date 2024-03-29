/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		core
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-12
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/on",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"dojo/parser",
	"dojo/query",
	"dojox/widget/Standby",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoAspect, dojoDomAttr, dojoOn, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("core.js.controllers.InstallController", null, {
		// _id: String
		// 		The ID of DomNode showing entire the wizard
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _wizardContainer: dijit.layout.TabContainer
		//		Used to display the installation steps. Each step is a child tab
		_wizardContainer: null,
		
		// _stepPanes: Array
		//		Contains the installation steps. Each step is a ContentPane widget with a custom property named "appNotificationMessage".
		//		This property is used to show a notification when installing.
		_stepPanes: [],
		
		// _nextButton: dijit.form.Button
		//		The button that leads user to the next step of installation. At the final step, it will become the Done button
		_nextButton: null,
		
		// _standBy: dojox.widget.Standby
		//		This widget is used to block the UI when installing
		_standBy: null,

		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
			
			// Create the StandBy instance
			this._standBy = new dojox.widget.Standby({
				target: this._id,
				imageText: this._i18n.global._share.loadingAction
			});
			document.body.appendChild(this._standBy.domNode);
			this._standBy.startup();
		},
		
		/* ========== SET UI CONTROLS ======================================= */
		
		setWizardContainer: function(/*dijit.layout.TabContainer*/ wizardContainer) {
			// summary:
			//		Sets the wizard container
			this._wizardContainer = wizardContainer;
			
			// Set the title of page based on the title of selected tab
			var that = this;
			dojoAspect.before(this._wizardContainer, "selectChild", function(child) {
				document.title = child.get("title");

				// If I am at the last step, change the label of Next Button to "Done"
				if (dojoArray.indexOf(that._wizardContainer.getChildren(), child) == that._stepPanes.length - 1) {
					that._nextButton.set("label", that._i18n.install._share.doneButton);
				} else {
					that._nextButton.set("label", that._i18n.install._share.nextButton);
				}
			}, true);
			
			return this;	// core.js.controllers.InstallController
		},

		addStepPane: function(/*dojox.layout.ContentPane*/ stepPane) {
			// summary:
			//		Adds a step pane to the wizard
			this._stepPanes.push(stepPane);
			
			dojoOn(stepPane, "downloadend", function() {
				var route = stepPane.get("appRoute");
				dojoTopic.publish("/app/global/onLoadComplete/" + route);
			});
			
			return this;	// core.js.controllers.InstallController
		},
		
		setNextButton: function(/*dijit.form.Button*/ nextButton) {
			// summary:
			//		Sets the button to go to the next step
			this._nextButton = nextButton;
			
			// Handle onclick event of Next button
			var that = this;
			dojoOn(nextButton, "click", function(e) {
				// Gets selected pane
				var selectedPane = that._wizardContainer.selectedChildWidget;
				var children	 = that._wizardContainer.getChildren();
				var index		 = dojoArray.indexOf(children, selectedPane);

				// Get the first form inside the pane
				var selectedPaneId = dojoDomAttr.get(selectedPane.domNode, "id");
				var form		   = dojo.query("form:first-child", selectedPaneId)[0];
				if (form) {
					// If there is form, then the NextButton will handle the form submit
					var dijitForm = dijitRegistry.byId(dojoDomAttr.get(form, "id"));
					if (dijitForm.validate()) {
						var data	= dijitForm.get("value");
						data.format = "json";

						that._standBy.show();
						dojoTopic.publish("/app/global/installNotification", {
							message: that._stepPanes[index].appNotificationMessage
						});
						
						// Submit form
						dojoRequestXhr(that._stepPanes[index].get("href"), {
							data: data,
							handleAs: "json",
							method: "POST"
						}).then(function(data) {
							that._standBy.hide();
							
							if ("APP_RESULT_OK" == data.result) {
								if (index == that._stepPanes.length - 1) {
									// Disable the Done button to prevent user from clicking on it
									that._nextButton.set("disabled", true);
									// If I am already at the last step, then redirect me to the back-end
									window.location = data.url;
								} else {
									// Load the next step pane
									that._showNextStep(selectedPane);
								}
							}
						});
					}
				} else {
					// If there is no form, just show the next step
					that._showNextStep(selectedPane);
				}
			});
			
			return this; 	// core.js.controllers.InstallController
		},

		_showNextStep: function(/*dojox.layout.ContentPane*/ currentPane) {
			// summary:
			//		Shows the next pane of Install Wizard
			// currentPane:
			//		The current pane
			var children = this._wizardContainer.getChildren();
			var index    = dojoArray.indexOf(children, currentPane);
			switch (true) {
				case (index == this._stepPanes.length - 1):
					// Last step
					break;
				case (children.length < this._stepPanes.length):
					// Add new step
					// DOJO LESSON: Checks if the pane is already added or not.
					if (this._wizardContainer.getIndexOfChild(this._stepPanes[index + 1]) == -1) {
						this._wizardContainer.addChild(this._stepPanes[index + 1]);
					}
					this._wizardContainer.selectChild(this._stepPanes[index + 1]);
					break;
				default:
					this._wizardContainer.forward();
					break;
			}
		},
		
		init: function() {
			// summary:
			//		Inits the controller after setting all UI controls
			
			// Add first step of installation to container
			this._wizardContainer.addChild(this._stepPanes[0]);
		}
	});
});
