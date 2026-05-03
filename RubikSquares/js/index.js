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


/////////////////// Cross-browser stuff. /////////////////
function mouseX(e) {
    if (typeof e.touches != "undefined") {
        e = e.touches.item(0);
    }

    if (e.clientX) {
        return Math.round(e.clientX);
    }
    if (e.pageX) {
        return Math.round(e.pageX);
    }

    return null;
}

function mouseY(e) {
    if (typeof e.touches != "undefined") {
        e = e.touches.item(0);
    }

    if (e.clientY) {
        return Math.round(e.clientY);
    }
    if (e.pageY) {
        return Math.round(e.pageY);
    }

    return null;
}

function eventNameByDevice(event) {
    if (typeof cordova != "undefined") {
        if (window.cordova.platformId == "android") {
            switch (event) {
                case "mousedown":
                    return "touchstart";
                    break;
                case "mousemove":
                    return "touchmove";
                    break;
                case "mouseup":
                    return "touchend";
                    break;
            }
        } else {
            if (event.endsWith("down")) {
                return "pointerdown";
            } else if (event.endsWith("move")) {
                return "pointermove";
            } else if (event.endsWith("up")) {
                return "pointerup";
            }
        }
    }

    return event;
}

function PrefixedEvent(element, type, callback) {
    var pfx = ["webkit", "o", ""]; //"moz", "MS",

    for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p] + type, callback, false);
    }
}

///////////////////////////////////////<GLOBAL Functions>///////////////////////////////////////

function colorEnum(rand) {
    // if (rand == 0) {
    //     return "rgb(255, 0, 0)";
    // } else if (rand == 1) {
    //     return "rgb(0, 255, 0)";
    // } else if (rand == 2) {
    //     return "rgb(0, 0, 255)";
    // } else if (rand == 3) {
    //     return "rgb(255, 255, 0)";
    // } else if (rand == 4) {
    //     return "rgb(0, 255, 255)";
    // } else if (rand == 5) {
    //     return "rgb(255, 0, 255)";
    // }

    if (rand == 0) {
        return "rgb(250, 0, 0)";
    } else if (rand == 1) {
        return "rgb(0, 250, 0)";
    } else if (rand == 2) {
        return "rgb(0, 0, 250)";
    } else if (rand == 3) {
        return "rgb(250, 250, 0)";
    } else if (rand == 4) {
        return "rgb(0, 250, 250)";
    } else if (rand == 5) {
        return "rgb(250, 0, 250)";
    }

    return "rgb(255, 255, 255)";
}

function toggleDisplay(div_id) {
    var el = document.getElementById(div_id);
    if (el.style.display == 'none') { el.style.display = 'block'; }
    else { el.style.display = 'none'; }
}
function toggleVisibility(div_id) {
    var el = document.getElementById(div_id);
    if (el.style.visibility == 'hidden') { el.style.visibility = 'visible'; }
    else { el.style.visibility = 'hidden'; }
}


function redrawImage(img, context, tosize) {
    if (img.naturalWidth > img.naturalHeight) {
        var imgSize = img.naturalHeight;
        var sx = Math.floor((img.naturalWidth - imgSize) / 2);

        context.drawImage(img, sx, 0, imgSize, imgSize, 0, 0, tosize, tosize);
    } else {
        var imgSize = img.naturalWidth;
        var sy = 0;

        if (img.naturalHeight != img.naturalWidth) {
            sy = Math.floor((img.naturalHeight - imgSize) / 2);
        }

        context.drawImage(img, 0, sy, imgSize, imgSize, 0, 0, tosize, tosize);
    }
}

function cutImageIntoPieces(unit, image, peaces) {
    var imagePieces = [];

    for (var i = 0; i < peaces; ++i) {
        for (var j = 0; j < peaces; ++j) {
            var canvas = document.createElement('canvas');
            canvas.width = unit;
            canvas.height = unit;
            var context = canvas.getContext('2d');
            context.drawImage(image, j * unit, i * unit, unit, unit, 0, 0, unit, unit);
            imagePieces.push(canvas.toDataURL());
        }
    }

    return imagePieces;
}

///////////////////////////////////////</GLOBAL Functions>///////////////////////////////////////


var app = {
    activityStack: new Array(),

    // Application Constructor
    initialize: function () {
        if (window.cordova) {      //window.cordova.platformId == "android"
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
            document.addEventListener("pause", this.onPause.bind(this), false);
            document.addEventListener("resume", this.onResume.bind(this), false);
        } else {
            window.addEventListener('load', this.onDeviceReady.bind(this), false);
        }

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');


        var btnStart = document.getElementById("btnStart");
        btnStart.addEventListener('click', this.onClickStartActivity.bind(startMenu), false)

        btnHtp = document.getElementById("btnHtp");
        btnHtp.addEventListener("click", this.onClickStartActivity.bind(game.howtoplay), false);

        btnSettings = document.getElementById("btnSettings");
        btnSettings.addEventListener("click", this.onClickStartActivity.bind(app.settings), false);

        // var btnExit = document.getElementById("btnExit");
        // if (btnExit) btnExit.addEventListener("click", this.onBackButton, false);

        document.addEventListener("backbutton", this.onBackButton, false);
        var btnBack = document.getElementById("btnBack");
        btnBack.addEventListener("click", app.onBackButton);

        var btnNew = document.getElementById("btnNew");
        btnNew.addEventListener("click", app.onClickNew);

        // startmenu
        var btnShoot = document.getElementById("btnTakePicture");
        btnShoot.addEventListener("click", startMenu.loadImageCamera);

        var btnLoadImg = document.getElementById("btnLoadFromGal");
        if (cordova.platformId === 'browser') {
            btnLoadImg.addEventListener("click", startMenu.loadImageCamera);
        } else {
            btnLoadImg.addEventListener("click", startMenu.loadImageGallery);
        }

        //settings
        var slcSize = document.getElementById("selectSize").querySelector("select");
        slcSize.addEventListener("change", app.settings.gridSizeChanged);
        if (window.localStorage["gridSize"]) {
            slcSize.value = window.localStorage["gridSize"];
        } else {
            slcSize.value = 4;
        }

        var btnSoundOn = document.getElementById("btnSoundOn");
        btnSoundOn.addEventListener("click", app.settings.soundChanged.bind(app.settings), false);
        app.settings.setSound(window.localStorage["soundOff"] == "true");

        var slctImgQuality = document.getElementById("btnImgQuality").querySelector("select");
        slctImgQuality.addEventListener("change", app.settings.imgQualityChanged);
        if (window.localStorage["imgQuality"]) {
            slctImgQuality.value = window.localStorage["imgQuality"];
        } else {
            slctImgQuality.value = "75";
            window.localStorage["imgQuality"] = 75;
        }

        var chkUnsolvable = document.getElementById("chkUnsolvable");
        chkUnsolvable.addEventListener("change", app.settings.unsolvableChanged.bind(app.settings), false);
        if (window.localStorage["unsolvable"]) {
            if (this.settings.unsolvable()) chkUnsolvable.checked = true;
        }
    },

    onPause: function () {
        this.receivedEvent("pause");

        game.mMedia.unload();
    },

    onResume: function () {
        this.receivedEvent("resume");

        game.mMedia.preload();
    },

    onClickNew: function () {
        try {
            if (!window.once2) {
                window.once2 = true;

                if (game.isGameWon()) {
                    game.start();
                    btnNew.classList.remove("blink");
                    toggleVisibility("lblVictory");

                } else if (confirm("Current game will be lost. Do you wish to continue?")) {
                    game.start();
                }

                window.once2 = false;
            }
        } catch (exc) {
        } finally {
            window.once2 = false;
        }

    },
    onBackButton: function () {
        // TODO https://stackoverflow.com/questions/7251315/how-to-dismiss-a-phonegap-notification-programmatically#27024021

        try {
            if (!window.once1) {
                window.once1 = true;


                if (app.activityStack.length == 0) {
                    if (navigator.app) {
                        navigator.app.exitApp();
                    } else if (navigator.device) {
                        navigator.device.exitApp();
                    } else {
                        window.close();
                    }

                } else {
                    var res = app.activityStack[app.activityStack.length - 1].onBack();
                    if (res) {
                        app.activityStack.pop();
                    }
                }

                window.once1 = false;
            }
        } catch (exc) {
        } finally {
            window.once1 = false;
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log('Received Event: ' + id, this);

        switch (id) {
            case "deviceready":
                document.body.style.width = window.innerWidth + "px";
                document.body.style.height = window.innerHeight + "px";
                console.info("Resolution", window.innerWidth, window.innerWidth);

                window.setTimeout(function () {
                    app.backgroundAnimation.start();
                }, 2000);

                game.callbackVictory = function () {
                    app.receivedEvent("victory");
                };

                if (window.plugins && window.plugins.NativeAudio) {
                    game.mMedia = new function () {
                        function onAudioSuccess(e) {
                            // console.log("onAudioSuccess", this, e)
                        }
                        function onAudioFail(e) {
                            console.warn("onAudioFail", this, e)
                        }

                        // function getMediaURL(s) {
                        //     if (cordova.platformId === "android") return "/android_asset/www/" + s;
                        //     return s;
                        // }

                        this.preload = function () {
                            window.plugins.NativeAudio.preloadSimple('click', 'sounds/click.wav', onAudioSuccess, onAudioFail);
                            window.plugins.NativeAudio.preloadSimple('clickB', 'sounds/clickb.wav', onAudioSuccess, onAudioFail);
                            window.plugins.NativeAudio.preloadSimple('victory', 'sounds/victory.mp3', onAudioSuccess, onAudioFail);
                            // window.plugins.NativeAudio.preloadSimple('zip', 'sounds/zip0.wav'), onAudioSuccess, onAudioFail);
                            window.plugins.NativeAudio.preloadComplex('zip', 'sounds/zip0.wav', 1, 8, 0, onAudioSuccess, onAudioFail)
                        }

                        this.unload = function () {
                            window.plugins.NativeAudio.unload('click', onAudioSuccess, onAudioFail);
                            window.plugins.NativeAudio.unload('clickB', onAudioSuccess, onAudioFail);
                            window.plugins.NativeAudio.unload('victory', onAudioSuccess, onAudioFail);
                            window.plugins.NativeAudio.unload('zip', onAudioSuccess, onAudioFail);
                        }
                        this.preload();


                        this.click = function () {
                            if (app.settings.sound()) {
                                window.plugins.NativeAudio.play('click');
                            }
                        }
                        this.clickback = function () {
                            if (app.settings.sound()) {
                                window.plugins.NativeAudio.play('clickB');
                            }
                        }
                        this.zip = function (e) {
                            // console.log("zip", this, e);
                            if (app.settings.sound()) {
                                window.plugins.NativeAudio.play('zip');
                            }
                        }
                        this.victory = function () {
                            if (app.settings.sound()) {
                                window.plugins.NativeAudio.play('victory');
                            }
                        }
                    }

                    var btns = document.getElementsByClassName("btnColor");
                    for (var i = 0; i < btns.length; i++) {
                        if (btns[i].getAttribute("id") !== "btnBack") {
                            btns[i].addEventListener("click", btnClick);
                        } else {
                            btns[i].addEventListener("click", function () {
                                game.mMedia.clickback();
                            });
                        }
                    }

                    function btnClick() {
                        game.mMedia.click();
                    }
                } else {
                    game.mMedia = new function () {
                        this.click = this.clickback = this.zip = this.victory = this.unload = this.preload = function () { };
                    }
                }

                break;
            case "startmenu":

                var slct = document.getElementById("selectSize").querySelector("select");
                if (slct) {
                    var size = parseInt(slct.value);
                    game.size = size;
                }

                var res = window.innerWidth;
                if ((res <= 320 && size > 3) || size > 4) {
                    game.distance = 2;
                } else {
                    game.distance = 4;
                }

                break;
            case "game":


                break;
            case "howtoplay":


                break;
            case "victory":
                var btnNew = document.getElementById("btnNew");
                if (btnNew) {
                    btnNew.classList.add("blink");
                }

                toggleVisibility("lblVictory");

                break;
        }
    },

    onClickStartActivity: function () {
        app.receivedEvent(this.name);
        app.activityStack.push(this);

        this.onStart();
    },

    backgroundAnimation: new function () {
        var callstack = 0;

        function putInMiddle(el) {
            el.style.top = (window.innerHeight / 2 - 1) + "px";
            el.style.left = (window.innerWidth / 2 - 1) + "px";
        }

        function startAnime(id) {
            // console.log("startAnime", this, shad, id, callstack);

            var shad = document.createElement("div");
            shad.animation = animationFunction;
            // document.body.insertAdjacentElement("afterbegin", shad);
            document.body.appendChild(shad);
            shad.setAttribute("id", id);
            putInMiddle(shad);

            shad.className = "shadow";
            PrefixedEvent(shad, "TransitionEnd", endFunction);

            window.setTimeout(function () {
                shad.animation();
            }, 10);
        }
        function endFunction(e) {

            if (e.propertyName === "padding-bottom" && callstack > 0) {
                if (e.srcElement.getAttribute("id") === "shadow1") {
                    startAnime("shadow2");
                } else {
                    startAnime("shadow1");
                }
            } else if (e.propertyName === "top") {
                e.srcElement.outerHTML = "";
                delete e.srcElement;

                // document.body.removeChild(e.srcElement);
            }
        }
        function animationFunction() {
            // this.style.borderTopWidth = this.style.borderBottomWidth = window.innerHeight / 2 + "px"
            // this.style.borderRightWidth = this.style.borderLeftWidth = window.innerWidth / 2 + "px";
            // this.style.top = (-window.innerHeight/2) + "px";
            // this.style.left = (-window.innerWidth/2) + "px";
            // this.style.paddingTop = this.style.paddingBottom = window.innerHeight / 2 + "px";
            // this.style.paddingLeft = this.style.paddingRight = window.innerWidth / 2 + "px";

            this.style.borderTopWidth = this.style.borderBottomWidth = (window.innerHeight / 4) + "px"
            this.style.borderRightWidth = this.style.borderLeftWidth = (window.innerWidth / 4) + "px";
            this.style.top = (-window.innerHeight * 1 / 4) + "px";
            this.style.left = (-window.innerWidth * 1 / 4) + "px";
            this.style.paddingTop = this.style.paddingBottom = window.innerHeight / 4 + "px";
            this.style.paddingLeft = this.style.paddingRight = window.innerWidth / 4 + "px";
            this.style.width = window.innerWidth / 2 + "px";
            this.style.height = window.innerHeight / 2 + "px";
        }

        /////////////////
        this.start = function () {
            callstack++;

            if (callstack > 0) {         // on
                startAnime("shadow1");
            }
        }

        this.stop = function () {
            callstack--;

            var s1 = document.getElementById("shadow1");
            if (s1) {
                // document.body.removeChild(s1);

                s1.outerHTML = "";
                delete s1;
            }

            var s2 = document.getElementById("shadow2");
            if (s2) {
                s2.outerHTML = "";
                delete s2;
            }
        }
    },

    settings: {
        name: "settings",

        onBack: function () {
            toggleDisplay("settings");
            toggleVisibility("header");
            toggleDisplay("menu");

            // var menu = document.getElementById("menu");
            // PrefixedEvent(menu, "animationend", function(){
            //     console.log("menu animationend", this);
            //     menu.className = "anim";
            // })

            return true;
        },
        onStart: function () {
            var menu = document.getElementById("menu");
            menu.className = "slideright";

            toggleDisplay("menu");
            toggleVisibility("header");
            toggleDisplay("settings");

        },

        sound: function () {
            return window.localStorage["soundOff"] != "true";
        },
        soundChanged: function (e) {
            console.log("soundChanged", e, window.localStorage["soundOff"]);

            var v = window.localStorage["soundOff"] == "true";

            this.setSound(!v);
            if (v) {
                game.mMedia.click();
            }
        },
        setSound: function (sound) {
            var btnSoundOn = document.getElementById("btnSoundOn");

            if (sound) {
                window.localStorage["soundOff"] = true;
                btnSoundOn.classList.add("soundoff");
                btnSoundOn.classList.remove("soundon");
            } else {
                window.localStorage["soundOff"] = false;
                btnSoundOn.classList.add("soundon");
                btnSoundOn.classList.remove("soundoff");
            }
        },

        imgQuality: function () {
            return window.localStorage["imgQuality"];
        },
        imgQualityChanged: function (e) {
            var select = document.getElementById("btnImgQuality").querySelector("select");
            var val = select.options[select.selectedIndex].value;

            window.localStorage["imgQuality"] = val;
        },

        unsolvable: function () {
            return window.localStorage["unsolvable"] == "true";
        },
        unsolvableChanged: function (e) {
            var val = document.getElementById("chkUnsolvable").checked;
            console.log("unsolvable", val);

            window.localStorage["unsolvable"] = val;
            game.mMedia.click();
        },

        gridSizeChanged: function (e) {
            var slcSize = document.getElementById("selectSize").querySelector("select");
            window.localStorage["gridSize"] = slcSize.value;
        }
    }
};

app.initialize();
