define(["dojo/_base/declare",
        "davinci/model/Path",
        "davinci/ve/metadata"
        
       
],function(declare, Path, mMetaData){
	
	return declare("davinci.de.DijitTemplatedGenerator", null, {
	
		value : {js:"", metadata:"", amd:['dojo/_base/declare', 'dijit/_Widget','dijit/_Templated']},
		metadata : {},
		dijitName : null,
		
		
		constructor: function(args){
			dojo.mixin(this, args);
		},
		
		buildSource: function(model, dijitName, inlineHtml){
			this.metadata = {id:dijitName, name: dijitName, spec:"1.0", version: "1.0", require:[],library:{dojo:{src:"../../../../dojo/dojo.js"}}};
			this.model = this._srcDocument =  model;
			/* no need to bother with the theme */
			//var themeMetaobject = davinci.ve.metadata.loadThemeMeta(this._srcDocument);
			var htmlPath = "./" + dijitName + ".html";
			
			if(!inlineHtml){
	        	this.value.amd.push("dojo/text!" + htmlPath.toString() );
	    		this.value.htmlPath = htmlPath;
	    	}
			
			var elements = this._srcDocument.find({'elementType' : "HTMLElement"});
		    	
			/* build the dojo.requires(...) top bits */
	        this.loadRequires("html.body", true, true,true);
	      
			for ( var i = 0; i < elements.length; i++ ) {
	            var n = elements[i];
	            var type = n.getAttribute("data-dojo-type") || n.getAttribute("dojoType") || n.getAttribute("dvwidget");
	            if (type != null){
	            	this.loadRequires(type, true, true, true);
	            }
	        }
	       
			
			this.metadata.require.push({$library:"dojo",format:"amd", src:"widgets/" + dijitName.replace(/\./g,"/"), type:"javascript-module"});
	        /* build the templated class */
	    	
	    	var html =  this._srcDocument.find({'elementType' : "HTMLElement", 'tag':'body'}, true);
	    	var bodyChildren = html.children;
	    	this.value.html = "\t\t<div>";
	    	for(var i=0;i<bodyChildren.length;i++){
	    		this.value.html += bodyChildren[i].getText();
	    	}
	    	this.value.html +="</div>";
	    	
	    	
	    	var systemModCount = 3;
	    	
	    	/* cleanup the metadata */	
	    	this.metadata.content = "<div></div>";

			/* build out the javascript file */
			this.value.js = "define([";
			for(var i=0;i<this.value.amd.length;i++){
				this.value.js+= "'" + this.value.amd[i] + "'";
				if(i+1<this.value.amd.length)
					this.value.js+=",\n";
			}
			this.value.js += "\n],function(";
			
			/*
			 * The code below will map the AMD modules into real names.
			 * Since this is only needed for the first 4 elements, then we 
			 * wont do it for everything
			 */
			
			
			for(var i=0;i<systemModCount;i++){
				var modSplit = this.value.amd[i].split("/");
				var shortName = modSplit[modSplit.length-1];
				
				this.value.js+=  shortName ;
				if(i+1<systemModCount)
					this.value.js+=",";
			}
	    	if(!inlineHtml){
				this.value.js+=",templateString";
			}
						
			
			this.value.js+="){\n\n";
			this.value.js+=" return declare('widgets."+ dijitName + "',[ _Widget, _Templated"
						
			this.value.js+="], {\n"
			this.value.js+="       widgetsInTemplate:true,\n"
			if(!inlineHtml){
				this.value.js+="       templateString:templateString"
			}else{
				this.value.js+="       templateString:'" + this.escapeHtml(this.value.html) + "'"; 
				delete this.value.html;
			}
			this.value.js+="   \n});";
			this.value.js+="\n});";
			this.value.metadata = dojo.toJson(this.metadata);
			
			return this.value;
		},
	
		escapeHtml : function(text){
			var newText = text.replace(/"/g, "\\\"");
			newText = newText.replace(/\n/g,"");
			return newText;
		},
		
		addMetaData : function(row){
			for(var i=0;i<this.metadata.require.length;i++){
				var m = this.metadata.require[i];
				if(m.$library==row.$library && m.src==row.src && m.type==row.type && m.format==row.format)
					return;
			}
			
			this.metadata.require.push(row);
		},
		
		
		loadRequires: function(type, updateSrc, doUpdateModelDojoRequires, skipDomUpdate) {
			/* this method is used heavily in RebuildPage.js, so please watch out when changing  API! */
			
			if (!type) {
				return false;
			}
			//var amdDep = type.replace(/\./g,"/");
			//this.addMetaData(amdDep);
			
			
			var requires = mMetaData.query(type, "require");
			if (!requires) {
				return true;
			}
			/* builds out the metadata object.
			 * dojo.requires(..) are added to the js file itself.  
			 * the only deps that make it to metadata are .js and .css includes
			 * 
			 */
			
			requires.every(function(r) {
				
				// If this require belongs under a library, load library file first
				// (if necessary).
				this.addMetaData(r);
				return;
				switch (r.type) {
					case "javascript":
						break;
				
					case "javascript-module":
						// currently, only support 'amd' format
						if (r.format !== 'amd') {
							console.error("Unknown javascript-module format");
						}
						if (r.src) {
							this.value.amd.push(r.src);
						} else {
							console.error("Inline 'javascript-module' not handled");
						}
						break;
					
					case "css":
						if (r.src) {
							console.log("unsupported CSS in dijit template generater");
						} else {
							console.error("Inline CSS not handled");
						}
						break;
					
					case "image":
						// Allow but ignore type=image
						break;
						
					default:
						console.error("Unhandled metadata resource type '" + r.type +
								"' for widget '" + type + "'");
					
				}
				return true;
			}, this);
			
			
		}
	});
});