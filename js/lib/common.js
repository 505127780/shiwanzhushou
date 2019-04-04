
window.onload = function(){

	// var urlip = '116.85.19.102';//application server ip
	var urlip = '47.107.72.129';//test server ip
	// var urlip = '192.168.101.9';//test request location server ip
	localStorage.setItem('urlip',urlip);
	var url = 'http://'+ urlip +':8080/platform-web/';
	var updatetimer = null;
	
	// H5 plus事件处理
	function plusReady(){
		
		//处理屏幕只能竖向
		plus.screen.lockOrientation("portrait-primary");
		
		// 开启一直保持程序唤醒状态
		plus.device.setWakelock( true );
		
		//监听网络
		document.addEventListener("netchange", wainshow, false);
		
		function wainshow(){
			var types = {};//定义一个数组
			types[plus.networkinfo.CONNECTION_UNKNOW] = "Unknown connection";   //使用原生API，例如plus.networkinfo.CONNECTION_UNKNOW。网址：http://www.dcloud.io/docs/api/zh_cn/device.html
			types[plus.networkinfo.CONNECTION_NONE] = "None connection";
			types[plus.networkinfo.CONNECTION_ETHERNET] = "Ethernet connection"; 
			types[plus.networkinfo.CONNECTION_WIFI] = "WiFi connection";
			types[plus.networkinfo.CONNECTION_CELL2G] = "Cellular 2G connection"; 
			types[plus.networkinfo.CONNECTION_CELL3G] = "Cellular 3G connection"; 
			types[plus.networkinfo.CONNECTION_CELL4G] = "Cellular 4G connection";
		}
		//检查网络状态
		if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE){
			alert('网络不能使用，请确认网络连接');
			//set continue execute next task ,show task alert
			localStorage.setItem('execute',false);
		}
		
		// Android处理返回键
		plus.key.addEventListener('backbutton',function(){
			var backConfirm = confirm('确认返回到桌面？');
			if(backConfirm){
				// 关闭 保持程序唤醒状态
				plus.device.setWakelock( false );
				localStorage.setItem('taskstate',false);
				var exitApp = setTimeout(function(){
						plus.runtime.quit();
						clearTimeout(exitApp);
					},500);
			}
		},false);
		
		// 关闭启动界面
		plus.navigator.setStatusBarBackground('#D74B28');
		setTimeout(function(){
			plus.navigator.closeSplashscreen();
		},500);
		
		var ver = '';
		plus.runtime.getProperty(plus.runtime.appid, function (inf) {
			ver = inf.version;
			localStorage.setItem('versioncode',ver);
		});
		
		// 全局添加默认添加请求头
		$.ajaxSetup({
			headers: { 
				version:ver
			},
			error: function(jqXHR, textStatus, errorMsg){ // 出错时默认的处理函数
				if (jqXHR.status == 500) {
					 alert('服务器连接异常');
				}
				if (jqXHR.status == 404) {
					alert('无法请求数据');
				}
				if (jqXHR.status == 400) {
					alert('请求无效');
				}
			}
		});
		
	}
	
	//监听版本更新
	function listenerUpdate(url){
		var updateModalState = localStorage.getItem('updatemodalstate');
		if(updateModalState === '1'){
			clearInterval(updatetimer);
			return;
		}
		
		plus.runtime.getProperty(plus.runtime.appid, function (inf) {
			var ver = inf.version;
			$.ajax({
				url:url+"conf/update.json",
				success:function (data) {
					if ( compareVersion(ver , data.Android.version) ) {
						//弹出显示更新页面
						var updateContent = data.Android.note.split('\n');
						var updateHtml = '';
						if(updateContent.length != 0){
							for(var i=0;i<updateContent.length-1;i++){
								updateHtml += '<p>'+ updateContent[i] +'</p>';
							}
						}else{
							updateHtml = '<p>有新版本上线,请下载更新</p>';
						}
						
						$('#updateModalBody').html(updateHtml);
						$('#updateModalTitle').text(data.Android.title);
						$('#updateModal').show();
						
						localStorage.setItem('updatemodalstate',2);//set update modal prevent show
						
						clearInterval(updatetimer);

						localStorage.setItem('execute',false);//set continue execute next task ,show task alert
						
						$('#updateBtn').click(function(){
							localStorage.clear();
							
							setTimeout(function(){
								plus.runtime.openURL( data.Android.url );
								$('#updateModal').hide();
							},600);
							
						});
					}
				}
			});
		});
	}
	
	
	//compare version
	function compareVersion( ov, nv ){
		if ( !ov || !nv || ov=="" || nv=="" ){
			return false;
		}
		var b=false,
		ova = ov.split(".",4),
		nva = nv.split(".",4);
		for ( var i=0; i<ova.length&&i<nva.length; i++ ) {
			var so=ova[i],no=parseInt(so),sn=nva[i],nn=parseInt(sn);
			if ( nn>no || sn.length>so.length  ) {
				return true;
			} else if ( nn<no ) {
				return false;
			}
		}
		if ( nva.length>ova.length && 0==nv.indexOf(ov) ) {
			return true;
		}
	}
	
	if(window.plus){
		plusReady();
		var imei = plus.device.imei;
		if(!window.localStorage){
			alert("不支持localStorage");
			return false;
		}else{
			localStorage.setItem('imei',imei)
		}
	}else{
		
		document.addEventListener('plusready',plusReady,false);
		
		updatetimer = setInterval(function(){
			listenerUpdate(url);
		},5*60*1000);
		
	}
	
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
	
	

	
};

