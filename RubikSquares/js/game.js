
var game = {
    name: "game",
    size: 4,
    distance: 4,
    gameBackground: "#333333",
    gameType: undefined,
    mMedia: undefined,

    onStart: function () {
        toggleDisplay("startmenu");
        toggleDisplay("game");
        toggleVisibility("btnNew")
        document.body.style.position = "fixed";

        game.create();
        game.start();
    },
    onBack: function () {
        function doit() {
            toggleDisplay("game");
            document.body.style.position = "";

            toggleDisplay("startmenu");
            toggleVisibility("btnNew");
            document.getElementById("lblVictory").style.visibility = "hidden";

            game.removeEventListeners();
            game.clear();
        }


        if (game.isGameWon()) {
            doit();
            return true;
        } else if (confirm("Current game will be lost. Do you want to quit?")) {
            doit();
            return true;
        }
    },

    create: function () {
        var frame = document.getElementById("gameFrame");
        var totalwidth = window.innerWidth;
        var r = totalwidth % this.size;

        frame.style.backgroundColor = this.gameBackground;
        // frame.style.border = (r / 2) + "px solid " + this.gameBackground;
        var unit = (totalwidth - r) / this.size;
        frame.style.height = totalwidth + "px";
        frame.style.maxWidth = totalwidth + "px";
        // frame.style.backgroundColor = "#333333";
        console.log("totalwidth", totalwidth, unit, r);
        this.gridHandler.unit = unit;

        if (!this.gameType) this.gameType = new this.gameTypes.simpleHorizontal();
        // this.isGameWon = this.gameType.isGameWon;

        this.gridHandler.callback1 = this.gridHandler.onSquareMove.bind(this.gridHandler);
        this.gridHandler.callback2 = this.gridHandler.onSquareEnd.bind(this.gridHandler);


        function createMap() {
            const shortdim = 30;
            var availableSpace = window.innerHeight - (50 + 20 + window.innerWidth + 25);
            if (availableSpace <= 50) { availableSpace = 100; }
            // console.log("availableSpace", availableSpace);

            var down = false;
            var map = document.getElementById("map");
            map.innerHTML = "";
            map.className = "down";
            map.style.height = shortdim + "px";
            map.style.width = shortdim + "px";

            // var dim = Math.round(window.innerWidth * (4 / 9));
            // map.style.width = shortdim + "px";
            // map.style.height = shortdim + "px";

            var imgInf = document.createElement('img');
            imgInf.src = "img/info.png";
            imgInf.className = "fadein";
            imgInf.height = "30px";
            imgInf.width = "30px";
            imgInf.display = "none";
            map.insertBefore(imgInf, minigrid);

            var minigrid = game.gameType.toHtml(availableSpace);
            minigrid.style.visibility = "hidden";
            map.appendChild(minigrid);

            map.addEventListener("click", function () {
                if (down) {
                    map.style.height = shortdim + "px";
                    map.style.width = shortdim + "px";
                    map.className = "down";

                    minigrid.style.visibility = "hidden";
                    imgInf.style.display = "block";

                    down = false;
                } else {
                    map.style.height = availableSpace + "px";
                    map.style.width = availableSpace + "px";
                    map.className = "";

                    imgInf.style.display = "none";
                    minigrid.style.visibility = "visible";

                    down = true;
                }
            })

        }
        createMap();
    },

    start: function () {
        game.removeEventListeners();

        do {
            game.clear();
            game.generateGrid();
        } while (game.isGameWon())

        game.addEventListeners();
    },

    generateGrid: function () {

        var frame = document.getElementById("gameFrame");
        this.squareGrid.squares = new Array(this.size);
        for (var i = 0; i < this.size; i++) {
            this.squareGrid.squares[i] = new Array(this.size);
        }


        var gridGen;
        if (app.settings.unsolvable()) {
            //gridGen = new gridGeneratorR();
            gridGen = new gridGenerator(true);
        } else {
            gridGen = new gridGenerator();
        }


        var v = 0;
        while (v < this.size * this.size) {
            var rand = gridGen.get(v);

            var ii = Math.floor(v / this.size);
            var jj = v % this.size;

            // var kocka = document.createElement("div");
            // kocka.className = "kocka";
            // kocka.style.backgroundColor = colorEnum(rand);
            var kocka = game.gameType.kockaFactory(rand);
            kocka.style.width = (game.gridHandler.unit - game.distance) + "px";
            kocka.style.height = (game.gridHandler.unit - game.distance) + "px";
            kocka.style.top = ((ii * game.gridHandler.unit) + game.distance / 2) + "px";
            kocka.style.left = ((jj * game.gridHandler.unit) + game.distance / 2) + "px";
            // kocka.style.zIndex = 99;

            // kocka.style.marginTop = distance / 2  + "px";
            // kocka.style.marginLeft = distance / 2  + "px";

            frame.appendChild(kocka);

            //adding to squareGrid
            this.squareGrid.squares[ii][jj] = new game.Square(ii, jj, rand, kocka);
            this.squareGrid.squares[ii][jj].method = this.gridHandler.onSquareStart.bind(game.squareGrid.squares[ii][jj]);
            // kocka.addEventListener(eventNameByDevice("mousedown"), this.squareGrid.squares[ii][jj].method);

            // v for increment
            v++;
        }


        function gridGenerator(unsolvable) {
            var v = 0;
            var arr = new Array(game.size);
            for (var x = 0; x < game.size; x++) {
                arr[x] = new Array(game.size)
                for (var y = 0; y < game.size; y++) {
                    arr[x][y] = v;
                    v++;

                    if (unsolvable && x == game.size - 1 && y == game.size - 1) {
                        v--;
                        var tmp = arr[x][y - 1];
                        arr[x][y - 1] = v;
                        arr[x][y] = tmp;
                    }
                }
            }

            function shuffle() {
                var times = 4 * game.size * game.size;

                while (times-- > 0) {
                    var x = Math.floor(Math.random() * game.size);
                    console.log(x, arr);

                    if (times % 2 == 0) {
                        var i = Math.floor(Math.random() * game.size);
                        while (x-- > 0) {
                            console.log("shift i", i);
                            var aux = arr[i].shift();
                            arr[i].push(aux);
                        }

                    } else {
                        var j = Math.floor(Math.random() * game.size);

                        while (x-- > 0) {
                            console.log("shift j", j);

                            var aux = arr[0][j];
                            for (var inc = 0; inc < game.size - 1; inc++) {
                                arr[inc][j] = arr[inc + 1][j];
                            }
                            arr[game.size - 1][j] = aux;
                        }
                    }
                }
            }
            shuffle();

            this.get = function (ind) {
                var ii = Math.floor(ind / game.size);
                var jj = ind % game.size;
                console.log("this.get", ii, jj, ind);

                return arr[ii][jj];
            }
        }

        function gridGeneratorR() {
            var arr = new Array(game.size * game.size);

            this.get = function () {
                var rand;
                do {
                    rand = Math.floor(Math.random() * (game.size * game.size));
                    if (arr[rand]) {
                        rand = -1;
                    } else {
                        arr[rand] = true;
                    }

                } while (rand < 0);

                return rand;
            }
        }
    },
    clear: function () {
        if (game.squareGrid.squares) {
            var frame = document.getElementById("gameFrame");
            for (var i = 0; i < game.size; i++) {
                for (var j = 0; j < game.size; j++) {
                    var node = game.squareGrid.squares[i][j].ref;
                    frame.removeChild(node);
                }
            }

            delete game.squareGrid.squares;
        }
    },

    isGameWon: function () {
        return game.gameType.isGameWon();
    },
    gameIsWon: function () {
        this.removeEventListeners();
        this.mMedia.victory();

        if (this.callbackVictory) {
            this.callbackVictory();
        }
    },

    addEventListeners: function () {
        window.addEventListener(eventNameByDevice("mousemove"), game.gridHandler.callback1);
        window.addEventListener(eventNameByDevice("mouseup"), game.gridHandler.callback2);

        for (var i = 0; i < game.size; i++) {
            for (var j = 0; j < game.size; j++) {
                var node = game.squareGrid.squares[i][j].ref;
                node.addEventListener(eventNameByDevice("mousedown"), game.squareGrid.squares[i][j].method);
            }
        }
    },
    removeEventListeners: function () {
        window.removeEventListener(eventNameByDevice("mousemove"), game.gridHandler.callback1);
        window.removeEventListener(eventNameByDevice("mouseup"), game.gridHandler.callback2);

        if (game.squareGrid.squares) {
            var frame = document.getElementById("gameFrame");
            for (var i = 0; i < game.size; i++) {
                for (var j = 0; j < game.size; j++) {
                    var node = game.squareGrid.squares[i][j].ref;
                    node.removeEventListener(eventNameByDevice("mousedown"), game.squareGrid.squares[i][j].method);
                }
            }
        }
    },
    //eventNameByDevice

    /*
mousedown -> touchstart
mousemove -> touchmove
mouseup   -> touchend
    */


    gridHandler: {
        square: undefined,
        isStart: 0,
        //directio: 0 - not set; 1 - horizontal; 2 - vertical
        offsetX: undefined,
        offsetY: undefined,


        moveX: function (dx) {
            var dist = (this.square.leftX() + dx) - (this.square.j * this.unit + game.distance / 2);
            var steps = Math.round(dist / this.unit);

            var row = this.square.i;
            var block = game.squareGrid.getRow(row);

            while (steps) {
                game.mMedia.zip();

                if (steps > 0) {
                    var element = block.pop();

                    for (var v = 0; v < game.size - 1; v++) {
                        block[v].j += 1;
                    }

                    block.unshift(element);
                    element.j = 0;
                    element.moveLeft(- game.size * this.unit);

                    steps--;
                } else {
                    var element = block.shift();

                    for (var v = 0; v < game.size - 1; v++) {
                        block[v].j -= 1;
                    }

                    block.push(element);
                    element.j = game.size - 1;
                    element.moveLeft(game.size * this.unit);

                    steps++;
                }
            }

            game.squareGrid.moveLeft(row, dx);
        },
        moveY: function (dy) {
            var dist = (this.square.topY() + dy) - (this.square.i * this.unit + game.distance / 2);
            var steps = Math.round(dist / this.unit);
            var col = this.square.j;

            // console.log("moveY dist dy steps", dist, dy, steps, this.square);
            while (steps) {
                game.mMedia.zip();

                if (steps < 0) {
                    var element = game.squareGrid.squares[0][col];
                    element.moveTop(game.size * this.unit);

                    for (var v = 0; v < game.size - 1; v++) {
                        game.squareGrid.squares[v][col] = game.squareGrid.squares[v + 1][col];
                        game.squareGrid.squares[v][col].i -= 1;
                    }
                    game.squareGrid.squares[game.size - 1][col] = element;
                    game.squareGrid.squares[game.size - 1][col].i = game.size - 1;

                    steps++;
                } else {

                    var element = game.squareGrid.squares[game.size - 1][col];
                    element.moveTop(- game.size * this.unit);

                    for (var v = game.size - 1; v > 0; v--) {
                        game.squareGrid.squares[v][col] = game.squareGrid.squares[v - 1][col];
                        game.squareGrid.squares[v][col].i += 1;
                    }
                    game.squareGrid.squares[0][col] = element;
                    game.squareGrid.squares[0][col].i = 0;

                    steps--;
                }
            }

            game.squareGrid.moveTop(col, dy);
        },

        getDirection: function () {

            // console.log("in slide", game.squareGrid.direction, this.square.leftX(), this.square.topY());
            var inPlaceLeft = (this.square.leftX() - game.distance / 2) % game.gridHandler.unit == 0;
            var inPlaceTop = (this.square.topY() - game.distance / 2) % game.gridHandler.unit == 0;

            if (inPlaceLeft && inPlaceTop) {
                var dir = 0;

                game.squareGrid.slides.forEach(function (element, ind) {
                    if (element) {
                        if (ind < game.size) {                   // && ind != this.square.i
                            dir = 1;
                        } else if (ind >= game.size) {         //&& (ind -game.size ) != this.square.j
                            if (dir == 1) console.warn("nincs rendben");

                            dir = 2;
                        }
                    }
                }, this);


                return dir;

            } else if (inPlaceTop && !inPlaceLeft) {
                return 1;
            } else if (inPlaceLeft && !inPlaceTop) {
                return 2;
            } else {
                // console.warn("Nincs sinen a dolog.");
                //game.squareGrid.reArrange();
            }
        },

        onSquareStart: function (e) {
            // console.log("onSquareStart", this);

            if (!game.gridHandler.isStart) {
                game.squareGrid.clearSlide(this.i);
                game.squareGrid.clearSlide(game.size + this.j);

                game.gridHandler.square = this;
                game.gridHandler.isStart = true;
                game.gridHandler.offsetX = mouseX(e);
                game.gridHandler.offsetY = mouseY(e);
            }
        },
        onSquareMove: function (e) {
            if (this.isStart) {
                if (!this.square) {
                    throw new DOMException("!?");
                }

                var x = mouseX(e);
                var y = mouseY(e);
                var dx = x - this.offsetX;
                var dy = y - this.offsetY;
                var dir = this.getDirection();

                if (dir) {
                    if (dir == 1) {
                        this.moveX(dx);
                    } else if (dir == 2) {
                        this.moveY(dy);
                    }

                    this.offsetX = x;
                    this.offsetY = y;
                }
                if (dir == 0) {
                    if (Math.sqrt(dx * dx + dy * dy) > 6) {
                        if (Math.abs(dx) > Math.abs(dy)) {
                            this.moveX(dx);

                        } else if (Math.abs(dy) > Math.abs(dx)) {
                            this.moveY(dy);

                        }

                        this.offsetX = x;
                        this.offsetY = y;
                    }
                }

            }
        },
        onSquareEnd: function (e) {
            // console.log("onSquareEnd", this, this.isStart);

            if (this.isStart) {
                var dir = this.getDirection();
                if (dir) {
                    game.squareGrid.slideInPosition(dir, this.square);
                }

                this.isStart = 0;
                this.square = undefined;

                if (game.isGameWon()) {
                    game.gameIsWon();

                    // navigator.notification.alert(
                    //     'You won!',  You are the winner! // message
                    //     'Game Over',            // title
                    //     'Ok'                  // buttonName
                    // );
                    // navigator.notification.beep(3);

                    alert("You won!", "Victory");
                }
            }
        }
    },

    gameTypes: {
        simple: {
            kockaFactory: function (rand) {
                var kocka = document.createElement("div");
                kocka.className = "kocka";
                kocka.style.backgroundColor = colorEnum(rand % game.size);

                return kocka;
            },

            toSimpleHtml: function (target) {
                var table = document.createElement("table");
                for (var x = 0; x < game.size; x++) {
                    var tr = document.createElement("tr");
                    for (var y = 0; y < game.size; y++) {
                        var td = document.createElement("td");
                        td.style.backgroundColor = colorEnum(target[x][y]);
                        tr.appendChild(td);
                    }

                    table.appendChild(tr);
                }
                table.classList.add("minitable");
                // table.style.width = "100%";
                // table.style.height = "100%";

                return table;
            },

            isGameWon: function () {
                var inc = 0;
                for (var i = 0; i < game.size; i++) {
                    for (var j = 0; j < game.size; j++) {
                        if (game.squareGrid.squares[i][j].value != inc) {
                            return false;
                        }

                        inc++;
                    }
                }

                return true;
            },

            ready: function () { return true; },
        },

        sequence: function (availablespace) {

            this.kockaFactory = function (rand) {
                var kocka = document.createElement("div");
                kocka.classList.add("sequencekocka");
                kocka.innerHTML = "<bold>" + (rand + 1) + "</bold>";
                kocka.style.fontSize = (game.gridHandler.unit - 20) + "px";
                return kocka;
            },

                this.toHtml = function (space) {
                    var table = document.createElement("table");
                    var inc = 0;
                    if (space) {
                        var p = space / game.size / 2;
                        table.style.fontSize = p + "px";
                    } else if (availablespace) {
                        var p = availablespace / game.size / 2;
                        table.style.fontSize = p + "px";
                    }

                    for (var x = 0; x < game.size; x++) {
                        var tr = document.createElement("tr");
                        for (var y = 0; y < game.size; y++) {
                            var td = document.createElement("td");
                            td.style.backgroundColor = "#4B946A";
                            td.innerHTML = "<bold>" + (++inc) + "</bold>";
                            td.style.textAlign = "center";

                            tr.appendChild(td);
                        }

                        table.appendChild(tr);
                    }
                    table.classList.add("minitable");

                    return table;
                },

                this.isGameWon = game.gameTypes.simple.isGameWon;
            this.ready = function () { return true; }
        },

        simpleHorizontal: function () {
            this.isGameWon = function () {
                var colors = new Array(game.size);

                for (var i = 0; i < game.size; i++) {
                    for (var j = 0; j < game.size; j++) {
                        var clr = game.squareGrid.squares[i][j].value % game.size;

                        if (j == 0) {
                            if (colors.indexOf(clr) >= 0) {
                                return false;
                            }

                            colors[i] = clr;
                        } else {
                            if (colors[i] != clr) {
                                return false;
                            }
                        }

                    }
                }

                return true;
            }

            this.target = function () {
                var arr = new Array(game.size);
                for (var i = 0; i < game.size; i++) {
                    arr[i] = new Array(game.size);
                    for (var j = 0; j < game.size; j++) {
                        arr[i][j] = i;
                    }
                }

                return arr;
            }

            this.toHtml = function () {
                var arr = this.target();
                return this.toSimpleHtml(arr);
                //game.gameTypes.toSimpleHtml(arr);
            };
        },

        simpleVertical: function () {

            this.isGameWon = function () {
                var colors = new Array(game.size);

                for (var i = 0; i < game.size; i++) {
                    for (var j = 0; j < game.size; j++) {
                        var clr = game.squareGrid.squares[j][i].value % game.size;

                        if (j == 0) {
                            if (colors.indexOf(clr) >= 0) {
                                return false;
                            }

                            colors[i] = clr;
                        } else {
                            if (colors[i] != clr) {
                                return false;
                            }
                        }

                    }
                }

                return true;
            }

            this.target = function () {
                var arr = new Array(game.size);
                for (var i = 0; i < game.size; i++) {
                    arr[i] = new Array(game.size);
                    for (var j = 0; j < game.size; j++) {
                        arr[i][j] = j;
                    }
                }

                return arr;
            }

            this.toHtml = function () {
                var arr = this.target();
                return this.toSimpleHtml(arr); // game.gameTypes.toSimpleHtml(arr);
            };
        },

        imagePuzzle: function (imgSource, store) {
            var thisCanvas;

            this.ready = function () {
                if (thisCanvas) {
                    return true;
                }

                return false;
            }
            this.imagePieces = undefined;
            this.image = new Image();
            this.image.onload = function () {
                if (!thisCanvas) {
                    console.log("image.onload processImage", this, thisCanvas);
                    // processImage(this);
                    var that = this;
                    window.setTimeout(function () { processImage(that); }, 1);
                }
            };
            this.image.src = imgSource

            // processImage.call(this, imgSource, callback.bind(this));

            this.isGameWon = game.gameTypes.simple.isGameWon;

            this.kockaFactory = function (rand) {
                if (!this.imagePieces) {
                    this.imagePieces = cutImageIntoPieces(game.gridHandler.unit, thisCanvas, game.size);
                }

                // var ret = document.createElement("img");
                // ret.src = this.imagePieces[rand];
                // ret.style.position = "absolute";

                var ret = document.createElement("div");
                //<div style='background:url(data:image/png;base64,iVBOR...ElFTkSuQmCC)repeat-x center;'></div>
                ret.style = 'background:url(' + this.imagePieces[rand] + '); position: absolute';

                return ret;
            }

            this.toHtml = function () {
                var thatImg = new window.Image()
                thatImg.src = "img/spinner_32.gif";

                if (thisCanvas) {
                    thatImg.src = thisCanvas.toDataURL();
                } else {
                    this.image.addEventListener("load", function () {
                        if (!thisCanvas) {
                            console.log("this.image.addEventListener processImage", this, thisCanvas);
                            // processImage(this);
                            var that = this;
                            window.setTimeout(function () {
                                processImage(that);
                                thatImg.src = thisCanvas.toDataURL();
                            }, 1);
                        } else {
                            thatImg.src = thisCanvas.toDataURL();
                        }

                    });
                }

                return thatImg;
            }

            function processImage(img) {
                thisCanvas = document.createElement("canvas");
                var ctx = thisCanvas.getContext("2d");
                ctx.mozImageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "medium";
                ctx.webkitImageSmoothingEnabled = true;
                ctx.msImageSmoothingEnabled = true;
                ctx.imageSmoothingEnabled = true;

                var totalsize = window.innerWidth - (window.innerWidth % game.size);
                if (store && window.localStorage["totalSize"]) {
                    totalsize = parseInt(window.localStorage["totalSize"]);
                }

                var imgTooBig = false;
                do {

                    thisCanvas.width = totalsize;
                    thisCanvas.height = totalsize;

                    redrawImage(img, ctx, totalsize)
                    if (store) {
                        var imgData = thisCanvas.toDataURL();
                        try {
                            window.localStorage.setItem("imgData", imgData);
                            imgTooBig = false;
                            window.localStorage.setItem("totalSize", totalsize);

                            console.log("totalSize", totalsize, imgData.length);
                        } catch (exc) {
                            console.warn("processImage", exc, totalsize, imgData.length);
                            imgTooBig = true;
                            if (totalsize > 1680) {
                                totalsize = 1680;
                            } else if (totalsize > 1640) {
                                totalsize = 1640;
                            } else {
                                totalsize = 1600;       // should be enough
                            }
                        }
                    }

                } while (imgTooBig);

            }
        }
    },
}

// simple inheritance?
game.gameTypes.simpleVertical.prototype = game.gameTypes.simple;
game.gameTypes.simpleHorizontal.prototype = game.gameTypes.simple;