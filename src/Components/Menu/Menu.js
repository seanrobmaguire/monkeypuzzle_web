import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from '../Modal/Modal';

//import functions from sadface
import {update_analyst_name, update_analyst_email} from '../../lib/Sadface'; 

import './Menu.css';
class Menu extends Component {
  constructor(props){
    super(props);
    this.state = {
      
    };
    //refs
    this.pngRef = React.createRef();
    this.jpgRef = React.createRef();
    this.loadJSONRef = React.createRef();


    this.mp_reset = this.mp_reset.bind(this);
    this.download_png = this.download_png.bind(this);
    this.download_jpg = this.download_jpg.bind(this);
    this.download_sadface = this.download_sadface.bind(this);
    this.handleFileName = this.handleFileName.bind(this);
    this.handleSADfaceUpload = this.handleSADfaceUpload.bind(this);
    this.SADfaceUpload = this.SADfaceUpload.bind(this);
  }

   

  mp_reset(){
    console.log("reset");
    localStorage.clear();
    window.location.reload(false);
  }
  


  handle_set_analyst_name(event){
    let analyst_name = event.target.value;

      update_analyst_name(analyst_name)
  }

  handle_set_analyst_email(event){
    let analyst_email = event.target.value;

    update_analyst_email(analyst_email);
  }


 

  download_png(){
    var fileName = this.props.fileName;
    if(fileName.length === 0) {fileName = "default"}
      fileName+=".png";
      let link = this.pngRef.current;
      link.download = fileName;
  }

  download_jpg(){
      let fileName = this.props.fileName;
      if(fileName.length === 0) {fileName = "default"}
        fileName+=".jpg"

      let link = this.jpgRef.current;
      link.download = fileName;

  }

 

  download_sadface(){
    this.props.fileManager('save', 'json', null)
  }

   handleFileName(event){
    let file_name = event.target.value;
    this.props.setFileName(file_name);
  }

  handleSADfaceUpload(){
    let loadJSON = this.loadJSONRef.current;
    loadJSON.click();
  }

  SADfaceUpload(){
    let newFile = this.loadJSONRef.current.files;
    this.props.fileManager('load','json',null,newFile);

  }

  render() {
    /*Reset Confirmation Modal */

      let resetConfirmModal = {
        trigger: {
          triggerText: 'Reset',
          title: 'Reset MonkeyPuzzle to her initial state',
          id: 'clear_storage_button',
          className: 'btn btn-danger',
        },
        title: 'Reset MonkeyPuzzle',
        id: "confirm_reset_modal",
        content: <div className="modal-body">
        <p>Are you sure that you want to reset MonkeyPuzzle?<br /> This will empty the current analysis and adjust all options back to their initial settings.</p>
        </div>,
        footer: {
          buttonNo: 2,
          button1: {
            className: 'btn btn-secondary',
            value: 'Cancel',
          },
          button2: {
            className: 'btn btn-danger',
            value: 'Reset',
          },
        } 
      };
    return (
            /*Slidein Panel: START*/

      <nav id="menu" className="menu">
    <a href="http://arg.napier.ac.uk/monkeypuzzle/" target="_blank" rel="noopener noreferrer">
        <header className="menu-header">
          <span className="menu-header-title">MonkeyPuzzle</span>
        </header>
    </a>

    <section className="menu-section">
        <h3 className="menu-section-title">Interface</h3>
        <ul className="menu-section-list">
          <li>
            <Button
              id="toggle_resources"
              className="btn btn-default" 
              variant="light"
              title="Toggle the visibility of the resources pane"
              children="Toggle Resource Pane"
              onClick={this.props.toggleResourcePane}

            />
          </li>
          <li> 
            <Modal 
              modalProps = {resetConfirmModal}  
              onClick = {this.mp_reset}

            />
          </li>
          <li>
           <Button
            id="load_demo_argument_button"
            className="btn btn-default" 
            variant="light"
            title="Load a demonstration SADFace document into MonkeyPuzzle"
            children="Load Demo"
            onClick={this.props.load_demo_argument}

          />
          </li>
          <li>
              <textarea 
                id="analyst_name_textarea" 
                type="text" rows="1" 
                cols="20" 
                maxLength="40" style={{resize: "none"}} 
                className="form-control"  
                placeholder="Name" 
                title="Type your name here..." 
                onChange={this.handle_set_analyst_name}
              >
              </textarea>
          </li>
          <li>
              <textarea 
                id="analyst_email_textarea" 
                type="text" 
                rows="1" 
                cols="20" 
                maxLength="40" 
                style={{resize: "none"}} 
                className="form-control"  
                placeholder="Email" 
                title="Type your email address here..." 
                onChange={this.handle_set_analyst_email}
              >
              </textarea>
          </li>
      </ul>
    </section>


    <section className="menu-section">
        <h3 className="menu-section-title">Export</h3>
        <ul className="menu-section-list">
           <li>
              <textarea 
                id="export_filename" 
                type="text" 
                rows="1" 
                cols="20" 
                maxLength="20" 
                style={{resize: "none"}} 
                className="form-control"  
                placeholder="Filename" 
                title="The name for the exported file"
                onChange={this.handleFileName}
              >
              </textarea>
          </li>

          <li>
            <Button 
              id="export_button"
              className="btn btn-default" 
              onClick={this.download_sadface} 
              title="Export the current analysis to a SADFace formatted JSON document"
              variant="light"
            >
              SADFace
            </Button>
          </li>
          <li>
          <a href={this.props.png} 
          target="blank" 
          id="download_png"
          ref={this.pngRef}
          >
            <Button 
             // id="download_png"
              className="btn btn-default" 
              title="Export the current analysis to a PNG image" 
              onClick={this.download_png}
              variant="light"
            >
              PNG
            </Button>
            </a>
          </li>
          <li>
             <a href={this.props.jpg} 
             target="blank" 
             id="download_jpg"
             ref={this.jpgRef}
             >
            <Button 
              id="download_jpg"
              className="btn btn-default" 
              title="Export the current analysis to a JPG image" 
              onClick={this.download_jpg}
              variant="light"
            >
              JPG
            </Button>
            </a>
          </li>
      </ul>
      </section>
      
    <section className="menu-section">
        <h3 className="menu-section-title">Import</h3>
        <ul className="menu-section-list">
      <span className="upload-span">
        <a rel="ignore">
          <div style={{display: "inline-block"}}>
           <input 
            id="loadJSON" 
            style={{display: "none"}} 
            accept=".json" 
            role="button" 
            tabIndex="-1000" 
            type="file" 
            className="upload-button" 
            onChange={this.SADfaceUpload}
            ref={this.loadJSONRef}
          />
          
          <Button
            className="btn btn-default"
            onClick={this.handleSADfaceUpload}
            title="Load a SADFace formatted JSON document into MonkeyPuzzle"
            variant="light"

          >
            SADFace
          </Button>
          </div>
        </a>
      </span>
      
        </ul>
    </section>
  
    <section className="menu-section">
        <h3 className="menu-section-title">Documentation</h3>
        <ul className="menu-section-list">  
          <li>          
            <a 
              href="http://arg.napier.ac.uk/page/project/monkeypuzzle/" 
              id="a"
              >
                About MonkeyPuzzle
            </a>
          </li>
          <li>
            <a 
              href="http://arg.napier.ac.uk/page/project/monkeypuzzle/quickstart/" 
              id="a"
              >
                Quick-start
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/ARG-ENU/monkeypuzzle_web" 
              id="a"
              >
                Code Repository
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/ARG-ENU/monkeypuzzle_web/issues" 
              id="a"
            >
              Issue Tracker
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/ARG-ENU/monkeypuzzle_web/blob/master/LICENSE" 
              id="a"
            >
              Licensing
            </a>
          </li>
      </ul>
      </section>
    </nav>
    );
  }
}  // Slidein Panel: END 

export default Menu;
