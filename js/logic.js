Canvas = {
	element: null,
	context: null,
	init: function(){
		this.element = $('canvas')[0];
		this.context = this.element.getContext('2d');
	},
};

function dragOverHandler(e){
	e.originalEvent.stopPropagation();
	e.originalEvent.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = 'copy';
}

function dropHandler(e){
	e.originalEvent.stopPropagation();
	e.originalEvent.preventDefault();
	
	var files = e.originalEvent.dataTransfer.files;
	var fr = new FileReader();
	var img = new Image();
	
	fr.readAsDataURL(files[0]);
	fr.onload = function(){
		img.src = fr.result;
	}
	img.onload = function(){
		$('img#given').attr('src', fr.result);
		Canvas.element.width = this.width;
		Canvas.element.height = this.height;
		Canvas.context.drawImage(this, 0, 0);
		$('div.drop-wrapper').addClass('invisible');
		$('div.result-wrapper').removeClass('invisible');
	};
}

function crypt(){
	var msg = $('input').val();
	console.log('the message', msg);
	var d = Canvas.context.getImageData(0,0, Canvas.element.width, Canvas.element.height);
	var codes = [];
	for(var i in msg){
		codes.push(msg.charCodeAt(i));
	}
	
	for(var i = (d.data.length-1); i >= 0; i-=280){  //every 70 pixels
	/*
		//just for reference
		var r = d.data[i-3]
		var g = d.data[i-2];
		var b = d.data[i-1];
	*/
		//now it's possible to modify rgb content of every 70 pixels of the given image
		var c = codes.shift();
		if(c == undefined){
			d.data[i] = 254;   //alpha; we'll decrease the alpha value as mark of msg end
			break;
		}
		
		d.data[i-1] = c;
	}
	
	Canvas.context.putImageData(d,0,0);
	var result = Canvas.element.toDataURL();
	//result = result.replace('image/png', 'image/octet-stream');
	$('img#crypted').attr('src', result);
	$('img#crypted').ready(function(){
		$('span').removeClass('invisible');
	});

}

function decrypt(){
	var d = Canvas.context.getImageData(0,0, Canvas.element.width, Canvas.element.height);
	var msg = '';
	for(var i = (d.data.length-1); i >= 0; i-=280){
		if(d.data[i] == 254){
			break;
		}
		msg += String.fromCharCode(d.data[i-1]);
	}
	console.log('decrypted message:', msg);
	
	$('input').val(msg);
}

$(function(){
	console.log('hello');
	var available = false;
	if(window.File && window.FileReader && window.FileList && window.Blob){
		available = true;
	} else {
		alert('The File API is not fully supported in your browser, get something modern bro!');
	}
	
	if(!available){
		return;
	}
	
	Canvas.init();
	
	var dropZone = $('div.drop-zone');
	dropZone.on('dragover', dragOverHandler);
	dropZone.on('drop', dropHandler);
	
	if($('body').attr('id') == 'crypter'){
		var cryptBtn = $('#crypt');
		cryptBtn.on('click', crypt);
	} else {
		var deCryptBtn = $('#decrypt');
		deCryptBtn.on('click', decrypt);
	}
});