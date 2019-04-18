
	// var urlip = '116.85.19.102';//application server ip
	var urlip = '47.107.72.129';//test server ip
	// var urlip = '192.168.101.9';//test request location server ip
	localStorage.setItem('urlip',urlip);
	var url = 'http://'+ urlip +':8080/platform-web/';
	var updatetimer = false;
	
	function checkLanguage(){
		//获取设备浏览器当前语言
		var getNavLanguage = function(){
			if(navigator.appName == "Netscape"){
				var navLanguage = navigator.language;
				return navLanguage;
			}
			return false;
		}
		
		var getlangtype = null;
		var langstyle = getNavLanguage();
		langstyle = langstyle.toLowerCase();
		if(langstyle && langstyle.indexOf('en-') >= 0){
			langstyle = langstyle.split('-')[0];
			getlangtype = 1;
		}else{
			getlangtype = 2;
		}
		
		return getlangtype;
	}
	
	// H5 plus事件处理
	function plusReady(){
		
		var comLangStyle = localStorage.getItem('langstyle') || 'false';
		var checknetstate = null;
		if(comLangStyle != "" || comLangStyle != null || comLangStyle != 'undefined'){
			if(comLangStyle.indexOf('en') >= 0){
				checknetstate = 1;
			}else{
				checknetstate = 2;
			}
		}else{
			checknetstate = checkLanguage();
		}
		
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
			//set network state
			localStorage.setItem('networkstate',false);
			
			checknetstate === 1 ? alert('The network is not available. Please confirm the network connection.') : alert('网络不能使用，请确认网络连接')
			//set continue execute next task ,show task alert
			localStorage.setItem('execute',false);
		}else{
			//set network state
			localStorage.setItem('networkstate',true);
		}
		
		if( location.href.indexOf('tasking.html') >= 0 ){
			// Android处理返回键
			plus.key.addEventListener('backbutton',function(){
				location.href = "./index.html";
			},false);
			
		}else{
			// Android处理返回键
			plus.key.addEventListener('backbutton',function(){
				
				var backConfirm = checknetstate === 1 ? confirm("Confirm to return to the desktop ?") : confirm('确认返回到桌面？');
				if(backConfirm){
					// 关闭 保持程序唤醒状态
					plus.device.setWakelock( false );
					localStorage.setItem('taskstate',false); //退出桌面任务终止
					var exitApp = setTimeout(function(){
							plus.runtime.quit();
							clearTimeout(exitApp);
						},500);
				}
			},false);
		}
		
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
			}
		});
		
	}
	
	/* Ajax 请求错误提示 */
	$(document).ajaxError(function(event, xhr, settings, infoError){
	    if(xhr && (xhr.status === 200||xhr.status === 0)){
			return false;
		}
		
		switch (xhr.status){
			case(400):
				console.log("请求错误");
				break;
			case(404):
				console.log("无法请求数据");
				break;
			case(500):
				console.log("服务器连接异常");
				break;
			default:
				console.log("未知错误");
		}
	});

	//监听版本更新
	function listenerUpdate(url){
		var updateModalState = localStorage.getItem('updatemodalstate');
		
		if(updateModalState === '1'){
			updatetimer = true;
			return;
		}
		
		var ver = localStorage.getItem('versioncode');
		
		if(ver && ver != 'undefined'){
			$.ajax({
				type:'POST',
				url:url+"configure/getJson",
				dataType:'json',
				success:function(data){
					if(data.code === 5000){
						var data = JSON.parse(data.json);
						if ( compareVersion(ver , data.Android.version) ){
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
							
							if(location.href.indexOf('login.html') < 0){
								
								//after five minutes send task end
								setTimeSendTaskEnd();
							}
							
							localStorage.setItem('updatemodalstate',2);//set update modal prevent show
							
							updatetimer = true;

							localStorage.setItem('execute',false);//set continue execute next task ,show task alert
							
							$('#updateBtn').click(function(){
								//点击更新按钮，设置重新启动任务
								localStorage.setItem('taskstate',false);
								localStorage.setItem('privatestate',false);
								localStorage.setItem('protocolstate',false);
								localStorage.setItem('ringstate',false);//set received task ring
								localStorage.removeItem('updatemodalstate');
								localStorage.removeItem('showvconsole');
								
								setTimeout(function(){
									plus.runtime.openURL( data.Android.url );
									$('#updateModal').hide();
								},600);
								
								
							});
						}
					}else{
						console.log('请求更新文件错误');
					}
					updateModalState = null;
					ver = null;
				}
			});
		}else{
			return;
		}
		
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
		}else{
			localStorage.setItem('imei',imei);
		}
		
	}else{//phone access
		document.addEventListener('plusready',plusReady,false);
		
		setTimeout(listenUpdate,500);
		
		function listenUpdate(){
			if(updatetimer) return;
			
			listenerUpdate(url);
			setTimeout(listenUpdate,5*60*1000);
		}
	}
	
	