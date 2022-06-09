const { select, insert, update,  deleteReg } = require('./js/querys.min.js')

document.addEventListener('DOMContentLoaded', initalize);

function initalize() {
	comprobarTablas()
	.then(function(){
		select('t1',{})
		.then(function(respObj){
			console.log(respObj)
		})
		.catch(function(msj){
			console.error(msj)
		})
	})

};
