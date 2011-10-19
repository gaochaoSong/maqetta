dojo.provide("davinci.ui.ThemeSetsDialog");

dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ObjectStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

dojo.require("dojo.date.locale");
dojo.require("dojo.date.stamp");

dojo.declare("davinci.ui.ThemeSetsDialog",   null, {
    
    
    constructor : function(){
        debugger;
        this._connections = [];
        this._dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
       // var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
        this._dialog = new dijit.Dialog({
            id: "manageThemeSets",
           // title:langObj.aboutMaqetta,
            title:'Manage theme sets',
            style:"width:300px; height: 300px;",
            
        });
        dojo.connect(this._dialog, "onCancel", this, "onClose");
        dojo.create("div");
        var formHTML='<div id="manage_theme_sets_div" style="width:200px; height:300px;></div>';
        this._dialog.attr("content",formHTML);
        this._dialog.show();
        
            
        var mydata= {"identifier":"device","items":[{"theme":"iphone","device":"iPhone"},{"theme":"android","device":"Android"}]};
       // var themes= {"identifier":"name","items":[{"name":"iphone"},{"name":"android"}]};
        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        var options = ['none','default'];
        var desktopThemes = {"identifier":"name","items":[]};
        for (var i = 0; i < this._themeData.length; i++){
            if (this._themeData[i].type === 'dojox.mobile'){
                options.push(this._themeData[i].name);
            } else {
                var item = {};
                item.name = this._themeData[i].name;
                desktopThemes.items.push(item); 
            }
            
        }
        var layout = [
            [{
            'name': 'Device',
            'field': 'device',
            'width': '125px;'
        },
        {
            'name': 'Theme',
            'field': 'theme',
            'cellType': dojox.grid.cells.Select,
            'options': options,
            'editable': true ,
            'width': '125px'
        }]];
        var themeStore = this._getThemeSetsDataStore(); //new dojo.data.ItemFileWriteStore({data: themes });
        var store = new dojo.data.ItemFileWriteStore({data: mydata });
        var desktopThemeStore = new dojo.data.ItemFileWriteStore({data: desktopThemes });
        var filteringSelect = new dijit.form.ComboBox({
            id: "theme_select",
            name: "theme",
            value: "desktop_default",
            store: themeStore,
            searchAttr: "name"
        });
        
        var dtSelect = new dijit.form.FilteringSelect({
            id: "desktop_theme_select",
            name: "name",
            value: "claro",
            store: desktopThemeStore,
            searchAttr: "name"
        });

        //var div = dojo.byId('manage_theme_sets_div');

        div = dojo.create("div");
        div.innerHTML= 'Theme set name:' ;
        
        dojo.place(div, this._dialog.containerNode,'first');
        var grid = new dojox.grid.DataGrid({
            id: 'grid',
            store: store,
            structure: layout,
            style: 'width:275px; height:140px; margin-top:5px;',
            rowSelector: '20px'
        });
        
        dojo.place(filteringSelect.domNode, this._dialog.containerNode);
        dojo.style( div, 'display', 'initial');
        dojo.style( div, 'margin-right', '2px');
        
        
        div = dojo.create("div");
        div.innerHTML= 'Desktop theme:' ;
        dojo.place(div, this._dialog.containerNode);
        dojo.style( div, 'display', 'initial');
        dojo.style( div, 'margin-right', '2px');
        dojo.place(dtSelect.domNode, this._dialog.containerNode);
        
        dojo.place(grid.domNode, this._dialog.containerNode);
       
        
        div = dojo.create("div");
        div.innerHTML=  '<table style="width:100%;">'+
        '<tr><td style="text-align:right; width:80%;"><input type="button"  id="theme_select_ok_button" label="Ok"></input></td><td><input type="button"  id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
        '</table>';
        dojo.place(div, this._dialog.containerNode);
       var button = new dijit.form.Button({label:"ok", id:"theme_select_ok_button" }, theme_select_ok_button);
       this._connections.push(dojo.connect(button, "onClick", this, "onOk"));
       button = new dijit.form.Button({label:"cancel", id:"theme_select_cancel_button" }, theme_select_cancel_button);
       this._connections.push(dojo.connect(button, "onClick", this, "onClose"));
        
       // dojo.place(grid.domNode,div);
       // div.appendChild(grid.domNode);
        
      
        grid.startup();
        this._connections.push(dojo.connect(filteringSelect, "onChange", this, "onChange"));
       // this._connections.push(dojo.connect(filteringSelect, "onKeyUp", this, "onChange"));
        this._connections.push(dojo.connect(filteringSelect, "onBlur", this, "onBlur"));
        this._connections.push(dojo.connect(dtSelect, "onChange", this, "onDesktopChange"));
        this.changeThemeSetStore('desktop_default'); 
    },
    
    onChange: function(e){
       debugger; 
       this.changeThemeSetStore(e);
    },
    
    onBlur: function(e){

        var box = dijit.byId('theme_select');
        var value = box.attr("value");
        this.changeThemeSetStore(value);
        debugger;
     },
     
     onOk: function(e){
         debugger;
         this._updateThemeSetFromDataStore(this._currentThemeSet);
         davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(),this._dojoThemeSets);
         this.onClose(e);

     },
     
     onClose: function(e){
         debugger;
         while (connection = this._connections.pop()){
             dojo.disconnect(connection);
         }
         this._dialog.destroyDescendants();
         this._dialog.destroy();
         delete this._dialog;
     },
     
     onDesktopChange: function(e){
         debugger;
         if(e && e.length > 0){
             this._currentThemeSet.desktopTheme = e; 
         }
             
     },
     
     changeThemeSetStore: function(themeSet){
         
         debugger;
         var grid = dijit.byId('grid');
         this._updateThemeSetFromDataStore(this._currentThemeSet);
         var mydata= {"identifier":"device","items":[{"theme":"none","device":"Android"},{"theme":"none","device":"BlackBerry"},{"theme":"none","device":"iPad"},{"theme":"none","device":"iPhone"},{"theme":"none","device":"other"}]};  
         //var data = {"identifier":"device","items":[]};  
         this._currentThemeSet = null;
         for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
             if (this._dojoThemeSets.themeSets[i].name === themeSet){
                 debugger;
                 this._currentThemeSet = this._dojoThemeSets.themeSets[i];
                 var item = {};
                 var items = dojo.clone(this._currentThemeSet.mobileTheme);
                 mydata.items = items;
                // davinci.theme.getTheme(themeName)
             }
         }
         if (!this._currentThemeSet){ // new theme set
             var newThemeSet = {};
             newThemeSet.name = themeSet;
             newThemeSet.desktopTheme = "claro";
             newThemeSet.mobileTheme = [{"theme":"none","device":"Android"},{"theme":"none","device":"BlackBerry"},{"theme":"none","device":"iPad"},{"theme":"none","device":"iPhone"},{"theme":"none","device":"other"}];
             this._dojoThemeSets.themeSets.push(newThemeSet);
             this._currentThemeSet = newThemeSet;
         }

         var store = new dojo.data.ItemFileWriteStore({data: mydata });
        
         grid.setStore(store);
         
         
     },
     
     _updateThemeSetFromDataStore: function(themeSet){
         var grid = dijit.byId('grid');
         if (themeSet){
              var currentStore = grid.store;
           //Fetch the data.
             currentStore.fetch({
                 query: {
                     device: "*"
                 },
                 onBegin: function(e){},
                 onComplete: function(items, request){
                     debugger;
                     themeSet.mobileTheme = [];
                     for (var i = 0; i < items.length; i++) {
                         var item = items[i];
                         console.log(item.device+':'+item.theme);
                         var themeItem = {};
                         themeItem.theme = item.theme[0];
                         themeItem.device = item.device[0];
                         themeSet.mobileTheme.push(themeItem);
                     }
                 },
                 onError: function(e){debugger;},
                 queryOptions: {
                     deep: true
                 }
             });
         }
     },
     
     _getThemeSetsDataStore: function(){
         
         var themeSets= {"identifier":"name","items":[]};

         if (!this._dojoThemeSets){
             this._dojoThemeSets = davinci.theme.dojoThemeSets;
         }
         for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
             var item = {};
             item.name = this._dojoThemeSets.themeSets[i].name;
             themeSets.items.push(item);
         }
         var themeStore = new dojo.data.ItemFileWriteStore({data: themeSets });
         return themeStore;
         
     },
    
    _getTemplate: function(){
        var data='{"identifier":"name","items":[{"type":"city","name":"1"},{"type":"city","name":"2"}]}';
        var template = ''+
     //   '<span dojoType="dojo.data.ItemFileWriteStore"  jsId="jsonStore" data="'+dojo.toJson(data)+'"> </span>'+
        '<table dojoType="dojox.grid.DataGrid" jsid="grid" id="grid" store="jsonStore" query="{ name: '*' }" rowsPerPage="20" rowSelector="20px">'+
            '<thead>'+
               '<tr>'+
                    '<th field="name" width="300px">Country/Continent Name</th>'+
                    '<th field="type" width="auto" cellType="dojox.grid.cells.Select" options="country,city,continent" editable="true">Type</th>'+
               '</tr>'+
            '</thead>' +
        '</table>';
        return template;
    }
    

    

});