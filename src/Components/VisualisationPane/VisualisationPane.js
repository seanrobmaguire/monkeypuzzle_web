import React, {Component} from 'react';
import Modal from  '../Modal/Modal';

import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import edgehandles from 'cytoscape-edgehandles';
import $ from 'jquery';
import contextMenus from 'cytoscape-context-menus';

import 'cytoscape-context-menus/cytoscape-context-menus.css';

import './VisualisationPane.css';


import {remove_falsy,update_scheme, update_atom_metadata, import_json,export_cytoscape,add_atom, sd,add_scheme, add_edge, get_atom, now, new_uuid, update_atom_text, get_sd, delete_edge, update, add_source} from '../../lib/Sadface'; 

cytoscape.use( cola );
cytoscape.use(contextMenus, $);
cytoscape.use( edgehandles );



class Cytoscape extends Component {
  constructor(props){
        super(props);
        //create Refs
        this.newAtomRef = React.createRef()
        this.newSchemeRef = React.createRef();
        this.editContentRef = React.createRef();

        this.state={
          modalValue: ' ',
          dropDownValue: ' ',

        }
        //variables
        this.cy = null;
        this.default_sadface_doc= "{\"analyst_email\":\""+this.analyst_email+"\",\"analyst_name\":\""+this.analyst_email+"\",\"created\":\""+this.created_date+"\",\"edges\":[],\"edited\":\""+this.edited_date+"\",\"id\":\""+this.document_id+"\",\"metadata\":{},\"nodes\":[],\"resources\": []}";
        this.analyst_email = "Default Analyst Email";
        this.analyst_name = "Default Analsyst Name";
        this.position = null;
        this.edit_atom=null;
        this.selected=[];
        this.redo_stack=[];
        this.undo_stack=[];
        this.running = false;
        //functions
        this.initialise_monkeypuzzle = this.initialise_monkeypuzzle.bind(this);
        this.initCytoscape = this.initCytoscape.bind(this);

        this.setModalValue = this.setModalValue.bind(this);
        this.handleModalValueChange = this.handleModalValueChange.bind(this);
        this.setDropDownValue = this.setDropDownValue.bind(this);
        this.handledropDownValue =this.handledropDownValue.bind(this);


        
        this.addScheme = this.addScheme.bind(this);
        this.editScheme = this.editScheme.bind(this);

        this.addAtom = this.addAtom.bind(this);
        this.editAtomContent = this.editAtomContent.bind(this);
        this.editAtomMetadata = this.editAtomMetadata.bind(this);
        this.deleteAtom = this.deleteAtom.bind(this);
        this.deleteNodes = this.deleteNodes.bind(this);
        this.merge_nodes = this.merge_nodes.bind(this);

        this.undo =this.undo.bind(this);
        this.redrawVisualisation = this.redrawVisualisation.bind(this);
        this.dragoverHandler = this.dragoverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);



    }

    initialise_monkeypuzzle(){
      //load diagram if there is one in localStorage
      if (localStorage.getItem("state") !== "undefined"){
//         this.props.loadJSON(localStorage.getItem("state"));
         this.initCytoscape();
      
        
        // //else use default
         } else{
           this.props.setCurrentSadFaceDoc(this.default_sadface_doc);
        //    localStorage.setItem("state", this.props.current_sadface_doc);
           this.props.setCyData(export_cytoscape(import_json(this.props.current_sadface_doc)));
            this.initCytoscape();
        }

    }

    initCytoscape(){
      this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: JSON.parse(this.props.cyData),

            style:[
                {   selector: "node", 
                    style: {
                        "label": "data(content)",
                        "text-opacity": 0.7,
                       // "width" : "auto",
                    //    "height" : "auto",
                        "text-valign": "bottom",
                        "text-halign": "right",
                        "text-outline-color": "#eee",
                        "text-outline-width": 1
                    }
                },
                
                {   selector: "[typeshape]", 
                    style: {
                        "shape":"data(typeshape)"
                    }
                },

                {   selector: "node[typeshape='diamond']", 
                    style: {
                        'background-color': '#CC9900'
                    }
                },

                {   selector: "node[typeshape='diamond'][content='Conflict']",
                    style: {
                        'background-color': 'red'
                    }
                },

                {   selector: "node[typeshape='diamond'][content='Support']",
                    style: {
                        'background-color': 'green'
                    }
                },

                {   selector: "edge", 
                    style: {
                        "line-color": "#9dbaea",
                        "target-arrow-shape": "triangle",
                        "target-arrow-color": "#9dbaea",
                        "curve-style": "bezier"
                    }
                },


                {   selector: ":selected", 
                    style: {
                        "border-width":"1",
                        "border-color":"black",
                        "background-color": "#3399CC"
                    }
                },


                {   selector: ".atom-label", 
                    style:{
                        "text-wrap": "wrap",
                        "text-max-width": 160
                    }
                },

                {   selector: ".scheme-label", 
                    style:{
                        "text-wrap": "wrap",
                        "text-max-width": 160
                    }
                },
                {   selector: '.eh-handle',
                    style: {
                        'background-color': 'orange',
                        'width': 10,
                        'height': 10,
                        'shape': 'ellipse',
                        'overlay-opacity': 0,
                        'border-width': 8, // makes the handle easier to hit
                        'border-opacity': 0,
                        'label': '',
                    }
                }
                
            ],

            boxSelectionEnabled: false,
            autounselectify: false,
            selectionType: "single",
            minZoom: 0.1,
            maxZoom: 1.5
      });//cytoscapefunction
        
   
      this.layout = this.build_cola_layout();
      this.layout.run();

      this.cy.edgehandles({
                toggleOffOnLeave: true,
                handleNodes: "node",
                handleSize: 10,
                handleColor: "#DF0085",
                handleHitThreshold: 8,
                handleLineWidth: 5,
                //handleLineType: "flat",
                edgeType: function(){ return "flat"; },
                complete: function(event, sourceNode, targetNode, addedEles){
                    if (targetNode.length !== 0) {
                        var source_id = targetNode[0].source().id();
                        var target_id = targetNode[0].target().id();

                        //get the mid point between source node and target node
                        var source_position = targetNode[0].source().position();
                        var target_position = targetNode[0].target().position();

                        this.position = {};
                        this.position.x = ((source_position.x + target_position.x)/2);
                        this.position.y = ((source_position.y + target_position.y)/2);

                        if (targetNode[0].source().data().type === "atom" && targetNode[0].target().data().type === "atom")
                        {
                            var scheme = add_scheme("Support");
                            var scheme_id = scheme.id;
                            var scheme_content = scheme.name;
                            //remove the automatically generated edge
                            targetNode.remove();
                            this.cy.add([
                                {group: "nodes", data: {id: scheme_id.toString(),
                                    content: scheme_content, typeshape: "diamond" }, classes: "scheme-label", locked: false, position: this.position}
                                    ]);
                            var edge1 = add_edge(source_id, scheme_id);
                            var edge2 = add_edge(scheme_id, target_id);
                            this.cy.add([
                              { group: "edges", data: { id: edge1.id.toString(), source: source_id, target: scheme_id } },
                              { group: "edges", data: { id: edge2.id.toString(), source: scheme_id, target: target_id } }
                              ]);
                        } else {
                            targetNode.remove();
                            var edge = add_edge(source_id, target_id);
                            this.cy.add([
                              { group: "edges", data: { id: edge.id.toString(), source: source_id, target: target_id } }
                              ]);
                        }
                        this.props.updateLocalStorage();
                    } else {
                        targetNode.remove();
                    }
                }.bind(this)
            });//edgehandles

      /*
     *
     * Set up context menus
     *
     * */
    this.cm = this.cy.contextMenus({
               menuItems: [
                    {
                        id: "edit-content",
                        content: "edit content",
                        selector: "node[type = \"atom\"]",
                        onClickFunction: function (event) {
                            let target = event.target || event.cyTarget;
                            document.getElementById("editContentTrigger").click();
                             this.setModalValue(target.data().content);
                            this.edit_atom = target;
                        }.bind(this),
                        hasTrailingDivider: false
                    },

                    {
                        id: "edit-metadata",
                        content: "edit metadata",
                        selector: "node[type = \"atom\"]",
                        onClickFunction: function (event) {
                              let target = event.target || event.cyTarget;
                              let meta = JSON.stringify(target.data().metadata);
                              document.getElementById("editMetaTrigger").click();
                              this.setModalValue(meta);
                             this.edit_atom = target;
                         }.bind(this),
                         hasTrailingDivider: true
                    },
                    {
                        id: "change-scheme",
                        content: "change scheme",
                        selector: "node[typeshape = \"diamond\"]",
                        onClickFunction: function (event) {
                            var target = event.target || event.cyTarget;
                            this.setDropDownValue(target.data().content);
                            document.getElementById("editSchemeTrigger").click();
                            this.edit_atom = target;
                        }.bind(this),
                        hasTrailingDivider: true
                    },
                    {
                        id: "remove",
                        content: "remove",
                        selector: "node, edge",
                        onClickFunction: function (event) {
                            var target = event.target || event.cyTarget;
                            if (this.selected.length !== 0) {
                                this.selected.forEach(function(node) {
                                    console.log(node, "SELECTED");
                                    this.deleteNodes(node);
                                }.bind(this));
                                this.selected = [];
                            } else {
                                if (target.data().type === "atom") {
                                    this.deleteNodes(event);
                                    target.remove();
                                } else if (target.data().typeshape === "diamond"){
                                    this.deleteNodes(event);
                                    target.remove();
                                } else {
                                    delete_edge(target.id());
                                    this.updateLocalStorage();
                                    target.remove();
                                }
                            }
                        }.bind(this),
                        hasTrailingDivider: true
                    },
                    {
                        id: "add-atom",
                        content: "add atom",
                        coreAsWell: true,

                        onClickFunction: function (event) {
                            this.position = event.renderedPosition;
                         this.setModalValue("");
                            document.getElementById("newAtomTrigger").click();
                        }.bind(this)
                    },
                    {
                        id: "add-scheme",
                        content: "add scheme",
                        coreAsWell: true,
                        onClickFunction: function (event) {

                            this.position = event.position || event.cyPosition;
                            this.setDropDownValue("Support");
                                document.getElementById("new_scheme").click();
                        }.bind(this),
                        hasTrailingDivider: true
                    },
                    {
                        id: "redraw",
                        content: "redraw",
                        coreAsWell: true,
                        onClickFunction:  (event) => this.redrawVisualisation(),
                        hasTrailingDivider: true
                    },
                    {
                        id: "undo",
                        content: "undo",
                        selector: "node, edge",
                        show: true,
                        coreAsWell: true,
                        onClickFunction:  (event) => this.undo(),
                        hasTrailingDivider: false
                    },
                    {
                        id: "redo",
                        content: "redo",
                        selector: "node, edge",
                        show: false,
                        coreAsWell: true,
                        onClickFunction: function (event) {
                          this.redo();
                          if (this.redo_stack === []) {
                            this.cm.hideMenuItem("redo");
                        }
                        }.bind(this),
                        hasTrailingDivider: true
                    },
                    {
                      id: "merge_nodes",
                      content: "merge nodes",
                      selector: "node",
                      tooltipText: "hello",
                      show: false,
                      coreAsWell: true,
                      onClickFunction:  (event) => this.merge_nodes()
                    }
                ],//menuitems
            });//close context menues
this.cy.on("layoutstart", function(){
                this.running = true;
            });

 this.cy.on("layoutstop", function(){
                this.running = false;
        
                var png = this.cy.png({ full: true });
                this.props.handleSetPng(png);

                var jpg = this.cy.jpg({ full: true });
                this.props.handleSetJpg(jpg);
            }.bind(this));
            

    }//initmonkeyPuzzle

    build_cola_layout( opts ) {
        var cola_params = {
            name: "cola",
            animate: true,
            randomize: true,
            padding: 100,
            fit: false,
            maxSimulationTime: 1500
        };
        var i = 0;
        if (opts !== undefined) {
            opts.forEach(function(opt) {
             cola_params[i] = opts[i];
             ++i;
         });
        }
        return this.cy.makeLayout( cola_params );
    }
    merge_nodes(){

    }

    setModalValue(newModalValue){
        console.log(newModalValue, "NEWModalValue")
        this.setState({modalValue: newModalValue}, () =>
         console.log(this.state.modalValue, 'modal value set'));
    }

    handleModalValueChange(e) {
        console.log(e.target.value, "E");
     this.setState({modalValue: e.target.value}, () =>
        console.log(this.state.modalValue,  "modal value set"));
}

    setDropDownValue(newDropDownValue){
    this.setState({dropDownValue: newDropDownValue}, () =>
        console.log(this.state.dropDownValue, 'modal value set'));
}

handledropDownValue(e){
    this.setState({dropDownValue: e.target.value}, () =>
    console.log(this.state.dropDownValue, 'dropdown value'));
}
    addAtom(content=null) {
        console.log(this.state.modalValue, "modal value");
    if(content === null){
        content = this.state.modalValue;
    }
    if(content === ""){
        content = "New Atom";
    }
    var meta = {"hello":"world"};
    var new_atom = add_atom(content);
    var atom_id = new_atom.id;
    if (this.props.focused != null) {
        add_source(atom_id, this.props.focused.id, content, 0, 0);
    }
    if (this.position == null) {
        this.position = {"x": this.cy.width()/2, "y": this.cy.height()/2};
    }
    this.cy.add([
        {group: "nodes", data: {id: atom_id.toString(),
            content: content, type: "atom", typeshape: "roundrectangle", metadata: meta }, 
            classes: "atom-label", locked: false, renderedPosition: this.position}
    ]);

    let node = this.cy.getElementById(atom_id.toString() );

    this.position = null;
    this.props.updateLocalStorage();

}

 addScheme() {
    let scheme = this.state.dropDownValue;
    var new_scheme = add_scheme(scheme);
    var scheme_id = new_scheme.id;

    this.cy.add([
        {group: "nodes", data: {id: scheme_id.toString(),
            content: scheme, type: "scheme", typeshape: "diamond" }, classes: "scheme-label", locked: false, position: this.position}
    ]);
    this.props.updateLocalStorage();
}

editScheme(){
    let content = this.state.dropDownValue;
    let scheme = this.cy.$("#"+this.edit_atom.id());
    update_scheme(this.edit_atom.id(), content);
    this.props.updateLocalStorage();
    scheme.data("content", content);
    this.edit_atom = null;

}
editAtomContent() {
    let editContent = this.state.modalValue;
    let atom = this.cy.$("#"+this.edit_atom.id());
    update_atom_text(this.edit_atom.id(), editContent);
    this.props.updateLocalStorage();
    atom.data("content", editContent);
    this.edit_atom = null;
}

editAtomMetadata() {
  let atom = this.cy.$("#"+this.edit_atom.id());
  let content = this.state.modalValue;
  if(JSON.parse(content)){
    let metadata = JSON.parse(content);
    update_atom_metadata(atom.id(), metadata);
    this.props.updateLocalStorage();
    this.edit_atom=null;
  }else {
        alert("Metadata not in JSON format, unable to update");
    }
             
}
deleteAtom(atom_id) {
    /*
    Remove the atom from the sadface document identified by the
    supplied atom ID
    */
    console.log(atom_id, "AtomID");
    if (atom_id) {
        var atom = get_atom(atom_id);
        console.log(atom, "ATOM");
        if (atom !== null && atom !== undefined) {
            var size = Object.keys(sd.nodes).length;
            for (var i = 0; i < size; ++i) {
                if (sd.nodes[i].id === atom.id) {
                    delete sd.nodes[i];
                   sd.nodes = remove_falsy(sd.nodes);
                        return;
                }
            }
        }
    }
}

deleteNodes(event) {
    var target = event.target || event.cyTarget;
    var id = target.id();
    let removed = target.remove();
    this.deleteAtom(id);
    var i = 0;
    var sds = get_sd();
    var edges = sds.edges;
    edges.forEach(function(edge) {
        if (edges[i] !== undefined) {
            if (edges[i].source_id === id || edges[i].target_id === id) {
                delete_edge(edges[i].id);
            }
            ++i;
        }
    });
    this.props.updateLocalStorage();
}

undo() {
    // if(this.props.undo_stack.length != 0){
    //     let redo_item = get_sd();
    //     this.props.setRedoStack(redo_item);
    //     let state = this.props.undo_stack[this.props.undo_stack.length - 1];
    //     console.log(this.props.undo_stack, "state");
    //     this.props.loadJSON(JSON.stringify(state));

    // }

        }

   




redrawVisualisation() {
    this.layout.stop();
    this.layout.options.eles = this.cy.elements();
    this.layout.run();
    this.cy.center();
    this.cy.resize();
}

dragoverHandler(ev) {
    console.log("dragoverHandler");
     ev.preventDefault();
     ev.dataTransfer.dropEffect = "move";
}

dropHandler(ev) {
    ev.preventDefault();
    this.position = {x: ev.clientX-300, y: ev.clientY};
 
    if(this.props.selectedText !== null || this.props.selectedText != undefined){
        this.addAtom(this.props.selectedText);
        this.props.clearSelection();
    }
    else { console.log("Not a valid text selection."); }
}

    componentDidMount(){
       this.initialise_monkeypuzzle();
       }

    static getDerivedStateFromProps(nextProps, prevState) {
          if(nextProps.cyData !== prevState.cyData){
              return{cyData: nextProps.cyData};
              this.initialise_monkeypuzzle();
          }
         else return null;
         if(nextProps.newAtomFromText !== prevState.newAtomFromText){
            return{newAtomFromText: nextProps.cyData};
         }else return null;
      }
    componentDidUpdate(prevProps, prevState) {
      if(prevProps.cyData!==this.props.cyData){
        //Perform some operation here
        this.initialise_monkeypuzzle();
      }
      if(this.props.newAtomFromText === true){
        console.log("new atom from text");
        this.addAtom(this.props.selectedText);
        this.props.addAtomFromText();
        this.props.clearSelection();
      }
      if(prevProps.showResourcePane !== this.props.showResourcePane){
        this.redrawVisualisation();
      }
    }
    render(){
        /* New Atom Modal */
        const newAtomModal = {
            trigger: {
                triggerText: 'New Atom',
                triggerId: 'newAtomTrigger'
            },
              title: 'New Atom',
              id: 'newAtomModal',
              content: <div className="modal-body">
              <p>Add some content to the new atom</p>
              <div className="form-group">
              <textarea 
                className="form-control" 
                rows="2" 
                id="new_atom_content" 
                onChange={this.handleModalValueChange}
                >
              </textarea></div></div>,
            footer: {
                buttonNo:2,
                button1: {
                  className: "btn btn-secondary",
                  value: "Close"
                },
                button2: {
                  className: 'btn btn-primary',
                  value: 'Create',
                },
            }
        };

        /* New Scheme Modal*/
        var newSchemeModal = {
            trigger: {
                triggerText: 'New Scheme',
                className: "new_scheme",
                triggerId: "new_scheme",
            },
              id:"newSchemeModal",
              title: 'New Scheme',
              content: <div className="modal-body">
              <p>Select a scheme</p>
              <select 
                className="form-control" 
                id="sel1" 
                value={this.state.dropDownValue}
                onChange={this.handledropDownValue}
                >
              <option>Support</option>
              <option>Conflict</option>
              <option>Argument from Sign</option>
              <option>Argument from an Exceptional Case</option>
              <option>Argument from Analogy</option>
              <option>Argument from Bias</option>
              <option>Argument from Cause to Effect</option>
              <option>Argument from Correlation to Causes</option>
              <option>Argument from Established Rule</option>
              <option>Argument from Evidence to a Hypothesis</option>
              <option>Argument from Falsification to a Hypothesis</option>
              <option>Argument from Example</option>
              <option>Argument from Commitment</option>
              <option>Circumstantial Argument Against the Person</option>
              <option>Argument from Popular Practice</option>
              <option>Argument from Popularity</option>
              <option>Argument from Position to Know</option>
              <option>Argument from Expert Opinion</option>
              <option>Argument from Precedent</option>
              <option>Argument from Consequences</option>
              <option>Argument from Waste</option>
              <option>Causal Slippery Slope Argument</option>
              </select>
              </div>,
            footer: {
                buttonNo: 2,
                button1: {
                  className: "btn btn-secondary",
                  value: "Close"
                },
                button2: {
                  className: "btn btn-primary",
                  value: "Create"
                }
            }
        };

        /* Edit Content Modal */
        var editContentModal = {
            trigger: {
                triggerText: 'editContentTrigger',
                className: "editContentTrigger",
                triggerId: "editContentTrigger",
            },
            id: 'editContentModal',
            title: 'Edit Atom Content',
            content: <div className="modal-body">
            <p>Edit atom content</p>
            <div className="form-group">
            <textarea 
                className="form-control" 
                rows="2" 
                id="edit_atom_content_textarea"
                ref={this.editContentRef}
                value={this.state.modalValue}
                onChange={this.handleModalValueChange}
                ></textarea>
                </div>
                </div>,
            footer: {
                buttonNo: 2,
                button1:{
                    className: "btn btn-secondary",
                    value: "Close"
                },
                button2: {
                    className: 'btn btn-primary',
                    value: 'Save',
                }
            }
        };

        /* Edit Metadata Modal  */

            var editMetaDataModal = {
                trigger:{
                    triggerText: 'Edit Meta',
                    className: 'editMeta',
                    triggerId: 'editMetaTrigger',
                },
                id: 'editMetadataModal',
                title: 'Edit Metadata',
                content: <div className="modal-body">
                <p>Edit atom content</p>
                <div className="form-group" id="edit_metadata">
                <textarea 
                    className="form-control" 
                    rows="2" 
                    id="edit_atom_content"
                    value={this.state.modalValue}
                    onChange={this.handleModalValueChange}

                    >
                </textarea>
                </div>
                </div>,
                footer: {
                    buttonNo: 2,
                    button1: {
                        className: 'btn btn-secondary',
                        value: 'Close',
                    },
                    button2: {
                        className: 'btn btn-primary',
                        value: 'Save',
                    },  
                },
            };

            /* Edit Scheme Type Modal */

                var editSchemeTypeModal = {
                  trigger:{
                    triggerText: 'Edit Scheme Type',
                    className: 'editScheme',
                    triggerId: 'editSchemeTrigger',
                  },
                  id: 'editSchemeModal',
                  title: 'Edit Scheme',
                  content: <div className="modal-body">
                  <p>Select a scheme</p>
                  <select 
                    className="form-control" 
                    id="sel2"
                    onChange={this.handledropDownValue}
                    value={this.state.dropDownValue}
                        >
                  <option>Support</option>
                  <option>Conflict</option>
                  <option>Argument from Sign</option>
                  <option>Argument from an Exceptional Case</option>
                  <option>Argument from Analogy</option>
                  <option>Argument from Bias</option>
                  <option>Argument from Cause to Effect</option>
                  <option>Argument from Correlation to Causes</option>
                  <option>Argument from Established Rule</option>
                  <option>Argument from Evidence to a Hypothesis</option>
                  <option>Argument from Falsification to a Hypothesis</option>
                  <option>Argument from Example</option>
                  <option>Argument from Commitment</option>
                  <option>Circumstantial Argument Against the Person</option>
                  <option>Argument from Popular Practice</option>
                  <option>Argument from Popularity</option>
                  <option>Argument from Position to Know</option>
                  <option>Argument from Expert Opinion</option>
                  <option>Argument from Precedent</option>
                  <option>Argument from Consequences</option>
                  <option>Argument from Waste</option>
                  <option>Causal Slippery Slope Argument</option>
                  </select>
                  </div>,
                  footer: {
                    buttonNo: 2,
                    button1: {
                      className: 'btn btn-secondary',
                      value: 'Close',
                    },
                    button2: {
                      className:'btn btn-primary',
                      value: 'Save',
                    },
                  } 
                };

      return(
        <div>
        <Modal
            modalProps={newAtomModal}
            show="none"
            onClick={this.addAtom}
        />
      <Modal
            modalProps={newSchemeModal}
            show="none"
            onClick={this.addScheme}
        />

        <Modal
            modalProps={editContentModal}
            show="none"
            onClick={this.editAtomContent}
        />

        <Modal
            modalProps={editMetaDataModal}
            show="none"
            onClick={this.editAtomMetadata}
        />

         <Modal
            modalProps={editSchemeTypeModal}
            show="none"
            onClick={this.editScheme}
        />
         <div id="cy" onDrop={this.dropHandler} onDragOver={this.dragoverHandler}>

      </div>
        </div>);

  }
}

export default Cytoscape;