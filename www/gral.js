document.addEventListener("deviceready", onDeviceReady, false);
telSTR = 0;


gpsListo = false;

function onDeviceReady() {
	///// Plugin para que corra en segundo plano /////
	cordova.plugins.backgroundMode.enable();
	///// Plugin para que no se cierre con el boton de atras /////
	cordova.plugins.backgroundMode.overrideBackButton();
	///// Plugin para que no lo afecten las opciones de accesibilidad /////
	if(window.MobileAccessibility){
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
    ///// Aca sabe si empezar el camino Android o IOS /////
	if(device.platform == "Android"){
			caminoAndroid();
	}else if (device.platform == "iOS"){
			caminoIOS();
		}
}


////////////////////////// Camino Android //////////////////////////

function caminoAndroid(){
	androidVerificarConexion();
	androidVerificarGPS();
}

function androidVerificarConexion(){
	if (navigator.connection.type == "none"){
		androidPopUpConexion();
	}
}

function androidVerificarGPS(){
	cordova.plugins.diagnostic.isLocationEnabled(function (locationEnabled){
		if (locationEnabled){
		}else{
			androidPopUpGPS();
		};

		}, function(error){
			console.log("error");
		});
}

function androidPopUpConexion(){
	navigator.notification.confirm(
		"Necesitas tener una conexion activa",
		function(buttonIndex){
			switch(buttonIndex){
				case 1: cordova.plugins.diagnostic.switchToWifiSettings();
				break;
				case 2: cordova.plugins.diagnostic.switchToMobileDataSettings();
				break;
				case 3: null;
			}},
			"Alerta",
			["Wifi", "Datos Moviles", "Cancelar"]
);
}

function androidPopUpGPS(){
	navigator.notification.confirm(
		"Necesita tener GPS activo",
		function(buttonIndex){
			switch(buttonIndex){
				case 1: cordova.plugins.diagnostic.switchToLocationSettings();
				break;
				case 2: null;
			}},
			"Alerta",
			["GPS", "Cancelar"]
);
}

////////////////////////// FIN Camino Android //////////////////////////

////////////////////////// Camino IOS //////////////////////////

function caminoIOS(){
	iosVerificarConexion();
	iosVerificarGPS();
}


function iosVerificarConexion(){
	if (navigator.connection.type == "none"){
		iosPopUpConexion();
	}
}

function iosVerificarGPS(){
	cordova.plugins.diagnostic.isLocationEnabled(function (locationEnabled){
		if (locationEnabled){
		}else{
			iosPopUpGPS();
		};

		}, function(error){
			console.log("error");
		});
}

function iosPopUpConexion(){
	navigator.notification.confirm(
		"Necesitas tener una conexion activa",
		function(buttonIndex){
			switch(buttonIndex){
				case 1: cordova.plugins.diagnostic.switchToSettings();
				break;
				case 3: null;
			}},
			"Alerta",
			["Configuracion", "Cancelar"]
);
}

function iosPopUpGPS(){
	navigator.notification.confirm(
		"Necesita tener GPS activo",
		function(buttonIndex){
			switch(buttonIndex){
				case 1: cordova.plugins.diagnostic.switchToSettings();
				break;
				case 2: null;
			}},
			"Alerta",
			["Configuracion", "Cancelar"]
);
}

////////////////////////// FIN Camino IOS //////////////////////////

function irPantallaUbicacion(){
	document.getElementById("pantallaPrincipal").style.display = "none";
	document.getElementById("pantallaUbicacion").style.display = "block";
}

///// Envia una senial cada determinado tiempo /////

function empezarEnvio(){
	prepararDatos();
	setTimeout(empezarEnvio, 180000);
}

function activarUbicacion(){
	console.log("activar ubicacion");
	cordova.plugins.diagnostic.isLocationEnabled(function (locationEnabled){
		if (locationEnabled){
			irPantallaUbicacion();
			empezarEnvio();
		}else{
			if(device.platform == "Android"){
			androidPopUpGPS();
		}else if(device.platform == "iOS"){
			iosPopUpGPS();
		}
		};

		}, function(error){
			console.log("error");
		});
}



function prepararDatos(){
	console.log("ubicando datos");

	telSTR = document.getElementById("caja2InputId").value;
	console.log(telSTR);

	// Fecha y Hora
	var d = new Date();
	var anio = d.getFullYear().toString();
	var mesSF = d.getMonth()+1;
	var mes = ("0"+mesSF).slice(-2);
	var dia = ("0"+d.getDate()).slice(-2);	
	var hora = ("0"+d.getHours()).slice(-2);
	var minutos = ("0"+d.getMinutes()).slice(-2);
	var segundos = ("0"+d.getSeconds()).slice(-2);
	var fechaSTR = anio.concat(mes, dia, hora, minutos, segundos);

	// Numero de evento
	var panSTR = "1";

	navigator.geolocation.getCurrentPosition(
    	function(position){
    		latitud = position.coords.latitude;
    		longitud = position.coords.longitude;
    		orient = position.coords.heading;
    		if (orient == null) {
    			orient = 0.0;
    		};
    		vel = position.coords.speed;
    		if (vel == null) {
    			vel = 0.0;
    		};
    		exact = position.coords.accuracy;
    		var datosListos = telSTR+"&data=>"+telSTR+"|"+fechaSTR+"|"+latitud+"|"+longitud+"|"+orient+"|"+vel+"|"+panSTR+"|"+exact ;
    		console.log(datosListos);
    		enviarAjax(datosListos);
    	}, function(){
    	}, {enableHighAccuracy: true});

}

function enviarAjax(datosListos){
	console.log("entro ajax");
	$.ajax({
	cache:false,
	crossDomain: true,
	url: "http://190.105.224.81/W3/SISTEMANEO/xgo/xgoresponse.asp?id="+datosListos+"|gps<",
	success: function(data){
		console.log('success', data);
	},
	error: function (jqXHR, textStatus, errorThrown){
		console.log("algo salio mal");
		console.log(jqXHR);
		console.log(textStatus);
		console.log(errorThrown);
	}});
}