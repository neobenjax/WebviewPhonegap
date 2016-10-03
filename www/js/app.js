/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 /*
LOG ERRORS:
01 - servicio - getVersion ajax retorno diferente de 1 - validar del lado del servicio
02 - servicio - getVersion no pudo comunicarse con servicio.
03 - servicio - loginAuth no pudo comunicarse con servicio.
04 - servicio - getChanges no pudo comunicarse con servicio.
 */
 /*login = {};
 login.user = "test";

 localStorage.setItem('login', JSON.stringify(login));
*/
liberacion = false;

var source = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( source ) {
    // PhoneGap application
    source_route = (!liberacion)?'http://proyectosphp.codice.com/ferrepat_git/':'https://www.ferrepat.com/';
} else {
    // Web page
    source_route = 'http://localhost:81/ferrepat_git/';
}

if( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) )
    ios = true;

intentos = 0,
internetIntentos=0,
linkIntentos=0;

var app={};
var utiles={};
var pasarelas={};

utiles = {
    
    alerta: function(params) {
        titulo = params.titulo;
        mensaje = params.mensaje;
        btnOk = params.btnOk;
        
        configFancy = {
            padding:0,
            fitToView:false,
            wrapCSS : 'alertaSitio',
            autoCenter: false,
            closeEffect: 'none',
            closeSpeed:0,
            closeBtn:false,
            helpers: {
                    overlay: { closeClick: false,locked: true } //Disable click outside event
            }
        }
        if (params.close)
            configFancy.afterClose = params.close;

        $contenedorAlerta = $(document.createElement('div')).addClass('alertaCont');
        $titulo = $(document.createElement('div')).addClass('titulo').html(titulo);
        $textoMensaje = $(document.createElement('div')).addClass('textoMensaje').html(mensaje);
        $accionesConfirm = $(document.createElement('div')).addClass('accionesConfirmLayer');
        
        if(btnOk!=false){
            $boton = $(document.createElement('a')).addClass('cierreFancy').text(btnOk).attr('href','#');
            $accionesConfirm.append($boton);
        }
        
        if(params.preload){
            $imgLoader = $(document.createElement('img')).addClass('preloader').attr('src','img/loading.gif');
            $accionesConfirm.append($imgLoader);
        }
        
        $contenedorAlerta
                .append($titulo)
                .append($textoMensaje)
                .append($accionesConfirm);
        
        configFancy.content = $contenedorAlerta;
        
        $.fancybox(configFancy);
    }

};

pasarelas.paypal = {
    environment : (!liberacion)?'PayPalEnvironmentSandbox':'PayPalEnvironmentProduction',
    cartInfo : {},
    initPaymentUI : function () {
        var clientIDs = {
            "PayPalEnvironmentProduction": "AbywADC79fkbizQZtc5BItvNezhOHXE6A4kVr5eb2X6dp3e9fF_gg-VlLt5nH_dscLysMEQzZKoJgPbp",
            "PayPalEnvironmentSandbox": "ATZdwWaBm5-YqagYeMblXosZ_zFVjsvPzkO8NH4h7A6n-2aGSF5bUrtzTOGjxmX24oozI9-gaD7pozk-"
        };
        PayPalMobile.init(clientIDs, pasarelas.paypal.onPayPalMobileInit);
    },
    onSuccesfulPayment : function(payment) {
        console.log("payment success: " + JSON.stringify(payment, null, 4));

        app.paypal.success(JSON.stringify(payment, null, 4),payment.response.state);

    },
    // This code is only used for independent card.io scanning abilities
    onCardIOComplete: function(card) {
        console.log("Card Scanned success: " + JSON.stringify(card, null, 4));
    },
    onAuthorizationCallback : function(authorization) {
        console.log("authorization: " + JSON.stringify(authorization, null, 4));
    },
    createPayment : function () {
        // for simplicity use predefined amount
        // optional payment details for more information check [helper js file](https://github.com/paypal/PayPal-Cordova-Plugin/blob/master/www/paypal-mobile-js-helper.js)
        var paymentDetails = new PayPalPaymentDetails
                                (
                                    pasarelas.paypal.cartInfo.subtotal,
                                    pasarelas.paypal.cartInfo.envio,
                                    pasarelas.paypal.cartInfo.impuesto
                                );
        var payment = new PayPalPayment
                            (
                                pasarelas.paypal.cartInfo.total,
                                pasarelas.paypal.cartInfo.moneda,
                                pasarelas.paypal.cartInfo.descripcion,
                                "Sale",
                                paymentDetails);
        return payment;
    },
    simulPayment : function () {
         // for simplicity use predefined amount
         // optional payment details for more information check [helper js file](https://github.com/paypal/PayPal-Cordova-Plugin/blob/master/www/paypal-mobile-js-helper.js)
         var paymentDetails = new PayPalPaymentDetails("50.00", "0.00", "0.00");
         var payment = new PayPalPayment("50.00", "USD", "Descripcion simulada", "Sale", paymentDetails);
         return payment;
    },
    configuration : function () {
        // for more options see `paypal-mobile-js-helper.js`
        var config = new PayPalConfiguration({
            merchantName: "FERREPAT S.A. DE C.V.",
            merchantPrivacyPolicyURL: "https://www.ferrepat.com/aviso_privacidad.html",
            merchantUserAgreementURL: "https://www.ferrepat.com/terminos_condiciones.html"
        });
        return config;
    },
    onPrepareRender : function() {
        console.log('onPrepareRenderer - No utilizado');
    },
    singlePayment : function(cart,simulate) {

        pasarelas.paypal.cartInfo = cart;
        console.log(cart);

        if(simulate){
            PayPalMobile.renderSinglePaymentUI
            (
                pasarelas.paypal.simulPayment(),
                pasarelas.paypal.onSuccesfulPayment,
                pasarelas.paypal.onUserCanceled
            );
        } 
        else
        {
            PayPalMobile.renderSinglePaymentUI
            (
                pasarelas.paypal.createPayment(),
                pasarelas.paypal.onSuccesfulPayment,
                pasarelas.paypal.onUserCanceled
            );
        }

    },
    futrePayment : function() {
        PayPalMobile.renderFuturePaymentUI
        (
            pasarelas.paypal.onAuthorizationCallback,
            pasarelas.paypal.onUserCanceled
        );
    },
    onPayPalMobileInit : function() {
        // must be called
        // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
        PayPalMobile.prepareToRender
        (
            pasarelas.paypal.environment,
            pasarelas.paypal.configuration(),
            pasarelas.paypal.onPrepareRender
        );

    },
    onUserCanceled : function(result) {
        console.log(result);
        location.reload();
    }
}

app = {
    version: 0,
    servicio : source_route+'webapp_service/index.php',
    urlsitio : source_route+'index.php?app=true',
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('online', app.checkConnection('online'), false);
        document.addEventListener('deviceready', app.onDeviceReady(), false);

        //document.addEventListener("offline", app.checkConnection('offline'), false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    checkConnection: function(caller){
        
        if(caller == 'offline') 
        {
            console.log('Se cayó la red');
        }
        else
        {
            
            console.log('Caller:' + caller);
            

            if(!ios){
                
                var networkState = navigator.connection.type;
                //var networkState = 'Connection.CELL';
                
                var states = {};
                
                states[Connection.UNKNOWN]  = {tipo:-1,lbl:'Conexión desconocida'};
                states[Connection.ETHERNET] = {tipo:1,lbl:'Conexión ethernet'};
                states[Connection.WIFI]     = {tipo:2,lbl:'Conexión Wifi'};
                states[Connection.CELL_2G]  = {tipo:3,lbl:'2G'};
                states[Connection.CELL_3G]  = {tipo:4,lbl:'3G'};
                states[Connection.CELL_4G]  = {tipo:5,lbl:'4G'};
                states[Connection.CELL]     = {tipo:6,lbl:'Celular Conexión Baja'};
                states[Connection.NONE]     = {tipo:0,lbl:'Verifique su conexión a internet por favor!'};
                
                retorno = states[networkState];

            } else {
                
                connectionState = {};
                
                var xhr = new XMLHttpRequest();
                var file = app.servicio;
                var r = Math.round(Math.random() * 10000);
                xhr.open('HEAD', file + "?subins=" + r, false);
                try {
                    xhr.send();
                    if (xhr.status >= 200 && xhr.status < 304) {
                        connectionState = {tipo:-1,lbl:'Conexión desconocida'};
                    } else {
                        connectionState = {tipo:0,lbl:'Verifique su conexión a internet por favor!'};
                    }
                } catch (e) {
                    connectionState = {tipo:0,lbl:'Verifique su conexión a internet por favor!'};
                }
             
                retorno = connectionState;
                
            }
            
            //return states[networkState];
            return retorno;
        }
    },
    onDeviceReady: function() {


        if( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) )
            //StatusBar.overlaysWebView(false);
        
        var version = JSON.parse(localStorage.getItem('version'));

        if(version==null){

            localStorage.setItem('version', app.version);
            app.version = JSON.parse(localStorage.getItem('version'));

        } else {

            app.version = version;

        }

        var cssLocal = JSON.parse(localStorage.getItem('cssLocal'));
        var jsLocal = JSON.parse(localStorage.getItem('jsLocal'));

        if(cssLocal!=null)
            $('#injectedCSS').html(cssLocal);
        if(jsLocal!=null)
            $('#injectedJS').html(jsLocal);


        internet = app.checkConnection('onDeviceReady');

        if (internet.tipo!=0) 
            app.checkForUpdates();
        else 
        {
            utiles.alerta(
                        {
                            titulo:'Conexión',
                            mensaje:internet.lbl,
                            btnOk:(intentos<2)?"Reintentar":'Cerrar',
                            close:function(){

                                    if(internetIntentos < 3)
                                        setTimeout(function(){app.onDeviceReady();},1000);
                                    else
                                        navigator.app.exitApp();

                                    internetIntentos++;

                                }
                        }
                    )

        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    checkForUpdates: function(callback){
        utiles.alerta({
                    titulo:'Actualizaciones',
                    mensaje:'Revisando actualizaciones',
                    btnOk:false,
                    preload:true
                    });
        //Codigo para validar si hay estilos, js, recursos y demás por inyectar
        $.ajax({
            url: app.servicio+'?act=getVersion',
            dataType: 'JSON',
            success: function(data, status) {
                console.log(data);
                if(data.codigo==1){
                    //validar data.version contra la version local, si es diferente inyectar lo correspondiente
                    if(app.version != data.version)
                        setTimeout(function(){$.fancybox.close();app.actualizarApp();},1000);
                    else
                        setTimeout(function(){$.fancybox.close();app.toMain();},1000);

                } else {
                    utiles.alerta({
                                    titulo:'Error',
                                    mensaje:'Ocurrió un error, favor de volver a intentar (01)<br>'+data.codigo,
                                    btnOk:"Ok"
                                });
                }

            },
            error: function() {
                //handle the error
                utiles.alerta({
                                titulo:'Error',
                                mensaje:'Ocurrió un error en la comunicación, favor de volver a intentar (02)',
                                btnOk:(intentos<3)?"Ok":'Cerrar',
                                close:function(){

                                    if(intentos < 3)
                                        setTimeout(function(){app.checkForUpdates();},1000);
                                    else
                                        navigator.app.exitApp();

                                    intentos++;
                                }
                            });
            }
        });
    },
    actualizarApp: function(){
        utiles.alerta({
                    titulo:'Actualizando',
                    mensaje:'Actualizando contenido',
                    btnOk:false,
                    preload:true
                    });
        //Codigo para validar si hay estilos, js, recursos y demás por inyectar
        $.ajax({
            url: app.servicio+'?act=getChanges',
            dataType: 'JSON',
            success: function(data, status) {
                if(data.codigo==1){
                    console.log(data);
                    if(data.css){
                        $('#injectedCSS').html(data.css);
                        localStorage.setItem('cssLocal', JSON.stringify(data.css));
                    }
                    if(data.js){
                        $('#injectedJS').html(data.js);
                        localStorage.setItem('jsLocal', JSON.stringify(data.js));
                    }

                    if(data.css == $('#injectedCSS').text() && data.js == $('#injectedJS').text()){
                        localStorage.setItem('version', data.version);
                        setTimeout(function(){
                            $.fancybox.close();
                            utiles.alerta({
                                    titulo:'Actualizado',
                                    mensaje:data.mensaje,
                                    btnOk:"Ok",
                                    close: function(){app.toMain();}
                                });
                        },1000);
                    } else {
                        setTimeout(function(){
                            $.fancybox.close();
                            utiles.alerta({
                                    titulo:'Error',
                                    mensaje:'Ha ocurrido un error durante la actualización, favor de reiniciar la aplicación.',
                                    btnOk:"Cerrar",
                                    close: function(){navigator.app.exitApp();}
                                });
                        },1000);
                    }

                } else {
                    utiles.alerta({
                                    titulo:'Error',
                                    mensaje:'Ocurrió un error, favor de volver a intentar<br>'+data.codigo,
                                    btnOk:"Ok"
                                });
                }

            },
            error: function() {
                //handle the error
                utiles.alerta({
                                titulo:'Error',
                                mensaje:'Ocurrió un error en la comunicación, favor de volver a intentar (04)',
                                btnOk:"Ok"
                            });
            }
        });
    },
    toMain: function(){

        $('#mainPage').show();
        $('#contenidoSitio').attr('src',app.urlsitio);
        /*setTimeout(function(){
            alert('Marcar teléfono');
            window.open('tel://018008900210', '_system')
        },5000);*/
        //Fixed
        try {
            pasarelas.paypal.initPaymentUI();
        }
        catch(err) {
            console.log('Error paypal');
        }
        
    },
    actualizarCarrito: function(){
        //Actualizar numero de productos en el carrito
    },
    validarInteraccion: function(msg){

        if (msg.data.type == "abrirMosaico")
        {
            app.abrirMosaico(false);
        }
        else if (msg.data.type == "putLogin")
        {
            app.putLogin(msg.data.nombreUsuario);
        }
        else if (msg.data.type == "popLogin")
        {
            app.popLogin();
        }
        else if (msg.data.type == "updateCart")
        {
            app.updateCart(msg.data.items);
        }
        else if (msg.data.type == "shareProduct" )
        {
            app.shareProduct(msg.data.info);
        }
        else if (msg.data.type == "shareProductFB" )
        {
            app.shareProductFB(msg.data.info);
        }
        else if (msg.data.type == "openLink" )
        {
            app.openLink(msg.data.url);
        }
        else if (msg.data.type == "overflowContent" )
        {
            app.overflowContent(msg.data.heightPage);
        }
        else if (msg.data.type == "openExternal" )
        {
            app.openExternal(msg.data.url);
        }
        else if (msg.data.type == "paypal" )
        {
            app.paypal.transaction(msg.data.cart, msg.data.simular,msg.data.folio);
        }
        else if (msg.data.type == "alertaApp" )
        {
            app.alertaApp(msg.data.alerta,msg.data.timeout,msg.data.redirect)
        }



    },
    abrirMosaico:function(soloicono){

        $('.toolsHeader a.logoInt').hide('slide',{direction:'left'});
        $('.toolsHeader a.abrirMosaico').show('slide',{direction:'right'});
        if(!soloicono){
            if($('#menuApp').hasClass('open')) $('#menuApp').removeClass('open');
            $('#menuArticulos').addClass('open');
        }
    },
    putLogin:function(nombreUsuario){
        $('#loginUsuario').css('display','block').find('#nombreUsuario').text(nombreUsuario);
    },
    popLogin:function(){
        $('#loginUsuario').css('display','none');
        $('#menuApp').removeClass('open');
    },
    updateCart:function(items){
        if(items>0){
            $('#itemsCont').css('display','table').children('span').text(items);
        } else {
            $('#itemsCont').css('display','none').children('span').text(0);
        }
    },
    shareProduct:function(info){
        console.log(info);
        //Limitaciones
        //http://www.joshmorony.com/posting-to-a-facebook-wall-with-phonegap-the-javascript-sdk/
        window.plugins.socialsharing.share(
            info.mensaje, 
            null, 
            info.imagen, 
            info.link);
    },
    shareProductFB:function(info){
        console.log(info);
        window.plugins.socialsharing.shareViaFacebook(
            'Mensaje vía Facebook',
            null /* img */,
            info.link /* url */,
            function() {console.log('share ok')},
            function(errormsg){alert(errormsg)})
    },
    openLink:function(url){
        console.log(url);
        $('#contenidoSitio').attr('src',url);
    },
    overflowContent:function(heightPage){
        $('#contenidoSitio').css({
            'overflow-y':'scroll',
            'height':heightPage+'px'
        });
        console.log('Pollo: '+heightPage);
        console.log($('#contenidoSitio').height());
    },
    openExternal:function(link){
        window.open(link, "_system");
    },
    alertaApp:function(alerta,timeout,redirect){
        if(redirect) alerta.close=function(){$('#contenidoSitio').attr('src',redirect);};

        utiles.alerta(alerta);
        
        if(timeout) setTimeout(function(){$.fancybox.close();},timeout);
    },
    paypal:{
        transaction : function(cart,simular,folio)
                    {
                        pasarelas.paypal.singlePayment(cart,false);
                        $('#paypalTransact [name="folio"]').val(folio);
                    },
        success : function(json,status)
                    {
                        $('#paypalTransact [name="json"]').val(json);
                        $('#paypalTransact [name="status"]').val(status);

                        console.log('serialize');
                        console.log($('#paypalTransact').serializeArray());
                        $('#paypalTransact').submit();
                    }
    }
    
};
/*JQUERY*/
$(document).on('click','.cierreFancy',function(event){
    event.preventDefault();
    $.fancybox.close();
});
$(document).on('click','.buscarHeader',function(){
    (!$('#buscadorDesplegable').is(':visible'))?$('#buscadorDesplegable').show('slide',{direction:'up'}):$('#buscadorDesplegable').hide('slide',{direction:'up'});
});
$(document).on('click','#desplegarMenu',function(){
    if($('#menuArticulos').hasClass('open')) $('#menuArticulos').removeClass('open');
    $('#menuApp').addClass('open');
});
$(document).on('click','#menuOverlayClick',function(){
    $('#menuApp').removeClass('open');
});

$(document).on('click','.contenidoMenu ul.opcionesMenu > li > a',function(event){
    if($(this).next('ul.subMenu').length>0){
        event.preventDefault();
        if($(this).hasClass('openSubMenu'))
            $(this).removeClass('openSubMenu');
        else {
            $('.openSubMenu').removeClass('openSubMenu');
            $(this).addClass('openSubMenu');
        }
    }
});

$('.buscadorSubmit').submit(function(){
    
    if ( $(this).attr('id') )
    {
        
        $('#buscadorDesplegable').hide('slide',{direction:'up'});

    } else 
    {
        
        $('#menuApp').removeClass('open');

    }

});

//$(document).on('click',"a[href^='https://www.ferrepat.com']",function(event){
$(document).on('click',"a[href^='http://localhost:81/ferrepat_git'],a[href^='http://proyectosphp.codice.com/ferrepat_git'],a[href^='https://www.ferrepat.com']",function(event){
    event.preventDefault();
    internet = app.checkConnection('link');

    if (internet.tipo!=0) {
        linkIntentos = 0;
        $('#contenidoSitio').attr('src',$(this).attr('href')+'?app=true');
    }
    else 
    {
        utiles.alerta(
                    {
                        titulo:'Conexión',
                        mensaje:internet.lbl,
                        btnOk:"Ok"
                    }
                )
        $('#contenidoSitio').attr('src','404.html');

    }

});
$("a[target='_blank']").click(function(event) {
  event.preventDefault();
  app.openExternal($(this).attr('href'));
});

$(document).on('click','.showMosaico,.noMosaico',function(){
    if ($(this).hasClass('showMosaico')) 
    {
        $('.toolsHeader a.logoInt').hide('slide',{direction:'left'});
        $('.toolsHeader a.abrirMosaico').show('slide',{direction:'right'});

    } else 
    {

        $('.toolsHeader a.logoInt').show('slide',{direction:'left'});
        $('.toolsHeader a.abrirMosaico').hide('slide',{direction:'right'});

    }

    if ($('#menuApp').hasClass('open')) $('#menuApp').removeClass('open');
});

$(document).on('click','a.abrirMosaico',function(event){
    event.preventDefault();
    if ($('#menuApp').hasClass('open')) $('#menuApp').removeClass('open');
    $('#menuArticulos').toggleClass('open');
});

$(document).on('click','.cerrarMenuArticulos,.cerrarMenuArticulos img',function(){
   $('#menuArticulos').removeClass('open'); 
});


$("#menuApp").swipe( {
    //Generic swipe handler for all directions
    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
      
      if(direction=='right')
        $('#menuApp').removeClass('open');

    },
    swipeStatus:function(event, phase) {
      if (phase=="cancel") {
      }
    },
    threshold:100,
    allowPageScroll:"auto"

});



//Comunicacion entre el iframe y esta app
window.addEventListener("message", function(msg) {

    app.validarInteraccion(msg);
  
});
