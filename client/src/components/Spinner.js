import React from 'react';

const Spinner = () =>{
	return (
		<div className="spinner-border" role="status" style={{color:'white', position:'relative', left:'50%', top:'50%'}}>
          <span className="sr-only" >Loading...</span>
        </div>

    );
};

export default Spinner;