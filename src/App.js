import React, {Component} from 'react';
import Slideout from 'slideout';

//import Components
import Menu from './Components/Menu/Menu';
import MenuTrigger from './Components/Menu/MenuTrigger';
import ResourcePane from './Components/ResourcePane/ResourceHead/ResourcePane';
import VisualisationPane from './Components/VisualisationPane/VisualisationPane';


import './App.css';


//import fuctions from SADFACE

import {update,add_resource, add_resource_metadata,download, update_resource,remove_resources_from_nodes, loadSADFace,saveSADFace, delete_resource, get_sd,import_json, export_cytoscape} from './lib/Sadface'; 



class App extends Component{
	constructor(props){
		super(props);
		this.state = {
            showResourcePane: true,
            newResource: null,
            resourcesFromJson: null,
            selectedText:'',
            cyData: null,
            jpg:'',
            png: '',
            fileName:'',
            json: '',
            current_sadface_doc:null,
            
            focused: null,
            newAtomFromText: false,
            uploadSADFACE: null,

            undo_stack:[],
            redo_stack:[],
        };


        this.toggleMenu = this.toggleMenu.bind(this);
        this.loadJSON = this.loadJSON.bind(this);
        this.fileManager = this.fileManager.bind(this);
        this.setCyData = this.setCyData.bind(this);

        //ResourcePane Functions
        this.toggleResourcePane =this.toggleResourcePane.bind(this);
        this.setNewResource =this.setNewResource.bind(this);
        this.setResourcesFromJson = this.setResourcesFromJson.bind(this);


        this.setSelectedText = this.setSelectedText.bind(this);
        this.addAtomFromText = this.addAtomFromText.bind(this);
        //Menu
        this.handleSetPng = this.handleSetPng.bind(this);
        this.handleSetJpg = this.handleSetJpg.bind(this);
        this.load_demo_argument = this.load_demo_argument.bind(this);
        this.setFileName = this.setFileName.bind(this);
        //Cytoscape
        this.clearSelection = this.clearSelection.bind(this);
        this.setCurrentSadFaceDoc = this.setCurrentSadFaceDoc.bind(this);
        this.updateLocalStorage = this.updateLocalStorage.bind(this);
        this.setFocus = this.setFocus.bind(this);
        this.setUndoStack =this.setUndoStack.bind(this);
        this.setRedoStack = this.setRedoStack.bind(this);

        this.returnSD = this.returnSD.bind(this);
    }

  
updateLocalStorage() {
    var undo_item = JSON.parse(this.state.current_sadface_doc);   
    this.setUndoStack(undo_item);
    this.setRedoStack([])
    localStorage.setItem("state", JSON.stringify(get_sd()));
    this.setCurrentSadFaceDoc(JSON.stringify(get_sd()));
    update();
}

setUndoStack(undo_item){
  this.setState({
            undo_stack: [...this.state.undo_stack, undo_item]
        }, () => console.log(this.state.undo_stack, "undoStack"));

}

setRedoStack(val){
  this.setState({
      redo_stack: val
    }, () => console.log(this.state.redo_stack,"redoStack"));

}

setCurrentSadFaceDoc(value){
    this.setState({current_sadface_doc: value}, () =>
        console.log("current sad face doc updated" ));
}



addAtomFromText(){
  console.log("addAtomFromText");
       this.setState({newAtomFromText: !this.state.newAtomFromText}, () =>
           console.log(this.state.newAtomFromText, "set newAtomFromText"));
}

//Menu function
handleSetPng(png){
    this.setState({png: png}, () =>
        console.log(this.state.png, 'PNG set'));
}

handleSetJpg(jpg){
    this.setState({jpg: jpg}, () =>
        console.log('JPG set'));
}

componentDidMount() {
    this.slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        "fx": "ease",
        "side": "right",
        "duration": 500,
        "padding": 256,
        "tolerance": 70,
    });
}

toggleMenu(){
    this.slideout.toggle();
}

fileManager(operation, filetype, tab, files) {
    /*
    Write text from tab to file or does a SADFace save operation
    */

    if ("save" === operation)    {
        let filename = '';
        // if it's a txt file
        if ("txt" === filetype) {   

            if (tab.metadata.title !== '') {
                 filename = tab.metadata.title+".txt";
            } else {
                 filename = "tab "+tab.id+"_text.txt";
            }
            let text = tab.content;
            download(filename,text);
        }
        
        // if it's a JSON file
        if ("json" === filetype) {
           let filename = this.state.fileName;
            if(filename.length === 0){ filename = "default"}
               saveSADFace(filename, filetype);
        }
    }
    
    //if it's a load operation
    if ("load" === operation) {
        // if it's a txt file
        if ("txt" === filetype) {
            
            
            let file = files[0];
            let filename = file.name;
            let reader = new FileReader();      
            reader.onload = function(e) {
                var content = reader.result;
                update_resource(tab.id, content, filename);
                let newResource = {};
                newResource.tab = tab;
                newResource.filename = filename;
                newResource.content =content;
                this.setNewResource(newResource);
            }.bind(this);
            reader.readAsText(file);
        }
        // if it's a JSON file
        if ("json" === filetype) {
           // let files = document.getElementById("loadJSON").files;
            let file = files[0];
            let reader = loadSADFace(file);
            if (reader !== null){
            reader.onload = function(e) {
                let result = reader.result;
                localStorage.setItem("state",result);
              this.loadJSON(result);
            }.bind(this);
        }
        }
    }
}

setNewResource(value){
  this.setState({newResource: value}, () =>
    console.log(this.state.newResource, 'newresource set'));
}

 loadJSON(json_value) {
      console.log(json_value);
     if(json_value != null){
     let importJSON = import_json(json_value);
      localStorage.setItem("state",JSON.stringify(get_sd()));
      this.setCurrentSadFaceDoc(JSON.stringify(get_sd()));
      this.setResourcesFromJson(importJSON.resources);
      this.setCyData(export_cytoscape(importJSON)); 
      }  
 } 

 setResourcesFromJson(value){
  this.setState({resourcesFromJson: value}, () =>
    console.log(this.state.resourcesFromJson, "resourcesFromJson set"))
 }

setSelectedText(text){
    if(text!== null && text.length > 1){
        this.setState((state) => ({
        selectedText: text,
    }), () =>
    console.log(this.state.selectedText, "setSelectedText"));

    }else{
       this.clearSelection();   
       }    
}

 setFocus(element){    
         this.setState({focused: element}, () =>
         console.log(this.state.focused, 'focus set'));
 }

clearSelection() {
    this.setState(() => ({
        selectedText: '',
    }), () => console.log(this.state.selectedText, "clear selection"));
}

// Slide In Functions
toggleResourcePane(){
    this.setState({showResourcePane: !this.state.showResourcePane})
}

 setFileName(file_name){
    this.setState({fileName: file_name}, () => 
      console.log(this.state.fileName, 'filename app'));
  }

load_demo_argument(){
   var demo_sadface_doc = "{\"analyst_email\":\"40170722@live.napier.ac.uk\",\"analyst_name\":\"Nathan Mair\",\"created\":\"2018-02-23T02:27:36\",\"edges\":[{\"id\":\"a1s1\",\"source_id\":\"a1\",\"target_id\":\"s1\"},{\"id\":\"a2s1\",\"source_id\":\"a2\",\"target_id\":\"s1\"},{\"id\":\"a3s2\",\"source_id\":\"a3\",\"target_id\":\"s2\"},{\"id\":\"s2a5\",\"source_id\":\"s2\",\"target_id\":\"a5\"},{\"id\":\"s1a4\",\"source_id\":\"s1\",\"target_id\":\"a4\"},{\"id\":\"a4s2\",\"source_id\":\"a4\",\"target_id\":\"s2\"}],\"edited\":\"2018-02-23T02:27:36\",\"id\":\"94a975db-25ae-4d25-93cc-1c07c932e2f9\",\"metadata\":{},\"nodes\":[{\"id\":\"a1\",\"metadata\":{},\"sources\":[],\"text\":\"Every person is going to die\",\"type\":\"atom\"},{\"id\":\"a2\",\"metadata\":{},\"sources\":[],\"text\":\"You are a person\",\"type\":\"atom\"},{\"id\":\"a3\",\"metadata\":{\"test\":\"test\"},\"sources\":[],\"text\":\"If you are going to die then you should treasure every moment\",\"type\":\"atom\"},{\"id\":\"a4\",\"metadata\":{},\"sources\":[],\"text\":\"You are going to die\",\"type\":\"atom\"},{\"id\":\"a5\",\"metadata\":{},\"sources\":[],\"text\":\"You should treasure every moment\",\"type\":\"atom\"},{\"id\":\"s1\",\"name\":\"Support\",\"type\":\"scheme\"},{\"id\":\"s2\",\"name\":\"Support\",\"type\":\"scheme\"}],\"resources\": []}";

    localStorage.setItem("state",demo_sadface_doc);
    this.setCyData(export_cytoscape(import_json(demo_sadface_doc)))
    //this.setState({cy_data: export_cytoscape(import_json(demo_sadface_doc))}, () =>
    //    console.log(this.state.cy_data, 'cy_data'));
}

setCyData(val){
    this.setState({cyData: val},() =>
        console.log("cydata set"));
}

returnSD(){
  let sd = get_sd();
  console.log(sd);
}



render(){

    return (
    	<div>
    	<Menu 
        //functions
        toggleResourcePane={this.toggleResourcePane}
        load_demo_argument={this.load_demo_argument}
        setFileName={this.setFileName}
        fileManager={this.fileManager}
        setUploadSADFACE={this.setUploadSADFACE}
        //state
        png={this.state.png}
        jpg={this.state.jpg}
        fileName = {this.state.fileName}
        />

        <main id="panel" className="panel">

        <div className="ui-container">
          <ResourcePane 
            //state
            showResourcePane={this.state.showResourcePane}
            newResource={this.state.newResource}
            resourcesFromJson={this.state.resourcesFromJson}
            selectedText={this.state.selectedText}
            //functions
            updateLocalStorage={this.updateLocalStorage}
            fileManager={this.fileManager}
            setFocus={this.setFocus}
            setSelectedText={this.setSelectedText}
            addAtomFromText={this.addAtomFromText}


         />
          <div className="splitter" id="splitter">
          </div>

          <div className="visualisation-pane">
              <div id="navbar">
                 
                  <MenuTrigger
                    className="btn-hamburger toggle-button"
                    onClick={this.toggleMenu}
                  />
              </div>
              <VisualisationPane
                //state
                showResourcePane = {this.state.showResourcePane}
                cyData= {this.state.cyData}
                newAtomFromText = {this.state.newAtomFromText}
                selectedText = {this.state.selectedText}
                focused = {this.state.focused}
                newAtomFromText={this.state.newAtomFromText}
                current_sadface_doc = {this.state.current_sadface_doc}
                undo_stack = {this.state.undo_stack}
                redo_stack = {this.state.redo_stack}
                setRedoStack= {this.setRedoStack}
                setUndoStack = {this.setUndoStack}



                //function
                addAtomFromText={this.addAtomFromText}
                handleSetPng = {this.handleSetPng}
                handleSetJpg = {this.handleSetJpg}
                loadJSON = {this.loadJSON}
                setCurrentSadFaceDoc={this.setCurrentSadFaceDoc}
                setCyData={this.setCyData}
                updateLocalStorage={this.updateLocalStorage}
                clearSelection ={this.clearSelection}
              />
              
          </div>
      </div>
        </main>
        </div>

        );
}
}






















export default App;
