// show vconsole
var showVconsole = localStorage.getItem('showvconsole');
if( showVconsole === 'true' ){
	var vConsole = new VConsole();
}
	
window.onload = function(){
	
	//require file Prevent cache
	function loadFileToPage(arr){
		var fileHead = document.getElementsByTagName("head")[0];
	
		if(arr) {
			for(var i=0;i<arr.length;i++){
				var endStr = arr[i].slice(-3);
				var randomCode = "?v=" + parseInt(Math.random()*100000000000);
				if(endStr === '.js') {
					var sc = document.createElement("script");
					sc.type = "text/javascript";
					sc.src = arr[i] + randomCode;
					fileHead.appendChild(sc);
				} else if(endStr === 'css') {
					var lc = document.createElement("link");
					lc.type = 'text/css';
					lc.rel = 'stylesheet';
					lc.href = arr[i] + randomCode;
					fileHead.appendChild(lc);
				}else{
					console.log(arr[i] + "出错");
				}
			}
		}
	}
	
	var fileArr = ["./js/update.js","./js/lib/common.js"];
	loadFileToPage(fileArr);

	
	//设置更新弹框
	var updatebody = document.getElementsByTagName('body')[0]; 
	var updateNode = document.createElement('div'); 
	updateNode.setAttribute("id", "updateModalContain");
	updatebody.appendChild(updateNode);
	var updateModalObj = document.getElementById('updateModalContain');
	updateModalObj.innerHTML = '<div class="update-modal-fixed" id="updateModal"><div class="update-modal-contain">'+
								'<div class="update-modal"><div class="update-modal-head"><span id="updateModalTitle">升级提示</span></div>'+
								'<div class="update-modal-body" id="updateModalBody"></div><div class="update-modal-foot">'+
								'<button type="button" id="updateBtn">立即更新</button></div></div></div></div>';
	
}