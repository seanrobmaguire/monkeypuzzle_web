import React, {Component} from 'react';
//Import Components
import Modal from '../../Modal/Modal';
import TabBody from '../ResourceBody/ResourceBody';
import{update_resource,remove_resources_from_nodes,delete_resource, add_resource, add_resource_metadata, get_sd} from '../../../lib/Sadface'; 
import {FaPlusSquare} from 'react-icons/fa';

import './ResourceHead.css';

class ResourcePane extends Component {
    constructor(props) {
        super(props);
        this.state={
            resourceType: 'text',
            current_tab: null,
            tabs: [],
        }
        
        this.addTab = this.addTab.bind(this);
        this.setType = this.setType.bind(this);
        this.addTabToArray = this.addTabToArray.bind(this);
        this.setActiveTab = this.setActiveTab.bind(this);
        this.remove_tab = this.remove_tab.bind(this);
        this.updateTab = this.updateTab.bind(this);
        this.loadTabs =this.loadTabs.bind(this);
    };

    addTab(){
        let newTab = {}
        
        newTab = add_resource(' ');
        add_resource_metadata(newTab.id, 'title', '');
        newTab.metadata = {title: ''}
        localStorage.setItem("state", JSON.stringify(get_sd()));
        newTab.type = this.state.resourceType;
        this.addTabToArray(newTab);   
    
    }

      setType(e){
        this.setState({resourceType: e.target.value.toLowerCase()}, () =>
            console.log(this.state.resourceType, 'type set'));
    }

     addTabToArray(newTab){
        this.setState({
            tabs: [...this.state.tabs, newTab]
        }, () => console.log(this.state.tabs, "add to arry"));
        this.setActiveTab(newTab.id);
        
    }

     setActiveTab(value){
        console.log("setActiveTabs");
        this.setState({
            current_tab: value
        }, function (){
            console.log(this.state.current_tab, 'active');
        });
    }

      remove_tab(i, tabId){
        delete_resource(tabId);
        remove_resources_from_nodes(tabId);

        localStorage.setItem("state",JSON.stringify(get_sd()));
        
        if (this.state.tabs.length >= 1 && i !== -1){
            this.setState(state =>{
                const tabs = state.tabs.filter((item, j) => i !==j);
                return {
                    tabs,
                };
            }, () => {    
            if(this.state.tabs.length >=1){
                this.setActiveTab(this.state.tabs[this.state.tabs.length-1].id);
            }
            });      
        }   
    };

        updateTab(tab_id, title, content){
            const tabs = this.state.tabs.slice();
            tabs.forEach((tab) =>{
                if(tab.id === tab_id) {
                    if(title !== null){
                        tab.metadata.title = title;
                        update_resource(tab_id, null, title);
                    }
                    if(content !== null){
                    tab.content = content;
                    update_resource(tab_id, content, null);
                }
                }
            });
            this.setState({tabs}, () =>
                console.log( "Tabs updated"));
                this.props.updateLocalStorage();
        }

        loadTabs(resources){
            if(resources.length > 0){
            console.log("loadTabs", resources);
            this.setState({tabs: resources}, () => {
                console.log(this.state.tabs, "TABS");
                this.setActiveTab(this.state.tabs[this.state.tabs.length - 1].id);
               
            }
            

                );
        }

         }

    componentDidUpdate(prevProps, prevSate) {
        if(prevProps.newResource !== this.props.newResource){
                this.updateTab(this.props.newResource.tab, null, this.props.newResource.content);
                this.updateTab(this.props.newResource.tab, this.props.newResource.filename, null);
        }
        if(prevProps.resourcesFromJson !== this.props.resourcesFromJson){
                this.loadTabs(this.props.resourcesFromJson);
            
            

        }
    }

    render() {
        let num =0;
        const newResourceModal = {
            trigger: {
                triggerText: <FaPlusSquare size={32}  color="#cbc5c1"/>,
                className: 'add_tab_button',
                triggerId: "add_tab_button",
            },
            id:"resource_pane_selection_modal",
            title: 'New Resource Pane',
            content:  <div className="modal-body">
                <p>Select a resource type</p>
                <select className="form-control" id="resource_type" onChange={this.setType}>
                <option>Text</option>
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
                    value: "Add"
                }
            }
        };


        return ( 
            <div className="resource-pane" id="resource-pane" style={{display: this.props.showResourcePane ? "block" : "none"}}> 
                <div className="resource_pane_tab_head" id="resource_pane_tab_head">
                     <Modal
                         modalProps = {newResourceModal}  
                         onClick = {this.addTab} 

                     />
                    {
                        this.state.tabs.map((item, i)=> {
                            const onSetActiveTab = () =>
                                this.setActiveTab(item.id);
                                    return(
                                        <button  
                                            key={item.id + '_btn'}
                                            onClick={onSetActiveTab} 
                                            className={this.state.current_tab === item.id ? "tablinks active" : "tablinks"}
                                            id={item.id+"_btn"}
                                        >
                                            {++num}
                                        </button>
                                    );
                        })
                    }
                </div>
                            
                        <div className="tab_body" id="tab_body">
                            {this.state.tabs.map((item,i) => {
                                if(item.type === "text"){
                                this.loadTxtRef = React.createRef();
                                

                                const handleRemove = () =>
                                    this.remove_tab(i, item.id);
                                const clickLoad =() => {        
                                    this.loadTxtRef.current.click();
                                }

                                const handleFileUpload = (e) =>{
                                    this.props.fileManager('load', 'txt', item.id, e.target.files);

                                }
                                const handleFileDownload = () =>{

                                    this.props.fileManager('save', 'txt', item);

                                }
                                const handleChangeTitle = (e) =>{
                                    var titleValue = e.target.value;
                                    this.updateTab(item.id, titleValue, null)
                                }

                                const handleChangeContent = (e) =>{
                                    var contentValue = e.target.value;
                                    this.updateTab(item.id, null, contentValue)
                                }
                                const handleAddAtomFromText = (e) =>{
                                    this.props.addAtomFromText();
                                }
                                return(
                                    <TabBody
                                        id={item.id}
                                        key={item.id + '_bdy'}
                                        i={i}
                                        style={{display: this.state.current_tab === item.id ? 'block' : 'none'}}

                                        handleremove={handleRemove}
                                        handleFileUpload={handleFileUpload}
                                        handleFileDownload={handleFileDownload}
                                        clickLoad={clickLoad}
                                        handleAddAtomFromText = {handleAddAtomFromText}
                                        selectedText={this.props.selectedText}


                                        titleValue={item.metadata.title}
                                        contentValue = {item.content}
                                    
                                        handleChange_title={handleChangeTitle}
                                        handleChangeContent={handleChangeContent}


                                        loadTxtRef={this.loadTxtRef}
                                        setSelectedText={this.props.setSelectedText}
                                        setFocus={this.props.setFocus}
                                       
                                    />
                                );
                            }
                            })}
                        </div>
            </div>
        );
    }
}
export default ResourcePane;
