define([
    "dojo/_base/array",
    "dojo/dom-style",
    "davinci/model/Path",
    "davinci/html/HTMLElement",
    "davinci/html/HTMLText",
    "davinci/html/CSSImport",
    "davinci/Theme",
    "davinci/model/Factory",
    "dojo/_base/sniff"
], function(
    array,
    domStyle,
    Path,
    HTMLElement,
    HTMLText,
    CSSImport,
    Theme,
    Factory,
    has
) {

return {
	/**
	 * Called when widgets is added or deleted.
	 * Looks at current document and decide if we need to update the document
	 * to include or exclude document.css
	 */
	widgetAddedOrDeleted: function(context, resetEverything){		
		
		// Include only if at least one dijit widget and no dojox.mobile widgets.
		function checkWidgetTypePrefix(widget, prefix){
			if(widget.type.indexOf(prefix)===0){
				return true;
			}
			var children = widget.getChildren();
			for(var j=0; j<children.length; j++){
				var retval = checkWidgetTypePrefix(children[j], prefix);
				if(retval){
					return retval;
				}
			}
			return false;
		}
		var anyDojoxMobileWidgets = false;
		var topWidgets = context.getTopWidgets();
		for(var i=0; i<topWidgets.length; i++){
			anyDojoxMobileWidgets = checkWidgetTypePrefix(topWidgets[i], 'dojox.mobile.');
			if(anyDojoxMobileWidgets){
				break;
			}
		}
		// If the current document has changed from having zero dojox.mobile widgets to at least one
		// or vice versa, then either remove or add document.css.
		var themeCssRootArr = context._themeUrl.split('/');
		themeCssRootArr.pop();
		var documentFileName= themeCssRootArr.join('/') +  '/document.css';
		if(resetEverything ||context.anyDojoxMobileWidgets !== anyDojoxMobileWidgets){
			var documentCssHeader, documentCssImport, themeCssHeader, themeCssImport;
			var header = dojo.clone( context.getHeader());
			for(var ss=0; ss<header.styleSheets.length; ss++){
				if(header.styleSheets[ss] == documentFileName){
					documentCssHeader = header.styleSheets[ss];
				}
				if(header.styleSheets[ss] == context._themeUrl){
					themeCssHeader = header.styleSheets[ss];
				}
			}
			var imports = context.model.find({elementType:'CSSImport'});
			for(var imp=0; imp<imports.length; imp++){
				if(imports[imp].url == documentFileName){
					documentCssImport = imports[imp];
				}
				if(imports[imp].url == context._themeUrl){
					themeCssImport = imports[imp];
				}
			}
			// If resetEverything flag is set, then delete all current occurrences
			// of document.css. If there are no dojoxmobile widgets, the next block
			// will add it back in.
			if(resetEverything || anyDojoxMobileWidgets){
				if(documentCssHeader){
					var idx = header.styleSheets.indexOf(documentCssHeader);
					if(idx >= 0){
						header.styleSheets.splice(idx, 1);
						context.setHeader(header);
					}
				}
				if(documentCssImport){
					var parent = documentCssImport.parent;
					parent.removeChild(documentCssImport);
					documentCssImport.close(); // removes the instance from the Factory
				}
				documentCssHeader = documentCssImport = null;
			}
			if(!anyDojoxMobileWidgets){
				if(!documentCssHeader && themeCssHeader){
					var themeCssRootArr = themeCssHeader.split('/');
					themeCssRootArr.pop();
					var documentCssFileName = themeCssRootArr.join('/') +  '/document.css';
					header = dojo.clone(header);
					header.styleSheets.splice(0, 0, documentCssFileName);
					context.setHeader(header);
				}
				if(!documentCssImport && themeCssImport){
					var themeCssRootArr = themeCssImport.url.split('/');
					themeCssRootArr.pop();
					var documentCssFileName = themeCssRootArr.join('/') +  '/document.css';
					var basePath = context.getFullResourcePath().getParentPath();
					var documentCssPath = basePath.append(documentCssFileName).toString();
					var documentCssFile = system.resource.findResource(documentCssPath);
					var parent = themeCssImport.parent;
					if(parent && documentCssFile){
						var css = new CSSImport();
						css.url = documentCssFileName;
						var args = {url:documentCssPath, includeImports: true};
						var cssFile = Factory.getModel(args); 
						css.cssFile = cssFile; 
						parent.addChild(css,0);
					}
				}
			}
			context.anyDojoxMobileWidgets = anyDojoxMobileWidgets;
		}
	}
  
};

});