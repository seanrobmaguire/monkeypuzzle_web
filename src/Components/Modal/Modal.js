import React, { Component } from 'react';
import ModalContent from './ModalContent';
import ModalTrigger from './ModalTrigger';

import './Modal.css';


export class Modal extends Component {
  constructor() {
    super();
    this.state = {
      isShown: false
    };
  }
  showModal = () => {
    this.setState({ isShown: true }, () => {
      this.closeButton.focus();
    });
    this.toggleScrollLock();
  };
  closeModal = () => {
    this.setState({ isShown: false });
    this.TriggerButton.focus();
    this.toggleScrollLock();
  };
  onKeyDown = event => {
    if (event.keyCode === 27) {
      this.closeModal();
    }
  };
  onClickOutside = event => {
    if (this.modal && this.modal.contains(event.target)) return;
    this.closeModal();
  };

  toggleScrollLock = () => {
    document.querySelector('html').classList.toggle('scroll-lock');
  };

  actionAndClose = () => {
    
    this.props.onClick();
    this.closeModal();
  };
  render() {
    
    return (
      <React.Fragment>
        <ModalTrigger
          showModal={this.showModal}
          buttonRef={n => (this.TriggerButton = n)}
          triggerText={this.props.modalProps.trigger.triggerText}
          className={this.props.modalProps.trigger.className}
          id={this.props.modalProps.trigger.triggerId}
          style={this.props.show}
          title={this.props.modalProps.trigger.title}
        />
        {this.state.isShown ? (
          <div>
          <ModalContent
            id={this.props.modalProps.id}
            modalRef={n => (this.modal = n)}
            buttonRef={n => (this.closeButton = n)}
            closeModal={this.closeModal}
            modalTitle={this.props.modalProps.modalTitle}
            content={this.props.modalProps}
            onKeyDown={this.onKeyDown}
            onClickOutside={this.onClickOutside}
            onClick={this.actionAndClose}
          />
          </div>
        ) : (
          <React.Fragment />
        )}
      </React.Fragment>
    );
  }
}

export default Modal;
