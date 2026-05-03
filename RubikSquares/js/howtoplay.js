game.howtoplay = {
    allowStart: false,
    pass: 0,
    message1: undefined,
    highlight1: undefined,
    hand: undefined,
    htpCallback1: undefined,
    htpCallback2: undefined,
    totoggle: ["messagebox", "highlight"],

    startX: 0,
    startY: 0,

    onStart: function () {
        var menu = document.getElementById("menu");
        menu.className = "";
        document.body.className = "noanimation";

        window.setTimeout(function () {
            app.backgroundAnimation.stop();
        }, 1);


        toggleDisplay("menu");
        toggleDisplay("game");
        toggleVisibility("header");

        game.gameType = new game.gameTypes.simpleHorizontal();
        game.size = 4;

        game.create();
        game.howtoplay.create();
        game.howtoplay.start();
    },
    onBack: function () {
        this.removeEventListeners();
        this.clear();
        game.removeEventListeners();
        game.clear();

        document.body.className = "";
        window.setTimeout(function () {
            app.backgroundAnimation.start();
        }, 1000)

        document.getElementById("lblVictory").style.visibility = "hidden";
        toggleDisplay("game");
        toggleDisplay("menu");
        toggleVisibility("header")

        return true;
    },

    create: function () {
        this.pass = 0;
        this.htpCallback1 = this.onSquareMoveHtp.bind(this);
        this.htpCallback2 = this.onSquareEndHtp.bind(this);
        window.addEventListener(eventNameByDevice("mousemove"), this.htpCallback1);
        window.addEventListener(eventNameByDevice("mouseup"), this.htpCallback2);

        this.message1 = document.createElement("p");
        this.message1.className = "messagebox";
        this.message1.id = "messagebox";
        this.message1.style.animation = "game 0.4s linear";
        this.message1.style.textTransform = "none";

        this.highlight1 = document.createElement("div");
        this.highlight1.id = "highlight";
        this.highlight1.style.zIndex = 101;
        this.highlight1.style.position = "absolute";
        // this.highlight1.style.animation = "game 0.4s linear 0.4s";
        // highlight1.style.boxShadow = "0px 0px 50px 10px black;";

        this.hand = document.createElement("img");
        this.hand.width = Math.round(game.gridHandler.unit * 1.7);
        this.hand.height = Math.round(game.gridHandler.unit * 1.7);
        this.hand.src = "img/swipe_horizontally.png";
        this.hand.id = "imgHand";
        // this.hand.style.animation = "game 0.4s linear 0.4s";

    },

    start: function () {
        // console.log("HTP_START", this.pass, this);
        var frame = document.getElementById("gameFrame");
        var map = document.getElementById("map");
        var that = this;


        if (this.pass == 0) {
            var arr = [
                [0, 0, 3, 0],
                [1, 1, 0, 1],
                [2, 2, 1, 2],
                [3, 3, 2, 3]
            ]
            var pass1i = 2;
            var pass1j = 0;

            game.squareGrid.squares = new Array(game.size);
            for (var ii = 0; ii < game.size; ii++) {
                game.squareGrid.squares[ii] = new Array(game.size);
                for (var jj = 0; jj < game.size; jj++) {
                    var kocka = document.createElement("div");

                    kocka.className = "kocka";
                    kocka.style.backgroundColor = colorEnum(arr[ii][jj]);
                    kocka.style.width = (game.gridHandler.unit - game.distance) + "px";
                    kocka.style.height = (game.gridHandler.unit - game.distance) + "px";
                    kocka.style.top = ((ii * game.gridHandler.unit) + game.distance / 2) + "px";
                    kocka.style.left = ((jj * game.gridHandler.unit) + game.distance / 2) + "px";

                    frame.appendChild(kocka);

                    //adding to squareGrid
                    game.squareGrid.squares[ii][jj] = new game.Square(ii, jj, arr[ii][jj], kocka);
                    game.squareGrid.squares[ii][jj].method = this.onSquareStartHtp.bind(game.squareGrid.squares[ii][jj]);
                }
            }

            this.totoggle = ["messagebox", "highlight"];
            toggleDisplay("blanket");
            if (map.className === "down") {
                map.click();
            }
            map.style.zIndex = 102;

            this.message1.innerHTML = "Arrange the grid like shown above to win.";
            this.message1.style.bottom = (window.innerWidth / 2) + "px";

            this.highlight1.style.borderBottomLeftRadius = "12px";
            this.highlight1.style.top = "50px";
            this.highlight1.style.right = "0px";
            this.highlight1.style.width = map.clientWidth + "px";
            this.highlight1.style.height = map.clientHeight + "px";

            document.getElementsByTagName('body')[0].appendChild(this.message1);
            document.getElementsByTagName('body')[0].appendChild(this.highlight1);

            setTimeout(function () {
                that.allowStart = true;
            }, 1000);

            this.startX = 0;
            this.startY = 0;
        } else if (this.pass == 1) {
            map.style.zIndex = "";
            this.totoggle = ["messagebox", "highlight"];
            this.totoggle.forEach(function (elem, ind) {
                toggleDisplay(elem);
            });

            this.message1.innerHTML = "Swipe left or right to move squares horizontally";
            // this.message1.style.left = Math.round(game.gridHandler.unit / 2) + "px";
            this.message1.style.top = "50px";
            this.message1.style.bottom = "auto";

            this.hand.style.left = game.distance + "px";
            this.hand.style.top = Math.round(game.gridHandler.unit * 2.5) + "px";

            this.highlight1.style.borderBottomLeftRadius = "";
            this.highlight1.style.top = Math.round(2 * game.gridHandler.unit + game.distance / 2) + "px";
            this.highlight1.style.right = "auto";
            this.highlight1.style.left = 0;
            this.highlight1.style.width = game.size * game.gridHandler.unit + "px";
            this.highlight1.style.height = game.gridHandler.unit + "px";
            this.highlight1.remove();

            for (var i = 0; i < game.size; i++) {
                var kocka = game.squareGrid.squares[2][i].ref;
                kocka.addEventListener(eventNameByDevice("mousedown"), game.squareGrid.squares[2][i].method);
                kocka.classList.add("messageHtp");
            }

            frame.appendChild(this.highlight1);
            frame.appendChild(this.hand);
            this.totoggle.forEach(function (elem, ind) {
                toggleDisplay(elem);
            });
            this.totoggle = ["blanket", "messagebox", "highlight", "imgHand"];

            setTimeout(function () {
                that.allowStart = true;
            }, 2000);

        } else if (this.pass == 2) {
            this.message1.innerHTML = "Swipe up or down to move squares vertically";

            this.hand.style.left = Math.round(game.gridHandler.unit * 2.5) + "px"; game.gridHandler.unit + "px";
            this.hand.style.top = game.gridHandler.unit + "px";
            this.hand.classList.add("rotated");

            this.highlight1.style.top = 0;
            this.highlight1.style.left = Math.round(2 * game.gridHandler.unit + game.distance / 2) + "px";
            this.highlight1.style.width = game.gridHandler.unit + "px";
            this.highlight1.style.height = game.size * game.gridHandler.unit + "px";

            for (var i = 0; i < game.size; i++) {
                var kocka = game.squareGrid.squares[2][i].ref;
                kocka.removeEventListener(eventNameByDevice("mousedown"), game.squareGrid.squares[2][i].method);
                kocka.classList.remove("messageHtp");
            }
            for (var i = 0; i < game.size; i++) {
                var kocka = game.squareGrid.squares[i][2].ref;
                kocka.addEventListener(eventNameByDevice("mousedown"), game.squareGrid.squares[i][2].method);
                kocka.classList.add("messageHtp");
            }

            this.totoggle.forEach(function (elem, ind) {
                toggleDisplay(elem);
            });
            // toggleDisplay("blanket");
            // toggleDisplay("messagebox");
            // toggleDisplay("imgHand");
            // toggleDisplay("highlight");

            setTimeout(function () {
                that.allowStart = true;
            }, 2000);
        } else if (this.pass == 3) {
            // this.removeEventListeners();
            game.addEventListeners();

            this.pass++;
        } else if (this.pass >= 4) {
            // this.onBack();
        }
    },

    clear: function () {

        var blanket = document.getElementById("blanket");
        blanket.style.display = "none";

        var el = document.getElementById("messagebox");
        el.parentNode.removeChild(el);

        el = document.getElementById("imgHand");
        el.parentNode.removeChild(el);

        el = document.getElementById("highlight");
        el.parentNode.removeChild(el);
    },

    removeEventListeners: function () {
        window.removeEventListener(eventNameByDevice("mousemove"), game.howtoplay.htpCallback1);
        window.removeEventListener(eventNameByDevice("mouseup"), game.howtoplay.htpCallback2);
    },

    onSquareStartHtp: function (e) {
        if (game.howtoplay.allowStart) {
            console.log("onSquareStartHtp", game.howtoplay.pass, this);


            if (document.getElementById("blanket").style.display !== "none") {
                game.howtoplay.totoggle.forEach(function (elem, ind) {
                    toggleDisplay(elem);
                });
            }

            game.gridHandler.onSquareStart.call(this, e);
        } else if (game.howtoplay.pass >= 3) {
            game.gridHandler.onSquareStart.call(this, e);
        }
    },

    onSquareMoveHtp: function (e) {
        if (this.pass && game.gridHandler.isStart) {
            if (this.pass >= 3) {
                game.gridHandler.onSquareMove(e);
            }
            else if (this.pass == 1) {
                var x = mouseX(e);
                var dx = x - game.gridHandler.offsetX;

                this.startX += dx;
                game.gridHandler.moveX(dx);
                game.gridHandler.offsetX = x;

            } else if (this.pass == 2) {
                var y = mouseY(e);
                var dy = y - game.gridHandler.offsetY;

                this.startY += dy;
                game.gridHandler.moveY(dy);
                game.gridHandler.offsetY = y;

            }
        }
    },

    onSquareEndHtp: function (e) {

        if (game.gridHandler.isStart || !this.pass && this.allowStart) {
            console.log("onSquareendHtp", this.pass, this);

            if ((this.pass == 1 && Math.abs(this.startX) > game.gridHandler.unit / 2) || (this.pass == 2 && Math.abs(this.startY) > game.gridHandler.unit / 2) || !this.pass) {
                this.pass++;
                this.allowStart = false;
                this.start();
            } else if (this.pass >= 3) {
                this.allowStart = false;
                this.start();
            }
        }

        game.gridHandler.onSquareEnd();
    }
}