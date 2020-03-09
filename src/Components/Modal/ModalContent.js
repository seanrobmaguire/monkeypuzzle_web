import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
// import focusTrap from 'focus-trap';
export class ModalContent extends Component {
    constructor(props){
    super(props);
    this.state ={
      buttons: 2,
    }
   


  };
  
 renderButtons(){
  if(this.props.content.footer.buttonNo === 2){
    return(
    <div className="modal-footer">
      <button
        ref={this.props.buttonRef}
        aria-label="Close Modal"
        aria-labelledby="close-modal"
        onClick={this.props.closeModal}
        type="button"
        className={this.props.content.footer.button1.className}
      >
          {this.props.content.footer.button1.value}
      </button>
      <button
        type="button"
        className={this.props.content.footer.button2.className}
        data-dismiss="modal" 
        onClick={this.props.onClick}
        >
          {this.props.content.footer.button2.value}
        </button>
    </div>
    );
  }else{
    return (
      <div className="modal-footer">
<button
        ref={this.props.buttonRef}
        aria-label="Close Modal"
        aria-labelledby="close-modal"
        onClick={this.props.closeModal}
        type="button"
        className={this.props.content.footer.button1.class}
      >
          {this.props.content.footer.button1.value}
      </button>
      </div>
      );

  }
 }

 



  render(

    
    ) {
    return ReactDOM.createPortal(
      <FocusTrap>
        <aside
          tag="aside"
          role="dialog"
          tabIndex="-1"
          aria-modal="true"
          className="modal-cover"
          onClick={this.props.onClickOutside}
          onKeyDown={this.props.onKeyDown}
          id={this.props.id}
        >
        <div className="modal-dialog modal-lg">
          <div className="modal-content" ref={this.props.modalRef}>
           <div className="modal-header">
            <h4 className="modal-title">{this.props.content.title}</h4>
            <button
              ref={this.props.buttonRef}
              aria-label="Close Modal"
              aria-labelledby="close-modal"
              className="close"
              onClick={this.props.closeModal}
              type="button"
            >
              &times;
            </button>
           </div>
          
              {this.props.content.content}
            
            {this.renderButtons()}
            
            
              
          </div>
          </div>
        </aside>
      </FocusTrap>,
      document.body
    );
  }
}

export default ModalContent;
