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
 */
 /*login = {};
 login.user = "test";

 localStorage.setItem('login', JSON.stringify(login));
*/
var utiles = {
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
            $boton = $(document.createElement('a')).addClass('cierreFancy').text(btnOk);
            $accionesConfirm.append($boton);
        }
        
        if(params.preload){
            $imgLoader = $(document.createElement('img')).addClass('preloader').attr('src','../fancybox/fancybox_loading@2x.gif');
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
var app = {
    version: 0,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('online', this.checkConnection('online'), false);
        document.addEventListener("offline", this.checkConnection('offline'), false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    checkConnection: function(caller){
        if(caller == 'offline') console.log('Se cayó la red');
        else{
            console.log('Caller:' + caller);
            var networkState = navigator.connection.type;
            var states = {};
            states[Connection.UNKNOWN]  = {tipo:-1,lbl:'Conexión desconocida'};
            states[Connection.ETHERNET] = {tipo:1,lbl:'Conexión ethernet'};
            states[Connection.WIFI]     = {tipo:2,lbl:'Conexión Wifi'};
            states[Connection.CELL_2G]  = {tipo:3,lbl:'2G'};
            states[Connection.CELL_3G]  = {tipo:4,lbl:'3G'};
            states[Connection.CELL_4G]  = {tipo:5,lbl:'4G'};
            states[Connection.CELL]     = {tipo:6,lbl:'Celular Conexión Baja'};
            states[Connection.NONE]     = {tipo:0,lbl:'Verifique su conexión a internet por favor!'};

            return states[networkState];
        }
    },
    onDeviceReady: function() {
        internet = app.checkConnection('onDeviceReady');

        if (internet.tipo!=0) app.checkForUpdates();
        else utiles.alerta({titulo:'Conexión',mensaje:internet.lbl,btnOk:'Ok'})
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
            url: 'http://localhost:81/ferrepatservice/index.php?act=getVersion',
            dataType: 'JSON',
            success: function(data, status) {
                console.log(data);
                if(data.codigo==1){
                    setTimeout(function(){
                        $.fancybox.close();
                        var login = JSON.parse(localStorage.getItem('login'));
                        if(login && login.user!=''){
                            $('#login').hide();
                            $('#mainPage').show();
                        }
                    },1000);
                } else {
                    utiles.alerta({
                                    titulo:'Error',
                                    mensaje:'Ocurrio un error, favor de volver a intentar (01)<br>'+data.codigo,
                                    btnOk:"Ok"
                                });
                }

            },
            error: function() {
                //handle the error
                utiles.alerta({
                                titulo:'Error',
                                mensaje:'Ocurrio un error en la comunicación, favor de volver a intentar (02)<br>'+data.codigo,
                                btnOk:"Ok"
                            });
            }
        });
    },
    loginAction: function(recordar){
        //Ajax para validar el login
    },
    actualizarCarrito: function(){
        //Actualizar numero de productos en el carrito
    }
};
/*JQUERY*/
$(document).on('click','.cierreFancy',function(event){
        event.preventDefault();
        $.fancybox.close();
});