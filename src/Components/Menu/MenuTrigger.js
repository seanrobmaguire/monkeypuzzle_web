import React, {Component} from 'react';
import { FaBars} from 'react-icons/fa';



class MenuTrigger extends Component {
  render(){
  	const {
  		onClick,
  		className,
  	} = this.props;
  	
	    return (
	    	<button 
                	className={className}
                	onClick={onClick}
                	type="button"
				>
        <FaBars style={{color: "#cbc5c1"}}/>
                </button>
		);
	}
}
export default MenuTrigger;
