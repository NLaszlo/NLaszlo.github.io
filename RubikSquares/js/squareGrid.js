
game.squareGrid = {
    squares: undefined,
    slides: new Array(2 * game.size),   //hashset containing all running animations

    getRow: function (x) {
        return this.squares[x];
    },
    getColumn: function (y) {
        var arr = new Array(game.size);
        for (var i = 0; i < game.size; i++) {
            arr[i] = this.squares[i][y];
        }

        return arr;
    },

    moveLeft: function (row, dist) {
        for (var j = 0; j < game.size; j++) {
            this.squares[row][j].moveLeft(dist);
        }
    },

    moveTop: function (col, dist) {
        for (var i = 0; i < game.size; i++) {

            this.squares[i][col].moveTop(dist);
        }
    },

    clearSlide: function (index) {
        var tickr = this.slides[index];
        clearInterval(tickr);

        delete this.slides[index];
    },

    slideInPosition: function (direction, square) {

        var time = 360  // max time for a slide animation in milliseconds
        var freq = 20;  // 1000 / freq = fps
        var tcount = 0;
        var rem = 0;
        var distance, dist;
        var aa = 3;     //acceleration

        var si = square.i;
        var sj = square.j;


        if (direction == 1) {
            var left = square.leftX();
            var place = sj * game.gridHandler.unit + game.distance / 2;
            distance = place - left;
            dist = distance * (freq / time) * 2 / aa;

        } else if (direction == 2) {
            var top = square.topY();
            var place = si * game.gridHandler.unit + game.distance / 2;
            distance = place - top;
            dist = distance * (freq / time) * 2 / aa;

        }


        var ticker = window.setInterval(function () {
            if (game.gridHandler.isStart &&
                ((direction == 1 && si == game.gridHandler.square.i) || (direction == 2 && sj == game.gridHandler.square.j))) {


                if (direction == 1) {
                    game.squareGrid.clearSlide(si);
                } else if (direction == 2) {
                    game.squareGrid.clearSlide(game.size + sj);
                }
            } else if (distance != 0) {
                // TODO make sure this wont run forever

                var coef = aa * (time - tcount) / time;
                var delta = coef * dist + rem;
                rem = delta % 1;
                delta = Math.round(delta - rem);        //Math.round is not needed.
                // if (delta < 1 && delta > -1) { delta = delta < 0 ? -1 : 1 ; }

                // console.log("coef dist delta", coef, dist, delta, distance, rem, tcount);
                if (Math.abs(delta) > Math.abs(distance)) {
                    delta = distance;
                }

                if (direction == 1) {
                    game.squareGrid.moveLeft(si, delta);
                } else if (direction == 2) {
                    game.squareGrid.moveTop(sj, delta);
                } else {
                }
                tcount += freq;
                distance -= delta;
            } else {
                if (direction == 1) {
                    game.squareGrid.clearSlide(si);
                } else if (direction == 2) {
                    game.squareGrid.clearSlide(game.size + sj);
                }
            }
        }, freq);


        if (direction == 1) {
            // if (game.squareGrid.slides[si]){
            //     console.error("nemjoo x", game.squareGrid.slides[si]);
            //     window.clearInterval(game.squareGrid.slides[si]);
            // }
            game.squareGrid.slides[si] = ticker;
        } else if (direction == 2) {
            // if (game.squareGrid.slides[game.size + sj]){
            //     console.error("nemjoo y", game.squareGrid.slides[sgame.size + sj]);
            //     window.clearInterval(game.squareGrid.slides[game.size + sj]);
            // }
            game.squareGrid.slides[game.size + sj] = ticker;
        }

    },

    reArrange: function () {
        for (var i = 0; i < game.size; i++) {
            for (var j = 0; j < game.size; j++) {
                var el = this.squares[i][j];
                var x = el.j * game.gridHandler.unit + game.distance / 2;
                var y = el.i * game.gridHandler.unit + game.distance / 2;
                if (el.leftX() != x) {
                    el.setLeftX(x);
                }
                if (el.topY() != y) {
                    el.setTopY(y);
                }
            }
        }
    }
}


// Square class
game.Square = function (ii, jj, r, domElement) {
    this.i = ii;
    this.j = jj;
    this.value = r;
    this.ref = domElement;

}

game.Square.prototype.leftX = function () {
    return parseInt(this.ref.style.left);
}
game.Square.prototype.setLeftX = function (left) {
    this.ref.style.left = left + "px";
}
game.Square.prototype.moveLeft = function (dist) {
    var left = parseInt(this.ref.style.left);
    left += dist;
    this.ref.style.left = left + "px";
}

game.Square.prototype.topY = function () {
    return parseInt(this.ref.style.top);
}
game.Square.prototype.setTopY = function (top) {
    this.ref.style.top = top + "px";
}
game.Square.prototype.moveTop = function (dist) {
    var top = parseInt(this.ref.style.top);
    top += dist;
    this.ref.style.top = top + "px";
}