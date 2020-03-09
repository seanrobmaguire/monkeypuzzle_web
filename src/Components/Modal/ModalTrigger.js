import React, { Component } from 'react';
class ModalTrigger extends Component {
  render() {
    const {
      style = {display: "block"},
    } = this.props;
    return (
      <button
        id={this.props.id}
        ref={this.props.buttonRef}
        onClick={this.props.showModal}
        className={this.props.className}
        style={{display: style}}
        title={this.props.title}
      >
        {this.props.triggerText}
      </button>
    );
  }
}

export default ModalTrigger;
