import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import { FaLockOpen, FaLock, FaPuzzlePiece, FaDownload, FaUpload, FaTrashAlt} from 'react-icons/fa';



import './ResourceBody.css';



class TabBody extends Component {
    constructor(props){
        super(props);
    

        this.state = {
            readOnly: true,
        };
        //create ref

        this.toggle_edit_lock = this.toggle_edit_lock.bind(this);
        this.handleGetSelectedText = this.handleGetSelectedText.bind(this);
        this.handleFocus = this.handleFocus.bind(this);

    }

    toggle_edit_lock(){
        this.setState({readOnly: !this.state.readOnly},() =>
        console.log('content area locked'));
    }


    handleGetSelectedText(){
        if(window.getSelection().toString().length >= 1){
            let select = window.getSelection().toString();
            this.props.setSelectedText(select); 
    }else{
        console.log("noSelect");
        this.props.setSelectedText('') 
    }
}
handleFocus(e){
    this.props.setFocus(e.target.id);
}

    render() { 
        const {
            
            id,
            handleremove,
            handleFileDownload,
            style,
            clickLoad,
            contentValue,
            titleValue,
            //element references
            loadTxtRef,
            titleRef,

            handleFileUpload,
            handleChange_title,
            handleChangeContent,
            handleAddAtomFromText,

        }=this.props



        return (
            <div id={id+"_body"} className="resource_pane_tab_content" style={style}>
                <form>
                    <div className="form-group">
                        <Button 
                            type="button" 
                            className="btn btn-default" 
                            title="Remove this tab from the resource pane"
                            onClick={handleremove}
                            variant="light"
                            >
                                <FaTrashAlt  />
                            </Button>
                            <input 
                                type="file" 
                                id={"load" + id} 
                                style={{display: "none"}} 
                                accept=".txt" 
                                ref={loadTxtRef}
                                onChange= {handleFileUpload}
                            />
                            <Button 
                                type="button" 
                                id={"load" + id + "_btn"} 
                                className="btn btn-default" 
                                onClick={clickLoad}

                                title="Load a text file into this resource tab"
                                variant="light"
                            >
                                <FaUpload />
                            </Button>
                            <Button 
                                type="button" 
                                className="btn btn-default" 
                                onClick={handleFileDownload}
                                title="Save this resource tab to a text file"
                                variant="light"
                            >
                                <FaDownload />
                            </Button>
                            <Button id={"toggle_edit_lock_button " + id}
                                type="button" 
                                className="btn btn-default" 
                                title="Toggle editability of the content area" 
                                onClick={ this.toggle_edit_lock}
                                variant="light"
                            >
                                {(this.state.readOnly) ? <FaLock /> : <FaLockOpen />}
                                
                            </Button>
                            <Button 
                                type="button" 
                                className="btn btn-default" 
                                title="Add node from text selection"
                                onClick={handleAddAtomFromText}
                                variant="light"
                                disabled={(this.props.selectedText.length >= 1) ? false: true}
                            >
                            <FaPuzzlePiece />
                            </Button>
                    </div>

                    <div className="form-group">
                            <label>Title</label>
                            <textarea 
                                id={"title_"+id} 
                                type="text" 
                                rows="1" 
                                style={{resize: "none"}} 
                                className="form-control" 
                                placeholder="The name of this resource..." 
                                onChange={handleChange_title}
                                ref={titleRef}
                                value={titleValue}
                                >
                            </textarea> 
                        <label>Content</label>
                        <div id="textarea">
                            <textarea 
                                id={id} 
                                className="form-control" 
                                placeholder="Enter your source text here..." 
                                rows="20" 
                                ref={this.setTextInputRef}
                                onChange={handleChangeContent} 
                                style={{resize: "vertical", minHeight: "35px"}} 
                                readOnly={this.state.readOnly}
                                value= {contentValue}
                                onMouseUp = {this.handleGetSelectedText}
                                onFocus={this.handleFocus}
                                >
                            </textarea>
                        </div>  
                    </div> 
                </form>
            </div>
        );
    }
}   

export default TabBody;