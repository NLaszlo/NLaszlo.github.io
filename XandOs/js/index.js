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

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

var Functions = {
    mouseX: function (e) {
        if (typeof e.touches != "undefined") {
            e = e.touches.item(0);
        }

        if (e.clientX) {
            return e.clientX;           //Math.round(e.clientX);
        }
        if (e.pageX) {
            return e.pageX;             //Math.round(e.pageX);
        }

        return null;
    },

    mouseY: function (e) {
        if (typeof e.touches != "undefined") {
            e = e.touches.item(0);
        }

        if (e.clientY) {
            return e.clientY;   //Math.round(e.clientY);
        }
        if (e.pageY) {
            return e.pageY;     //Math.round(e.pageY);
        }

        return null;
    },

    eventNameByDevice: function (event) {
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
            }
        }

        return event;
    },

    addScore: function (isX) {
        if (SoundOn()) {
            media_pop();
        }

        if (isX) {
            var score = parseInt(scoreX.innerHTML);
            scoreX.innerHTML = score + 1;
        } else {
            var score = parseInt(scoreO.innerHTML);
            scoreO.innerHTML = score + 1;
        }

        return true;
    },
    printMatrix: function (m) {
        for (var i = 0; i < m[0].length; i++) {
            let str = '';
            for (var j = 0; j < m.length; j++) {
                str += m[j][i] + ' ';
            }
            console.log(str);
        }
    },
    nextTurn: function () {
        is1stPlayer = !is1stPlayer;
    },
    processTime: function (strTime, val) {
        var arr = strTime.split(':');
        var hours = parseInt(arr[0]);
        var minutes = parseInt(arr[1]);
        var seconds = parseInt(arr[2]);

        seconds += val;
        if (seconds >= 60) {
            seconds = 0
            minutes++;
            if (minutes >= 60) {
                minutes = 0;
                hours++
            }
        }

        var ret = hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
        ret += ':' + (seconds < 10 ? '0' + seconds : seconds);
        return ret;
    },
    initAi: function () {
        lx = 0;
        ly = 0;
        mmove = [];
        bestval = PlayAsSecond() ? [-10000] : [10000];
        aiProgress = 0;
    },
    calcScore: function (b, strings) {
        let sc = 0, csel = false;

        for (let i = 0; i < strings.length; i++) {
            let mc = strings[i][0] * 2;

            if (strings[i][0] > 0) {
                if (b) {
                    if (strings[i].length >= mc + 1 && !csel) {        // strings[i][0] < 2
                        sc += (strings[i].length - mc * 2 - 1);
                        // sc -= mc - 1;    // min 2 left to check

                        csel = true;
                        strings[i][0] *= 8;
                        if (i < strings.length - 1 && strings[i + 1][0] == 0) {
                            b = !b;
                        }
                    } else {
                        sc += (strings[i].length - 1);
                        if (i < strings.length - 1 && strings[i + 1][0] == 0 && csel) {
                            b = !b;
                        }
                    }
                } else {
                    if (strings[i].length >= mc + 1 && !csel) {
                        sc -= (strings[i].length - mc * 2 - 1);
                        // sc += mc - 1;

                        csel = true;
                        strings[i][0] *= 8;
                        if (i < strings.length - 1 && strings[i + 1][0] == 0) {
                            b = !b;
                        }
                    } else {
                        sc -= (strings[i].length - 1);
                        if (i < strings.length - 1 && strings[i + 1][0] == 0 && csel) {
                            b = !b;
                        }
                    }
                }
            } else {
                if (b) {
                    sc -= (strings[i].length - 1);
                } else {
                    sc += (strings[i].length - 1);
                }
                b = !b;
            }
        }

        return sc;
    },
    minmaxValue: function (max, val1, val2) {
        if (max) {
            if (val1 > val2) {
                return val1;
            } else {
                return val2;
            }
        } else {
            if (val1 < val2) {
                return val1;
            } else {
                return val2;
            }
        }
    },
    calcScore1: function (b, strings, i, sc, notCsel) {

        if (i == strings.length - 1) {
            if (b) {
                if (strings[i][0] == 0) {
                    sc -= (strings[i].length - 1);
                } else {
                    sc += (strings[i].length - 1);
                }
            } else {
                if (strings[i][0] == 0) {
                    sc += (strings[i].length - 1);
                } else {
                    sc -= (strings[i].length - 1);
                }
            }

            return sc;
        } else {
            // let res = strings[i][0] > 0 ? (b ? -10000 : 10000) : (b ? 10000 : -10000);
            let res = b ? -10000 : 10000;
            if (strings[i][0] > 0) {
                let sc1;
                if (b) {
                    sc1 = sc + (strings[i].length - 1);
                } else {
                    sc1 = sc - (strings[i].length - 1);
                }

                // if (strings[i + 1][0] > 0) {    // && strings[i + 1].length == 2
                //     notCsel = true;     //TODO sameturn can be removed
                // }

                res = Functions.minmaxValue(b, Functions.calcScore1(b, strings, i + 1, sc1, notCsel), res);
            }
            if (strings[i][0] > 0 && strings[i][0] * 2 + 1 <= strings[i].length) {
                let sc1;

                // if (!(i > 0 && strings[i - 1][0] > 1)) {

                if (b) {
                    sc1 = sc + (strings[i].length - 1 - (strings[i][0] * 4));
                } else {
                    sc1 = sc - (strings[i].length - 1 - (strings[i][0] * 4));
                }

                res = Functions.minmaxValue(b, Functions.calcScore1(!b, strings, i + 1, sc1, notCsel), res);
                // }
            }
            if (strings[i][0] == 0) {
                let sc1;
                if (b) {
                    sc1 = sc - (strings[i].length - 1);
                } else {
                    sc1 = sc + (strings[i].length - 1);
                }

                res = Functions.minmaxValue(b, Functions.calcScore1(!b, strings, i + 1, sc1, notCsel), res);
            }
            if (strings[i][0] == 0 && strings[i].length > 2 && !notCsel) {
                let sc1;

                // bug fixes
                if (i > 0 && strings[i - 1][0] > 1) return res;     //&& strings[i].length == 3
                if (i > 0 && strings[i - 1][0] == 1 && strings[i - 1].length > 3) return res;
                if (i > 1 && strings[i - 1][0] == 1 && (strings[i - 2].length + strings[i - 1].length - 2) > 2) return res;     //&& strings[i - 2][0] == 1 
                if (i > 2 && strings[i - 1][0] == 1) return res;

                /////////////////////////////
                function isClosed(first, last) {
                    if ((movesMatrix[first[0]][first[1]] & 3) == 3) {   // rigth and bottom 
                        if (first[0] == movesMatrix.length - 2) {
                            return false;
                        }
                        if (first[1] == movesMatrix[0].length - 2) {
                            return false;
                        }
                        if (first[0] + 1 == last[0] && first[1] == last[1]) {
                            return true;
                        }
                        if (first[0] == last[0] && first[1] + 1 == last[1]) {
                            return true;
                        }
                    } else if ((movesMatrix[first[0]][first[1]] & 1) == 1 && (movesMatrix[first[0]][first[1] + 1] & 1) == 1) {  //left and right
                        if (first[0] == 0) {
                            return false;
                        }
                        if (first[0] == movesMatrix.length - 2) {
                            return false;
                        }
                        if (first[0] - 1 == last[0] && first[1] == last[1]) {
                            return true;
                        }
                        if (first[0] + 1 == last[0] && first[1] == last[1]) {
                            return true;
                        }
                    } else if ((movesMatrix[first[0]][first[1]] & 2) == 2 && (movesMatrix[first[0] + 1][first[1]] & 2) == 2) {  //top and bottom
                        if (first[1] == 0) {
                            return false;
                        }
                        if (first[1] == movesMatrix.length[0] - 2) {
                            return false;
                        }
                        if (first[0] == last[0] && first[1] - 1 == last[1]) {
                            return true;
                        }
                        if (first[0] == last[0] && first[1] + 1 == last[1]) {
                            return true;
                        }
                    } else if ((movesMatrix[first[0]][first[1]] & 2) == 2 && (movesMatrix[first[0]][first[1] + 1] & 1) == 1) {  //top and right
                        if (first[1] == 0) {
                            return false;
                        }
                        if (first[0] == movesMatrix.length - 2) {
                            return false;
                        }
                        if (first[0] == last[0] && first[1] - 1 == last[1]) {
                            return true;
                        }
                        if (first[0] + 1 == last[0] && first[1] == last[1]) {
                            return true;
                        }
                    } else if ((movesMatrix[first[0]][first[1]] & 1) == 1 && (movesMatrix[first[0] + 1][first[1]] & 2) == 2) {  //left and bottom
                        if (first[0] == 0) {
                            return false;
                        }
                        if (first[1] == movesMatrix.length[0] - 2) {
                            return false;
                        }
                        if (first[0] - 1 == last[0] && first[1] == last[1]) {
                            return true;
                        }
                        if (first[0] == last[0] && first[1] + 1 == last[1]) {
                            return true;
                        }
                    } else if ((movesMatrix[first[0]][first[1] + 1] & 1) == 1 && (movesMatrix[first[0] + 1][first[1]] & 2) == 2) {  //left and top   _|
                        if (first[0] == 0) {
                            return false;
                        }
                        if (first[1] == 0) {
                            return false;
                        }
                        if (first[0] - 1 == last[0] && first[1] == last[1]) {
                            return true;
                        }
                        if (first[0] == last[0] && first[1] - 1 == last[1]) {
                            return true;
                        }
                    }

                    return false;
                }

                let closed 
                if (strings[i].length < 5) closed = false;
                else {
                    let frst = strings[i][strings[i].length - 1];
                    let lst = strings[i][1];
                    closed = isClosed(frst, lst);
                    if (closed) {
                        closed = isClosed(lst, frst);
                    }
                }

                let minus = closed ? 9 : 5;
                if (b) {
                    sc1 = sc - (strings[i].length - minus);
                } else {
                    sc1 = sc + (strings[i].length - minus);
                }

                res = Functions.minmaxValue(!b, Functions.calcScore1(b, strings, i + 1, sc1, notCsel), res);
            }
            return res;
        }
    },
    nrOfSides: function (nodes, x, y) {
        let count = 0;
        if (nodes[x][y] == 3) {
            count++;
        }
        if ((nodes[x][y] & 1) == 1 && (nodes[x][y + 1] & 1) == 1 || (nodes[x + 1][y] & 2) == 2) {
            count++;
        }
        if ((nodes[x][y] & 2) == 2 && (nodes[x + 1][y] & 2) == 2 || (nodes[x][y + 1] & 1) == 1) {
            count++;
        }
        return count;
    },

    minmax: function (nodes, level, maximizing, sameturn) {
        if (minmaxLevel != 1) {
            let full = true;
            for (let i = 0; i < nodes.length - 1 && full; i++) {
                for (let j = 0; j < nodes[i].length - 1 && full; j++) {
                    if ((nodes[i][j] & 4) == 4 || (nodes[i][j] & 8) == 8 || (nodes[i][j] & 3) == 3 || ((nodes[i][j + 1] & 1) == 1 && (nodes[i + 1][j] & 2) == 2) ||
                        (((nodes[i][j] & 1) == 1 || (nodes[i][j] & 2) == 2) && (nodes[i][j + 1] & 1) == 1) ||
                        (((nodes[i][j] & 1) == 1 || (nodes[i][j] & 2) == 2) && (nodes[i + 1][j] & 2) == 2))

                    // ((nodes[i][j] & 1) == 1 && i > 0 && i < nodes.length - 1 && j < nodes[i].length - 1 && Functions.nrOfSides(nodes, i + 1, j) == 2 
                    //         &&  Functions.nrOfSides(nodes, i - 1, j) == 2 && Functions.nrOfSides(nodes, i, j + 1) == 2 ))
                    {
                        continue;
                    } else {
                        full = false;
                    }
                }
            }

            if (full) {
                // reachedFull = true;
                var score = 0;
                var strings = [];
                var nStrinCount = 0;

                let _map = new Array(size);
                for (let i = 0; i < size; i++) {
                    _map[i] = new Array(sizeVert);
                }

                for (let i = 0; i < _map.length - 1; i++) {
                    for (let j = 0; j < _map[i].length - 1; j++) {
                        if (!_map[i][j]) {
                            string = [0];

                            function calcAhead(x, y, dir) {
                                if (_map[x][y] == true) {
                                    return
                                }

                                if ((nodes[x][y] & 4) == 4) {
                                    score++;
                                    _map[x][y] = true;
                                    return;
                                }
                                else if ((nodes[x][y] & 8) == 8) {
                                    score--;
                                    _map[x][y] = true;
                                    return;
                                }

                                string.push([x, y]);
                                _map[x][y] = true;

                                if (y > 0 && (nodes[x][y] & 1) == 0 && dir != 0) {    // top
                                    // string[string.length - 1][2]
                                    calcAhead(x, y - 1, 2);
                                }
                                if (y < nodes[x].length - 2 && (nodes[x][y + 1] & 1) == 0 && dir != 2) {  // bottom
                                    calcAhead(x, y + 1, 0);
                                }
                                if (x < nodes.length - 2 && (nodes[x + 1][y] & 2) == 0 && dir != 3) {  // right
                                    calcAhead(x + 1, y, 1);
                                }
                                if (x > 0 && (nodes[x][y] & 2) == 0 && dir != 1) {  // left
                                    calcAhead(x - 1, y, 3);
                                }

                                let count = 0;
                                if ((nodes[x][y] & 1) == 0) count++;
                                if ((nodes[x][y] & 2) == 0) count++;
                                if ((nodes[x + 1][y] & 2) == 0) count++;
                                if ((nodes[x][y + 1] & 1) == 0) count++;
                                if (count == 1) {
                                    string[0]++;
                                }
                            }

                            calcAhead(i, j, 1);

                            if (string.length > 1) {
                                let added = false;
                                // if (strings.length > 0 && strings[0][0] > 0) {
                                //     let val1 = string.shift();
                                //     strings[0] = strings[0].concat(string);
                                //     strings[0][0] = val1 < strings[0][0] ? val1 : strings[0][0];
                                // } else {
                                for (let i = 0; i < strings.length && !added && string[0] > 0; i++) {
                                    if (strings[i].length > string.length || strings[i][0] == 0) {
                                        strings.splice(i, 0, string);
                                        added = true;
                                    }
                                }
                                // }
                                // while (string[0] > 1) {
                                //     if (string[0] * 2 <= string.length - 1){
                                //         string[0]--;
                                //     } else {
                                //         break;
                                //     }
                                // }
                                // if (string.length - 1 >= string[0] * 2) {
                                //     nStrinCount++;
                                // }
                                for (let i = 0; i < strings.length && !added && string[0] == 0; i++) {
                                    if (string.length < strings[i].length && strings[i][0] == 0) {
                                        strings.splice(i, 0, string);
                                        added = true;
                                    }
                                }

                                if (!added) {
                                    strings.push(string);
                                }
                            }
                        }
                    }
                }

                if (strings.length > 0) {
                    // let tmp;
                    // if (maximizing) {
                    //     tmp = -10000;
                    // } else {
                    //     tmp = 10000;
                    // }
                    // // try with and without csel
                    // for (let i = 0; i < (nStrinCount == 0 ? 1 : nStrinCount + 1); i++) {

                    //     let sc = Functions.calcScore(maximizing, strings);
                    //     if (maximizing) {
                    //         if (sc > tmp) {
                    //             tmp = sc;
                    //         }
                    //     } else {
                    //         if (sc < tmp) {
                    //             tmp = sc;
                    //         }
                    //     }
                    // }
                    // score += tmp;

                    let notCsel = minmaxLevel == 2 || (sameturn && strings[0][0] == 0) || (sameturn && strings[0][0] == 1 && strings[0].length == 2)
                    // if (!notCsel && sameturn) {
                    //     for (let v = 0 ; v<strings.length; v++){
                    //         if (strings[v][0] == 0) break;
                    //         if (strings[v][0] == 1 && strings[v].length == 2) {
                    //             notCsel = true; 
                    //             break;
                    //         }
                    //     }
                    // }

                    let sc = Functions.calcScore1(maximizing, strings, 0, 0, notCsel);
                    // if (maximizing && sc > 0) {
                    //     sc = Functions.calcScore1(maximizing, strings, 0, 0, true);
                    // } 
                    // else if (!maximizing && sc < 0) {
                    //     sc = Functions.calcScore1(maximizing, strings, 0, 0, true);
                    // }
                    score += sc;
                }

                // Functions.printMatrix(nodes);
                // console.log(score, strings);

                return [score, full];
            } else if (level <= 0) {
                var score = 0;
                for (var x = 0; x < nodes.length - 1; x++) {
                    for (var y = 0; y < nodes[x].length - 1; y++) {
                        if ((nodes[x][y] & 4) == 4) {
                            score++;
                        } else if ((nodes[x][y] & 8) == 8) {
                            score--;
                        }
                        // else {
                        // score += maximizing ? 1 : -1;
                        // }
                    }
                }

                // Functions.printMatrix(nodes);
                // console.log(maximizing, score);

                return [score, full];
            }
        } else {
            let full = true;
            for (let i = 0; i < nodes.length - 1 && full; i++) {
                for (let j = 0; j < nodes[i].length - 1 && full; j++) {
                    let nr = (int)(nodes[i][j] / 4);
                    if (nr == 0) {
                        full = false;
                    }
                }
            }

            if (level == 0 || full) {
                var score = 0;
                for (var x = 0; x < nodes.length; x++) {
                    for (var y = 0; y < nodes[x].length; y++) {

                        if ((nodes[x][y] & 4) == 4) {
                            score++;
                        } else if ((nodes[x][y] & 8) == 8) {
                            score--;
                        }

                    }
                }

                return [score, true];
            }
        }

        if (maximizing) {
            let value = [-10000];
            let results = [];
            let hasEnd = false;

            for (var x = 0; x < nodes.length; x++) {
                for (var y = 0; y < nodes[x].length; y++) {
                    if ((nodes[x][y] & 1) != 1 && x < nodes.length - 1) {               //right line
                        nodes[x][y] += 1;

                        var sameTurnTop = false, sameTurnBottom = false;
                        if (y > 0 && (nodes[x][y - 1] & 2) == 2 && (nodes[x][y - 1] & 1) == 1 && x < nodes.length - 1 && (nodes[x + 1][y - 1] & 2) == 2) {
                            nodes[x][y - 1] |= 4;
                            sameTurnTop = true;
                        }
                        if ((nodes[x][y] & 2) == 2 && x < nodes.length - 1 && (nodes[x + 1][y] & 2) == 2 && y < nodes[x].length - 1 && (nodes[x][y + 1] & 1) == 1) {
                            nodes[x][y] |= 4;
                            sameTurnBottom = true;
                        }

                        let turn = (sameTurnTop || sameTurnBottom);
                        var ret = Functions.minmax(nodes, level - 1, turn ? maximizing : !maximizing, turn)
                        nodes[x][y] -= 1;
                        if (sameTurnTop) {
                            nodes[x][y - 1] &= 11;
                        }
                        if (sameTurnBottom) {
                            nodes[x][y] &= 11;
                        }

                        if (ret[1]) {
                            hasEnd = true;
                        }
                        results.push(ret);
                    }
                    if ((nodes[x][y] & 2) != 2 && y < nodes[x].length - 1) {  //bottom line
                        nodes[x][y] += 2;

                        var sameTurnLeft = false, sameTurnRight = false;
                        if (x > 0 && (nodes[x - 1][y] & 1) == 1 && (nodes[x - 1][y] & 2) == 2 && y < nodes[x].length - 1 && (nodes[x - 1][y + 1] & 1) == 1) {
                            nodes[x - 1][y] |= 4;
                            sameTurnLeft = true;
                        }
                        if ((nodes[x][y] & 1) == 1 && y < nodes[x].length - 1 && (nodes[x][y + 1] & 1) == 1 && x < nodes.length - 1 && (nodes[x + 1][y] & 2) == 2) {
                            nodes[x][y] |= 4;
                            sameTurnRight = true;
                        }

                        let turn = (sameTurnLeft || sameTurnRight);
                        var ret = Functions.minmax(nodes, level - 1, turn ? maximizing : !maximizing, turn)
                        nodes[x][y] -= 2;
                        if (sameTurnLeft) {
                            nodes[x - 1][y] &= 11;
                        }
                        if (sameTurnRight) {
                            nodes[x][y] &= 11;
                        }

                        if (ret[1]) {
                            hasEnd = true;
                        }
                        results.push(ret);
                    }
                }
            }

            for (let v = 0; v < results.length; v++) {
                if (!results[v][1] ) {  //&& !sameturn
                    // if (level == 1) {
                    //     results[v][0] += 25;
                    // } else {
                    results[v][0] += 50;
                    // }
                }

                if (results[v][0] > value[0]) {
                    value = results[v];
                }
            }

            return value;
        } else {
            let value = [10000];
            let results = [];
            let hasEnd = false;

            for (var x = 0; x < nodes.length; x++) {
                for (var y = 0; y < nodes[x].length; y++) {
                    if ((nodes[x][y] & 1) != 1 && x < nodes.length - 1) {               //right line
                        nodes[x][y] += 1;

                        var sameTurnTop = false, sameTurnBottom = false;
                        if (y > 0 && (nodes[x][y - 1] & 2) == 2 && (nodes[x][y - 1] & 1) == 1 && x < nodes.length - 1 && (nodes[x + 1][y - 1] & 2) == 2) {
                            nodes[x][y - 1] |= 8;        // replace with | 8
                            sameTurnTop = true;
                        }
                        if ((nodes[x][y] & 2) == 2 && x < nodes.length - 1 && (nodes[x + 1][y] & 2) == 2 && y < nodes[x].length - 1 && (nodes[x][y + 1] & 1) == 1) {
                            nodes[x][y] |= 8;
                            sameTurnBottom = true;
                        }

                        let turn = (sameTurnTop || sameTurnBottom);
                        let ret = Functions.minmax(nodes, level - 1, turn ? maximizing : !maximizing, turn)
                        nodes[x][y] -= 1;
                        if (sameTurnTop) {
                            nodes[x][y - 1] &= 7;
                        }
                        if (sameTurnBottom) {
                            nodes[x][y] &= 7;
                        }

                        if (ret[1]) {
                            hasEnd = true;
                        }
                        results.push(ret);
                    }
                    if ((nodes[x][y] & 2) != 2 && y < nodes[x].length - 1) {  //bottom line
                        nodes[x][y] += 2;

                        var sameTurnLeft = false, sameTurnRight = false;
                        if (x > 0 && (nodes[x - 1][y] & 1) == 1 && (nodes[x - 1][y] & 2) == 2 && y < nodes[x].length - 1 && (nodes[x - 1][y + 1] & 1) == 1) {
                            nodes[x - 1][y] |= 8;
                            sameTurnLeft = true;
                        }
                        if ((nodes[x][y] & 1) == 1 && y < nodes[x].length - 1 && (nodes[x][y + 1] & 1) == 1 && x < nodes.length - 1 && (nodes[x + 1][y] & 2) == 2) {
                            nodes[x][y] |= 8;
                            sameTurnRight = true;
                        }

                        let turn = (sameTurnLeft || sameTurnRight);
                        let ret = Functions.minmax(nodes, level - 1, turn ? maximizing : !maximizing, turn)
                        nodes[x][y] -= 2;
                        if (sameTurnLeft) {
                            nodes[x - 1][y] &= 7;
                        }
                        if (sameTurnRight) {
                            nodes[x][y] &= 7;
                        }

                        if (ret[1]) {
                            hasEnd = true;
                        }
                        results.push(ret);
                    }
                }
            }

            for (let v = 0; v < results.length; v++) {
                if (!results[v][1] ) {  //&& !sameturn
                    // if (level == 1) {
                    //     results[v][0] -= 25;
                    // } else {
                    results[v][0] -= 50;
                    // }
                }

                if (results[v][0] < value[0]) {
                    value = results[v];
                }
            }

            return value;
        }
    }
}
/*
function setGradient(x, y, w, h, c1, c2, isYaxis) {
    noFill();

    if (isYaxis) {
        // Top to bottom gradient
        for (let i = y; i <= y + h; i++) {
            let inter = map(i, y, y + h, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(x, i, x + w, i);
        }
    } else if (isYaxis == false) {
        // Left to right gradient
        for (let i = x; i <= x + w; i++) {
            let inter = map(i, x, x + w, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(i, y, i, y + h);
        }
    }
}
*/


// Globals
var size;
var sizeVert;
var minmaxLevel = 3;
var minmaxCount;
var lerper = 0;
var clStartX, clStartY;
var clX, clY, lx, ly;
var mousedown = false;
var lastMove = new Array(4);
var lastAiMove;
var bestval;
var mmove = [];
var movesMatrix;
var is1stPlayer = true;
var againstAi = true;
var gameOver = false;
var aiProgress = 0;
var inGame = false;
// var reachedFull;

// var c1, c2;
var animation = [[true, 0, undefined, undefined], [false, 0, undefined, undefined]];
var sizeInPx;
var lineWeightInPx;
var scoreX, scoreO;

function setup() {
    // Create Canvas of given size  
    createCanvas(window.innerWidth, window.innerHeight - 3);

    let font = loadFont('assets/ times.ttf');
    textFont(font);
    textSize(32 * width / 414);
    textAlign(CENTER, CENTER);

    // c1 = color('#E4E4E4');
    // c2 = color('#A7A7A7');

    scoreX = document.querySelector('#score .x');
    scoreO = document.querySelector('#score .o');

    // backgroundImage = loadImage('./sounds/background.png');
    // alert(backgroundImage);

    canvas = document.getElementsByTagName('canvas')[0];
    canvas.addEventListener(Functions.eventNameByDevice("mousemove"), function (e) {
        if (mousedown) {
            clX = Functions.mouseX(e);
            clY = Functions.mouseY(e);
        }
    }, false);
    canvas.addEventListener(Functions.eventNameByDevice("mousedown"), function (e) {
        mousedown = true;

        clX = clStartX = Functions.mouseX(e);
        clY = clStartY = Functions.mouseY(e);

    }, false);
    canvas.addEventListener(Functions.eventNameByDevice("mouseup"), function (e) {
        mousedown = false;

    }, false);
    // canvas.addEventListener("mouseout", function (e) {
    //     console.log("mouseout");
    //     mousedown = false;
    // }, false);
}

function draw() {

    // setGradient(0, 0, width, height, c1, c2, true);
    // stroke(color('black'));
    background('#E4E4E4');

    if (!inGame) {
        noStroke();
        let msize = 60;

        for (let i = 0; i < animation.length; i++) {
            if (animation[i][0]) {
                if (i % 2 == 0) {
                    fill(color('red'));
                } else {
                    fill(color('blue'));
                }
                animation[i][1] = (animation[i][1] + (deltaTime / 50));

                if (animation[i][2] == undefined) {
                    animation[i][2] = Math.random() * width;
                    animation[i][3] = Math.random() * height;
                }
                if (animation[i][1] > msize) {
                    animation[i][3] = animation[i][2] = undefined;
                    animation[i][1] = 0;
                }
                if (i < animation.length - 1 && !animation[i + 1][0] && (int)(animation[i][1]) == msize / 2) {
                    animation[i + 1][0] = true
                }

                rect(animation[i][2] - animation[i][1] / 2, animation[i][3] - animation[i][1] / 2, animation[i][1], animation[i][1])
            }
        }

        return;
    } else {
        stroke(0, 0, 0);
    }

    // noStroke();
    // let c = color('#555');
    // stroke(color('black'));
    // noStroke();
    // fill(0);
    // text('X', 100, 100);
    // stroke(color('black'));

    sizeInPx = width / (size + 1)
    lineWeightInPx = 10 * width / 414;

    if (!movesMatrix) {
        movesMatrix = [];
        for (var i = 0; i < size; i++) {
            movesMatrix.push(new Array(sizeVert));
            for (var j = 0; j < sizeVert; j++) {
                movesMatrix[i][j] = 0;
            }
        }

        // movesMatrix = [[3, 2, 2, 0], [1, 2, 2, 1], [2, 2, 0, 1], [2, 2, 2, 0]];
        // movesMatrix = [[0, 3, 2, 0], [0, 1, 2, 1], [2, 2, 0, 1], [2, 2, 2, 0]];
        // movesMatrix = [[3, 2, 3, 0], [1, 1, 1, 0], [1, 1, 2, 0], [0, 2, 0, 0]];     
        // movesMatrix = [[3, 2, 3, 0], [1, 1, 3, 0], [1, 1, 1, 0], [0, 0, 0, 0]];     // hard-on itt hibas
        // movesMatrix = [[3, 2, 3, 0], [1, 1, 3, 0], [1, 1, 0, 0], [0, 0, 0, 0]];         // itt a -50 elrontja    mediumon jol megy 
        // movesMatrix = [[3, 2, 2, 1], [0, 11, 1, 0], [2, 2, 2, 0], [0, 0, 0, 0]];        
        // movesMatrix = [[3, 2, 2, 0], [1, 3, 2, 0], [1, 1, 3, 0], [0, 0, 0, 0]];
        // movesMatrix = [[1, 0, 1, 0], [3, 2, 3, 0], [1, 1, 1, 0], [0, 0, 2, 0]];
        // movesMatrix = [[0, 3, 2, 0, 1], [0, 1, 2, 1, 1], [2, 2, 0, 1, 1], [2, 2, 2, 0, 1], [2, 2, 2, 2, 0]];        
        // movesMatrix = [[0, 0, 2, 0, 1], [0, 1, 2, 1, 1], [2, 2, 0, 1, 1], [2, 2, 2, 0, 1], [2, 2, 2, 2, 0]];        // a -50 elrontja  
        // movesMatrix = [[3, 2, 3, 2, 1], [0, 1, 0, 1, 0], [2, 2, 2, 2, 1], [2, 2, 2, 0, 1], [2, 2, 2, 2, 0]];
        // movesMatrix = [[3, 2, 3, 2, 0], [1, 1, 1, 2, 0], [1, 1, 1, 3, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]];        //hardon itt kicsit hibas // -50 el mar nem
        // movesMatrix = [[3, 2, 3, 0, 1], [1, 1, 3, 2, 1], [1, 1, 1, 1, 1], [1, 0, 1, 1, 1], [2, 2, 0, 0, 0]];        // hardon nem igazan helyes
        // movesMatrix = [[3, 2, 3, 0, 1], [1, 1, 3, 2, 1], [1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [2, 2, 2, 2, 0]];        // hardon nem igazan helyes
        // movesMatrix = [[3, 2, 2, 2, 1], [1, 3, 2, 0, 1], [1, 1, 3, 0, 1], [1, 1, 1, 2, 0], [0, 0, 0, 2, 0]];            //hardon pici hiba
        // movesMatrix = [[3, 2, 2, 1, 1], [1, 2, 1, 1, 1], [3, 0, 1, 1, 1], [1, 2, 0, 1, 0], [2, 2, 0, 2, 0]];         
        // movesMatrix = [[2, 2, 2, 1, 1], [3, 2, 0, 1, 1], [1, 2, 2, 1, 1], [1, 2, 0, 1, 0], [2, 2, 2, 2, 0]];            // mediumon pici hiba
        // movesMatrix = [[2, 3, 2, 2, 1], [0, 1, 3, 0, 1], [2, 0, 1, 2, 1], [3, 2, 2, 1, 1], [0, 0, 0, 0, 0]];        //h
        // movesMatrix = [[2, 3, 2, 2, 1], [0, 1, 3, 0, 1], [2, 0, 1, 2, 1], [3, 2, 2, 1, 1], [2, 0, 0, 0, 0]];     // kis hiba h
        // movesMatrix = [[2, 3, 2, 0, 1], [0, 1, 3, 2, 1], [2, 0, 1, 2, 1], [3, 2, 2, 7, 1], [0, 2, 0, 2, 0]];        //nem joo
        // movesMatrix = [[2, 3, 2, 2, 1], [1, 1, 2, 0, 1], [3, 2, 3, 2, 0], [0, 1, 1, 3, 0], [2, 0, 0, 0, 0]];
    }

    for (let x = 0, i = 0; i < size; i++) {
        x += sizeInPx;

        for (let y = 0, j = 0; j < sizeVert; j++) {
            y += sizeInPx;

            // ctx.arc(x, y, lineWeight, 0, 2 * Math.PI);
            // ctx.fill();
            let l = lerp(lerper, lineWeightInPx, 0.01)
            strokeWeight(l);
            lerper = l;

            point(x, y);
        }
    }

    // for (var i = 0; i < moves.length; i++) {
    //     line(moves[i][0] * sizeInPx, moves[i][1] * sizeInPx, moves[i][2] * sizeInPx, moves[i][3] * sizeInPx);
    // }


    // for (let x = 0; x < size; x++) {
    //     for (let y = 0; y < sizeVert; y++) {
    //         if (scoreMatrix[x][y] == 1) {
    //             text('X', (x + 1) * sizeInPx + sizeInPx / 2, (y + 1) * sizeInPx + sizeInPx / 2 - 8);
    //         } else if (scoreMatrix[x][y] == 2) {
    //             text('O', (x + 1) * sizeInPx + sizeInPx / 2, (y + 1) * sizeInPx + sizeInPx / 2 - 8);
    //         }
    //     }
    // }

    let gameWon = true;
    for (let x = 0; x < movesMatrix.length; x++) {
        for (let y = 0; y < movesMatrix[x].length; y++) {
            if (lastMove[2] && lastMove[3]) {
                line(lastMove[0] * sizeInPx, lastMove[1] * sizeInPx, lastMove[2] * sizeInPx, lastMove[3] * sizeInPx);
            }


            if ((movesMatrix[x][y] & 1) == 1) {
                if (againstAi && lastAiMove && lastAiMove[0] == x && lastAiMove[1] == y && lastAiMove[2] == 1) {
                    if (lastAiMove[3]) {
                        stroke(color('red'));
                    } else {
                        stroke(color('blue'));
                    }
                }

                line((x + 1) * sizeInPx, (y + 1) * sizeInPx, (x + 2) * sizeInPx, (y + 1) * sizeInPx);
                stroke(0, 0, 0);
            }
            if ((movesMatrix[x][y] & 2) == 2) {
                if (againstAi && lastAiMove && lastAiMove[0] == x && lastAiMove[1] == y && lastAiMove[2] == 2) {
                    if (lastAiMove[3]) {
                        stroke(color('red'));
                    } else {
                        stroke(color('blue'));
                    }
                }

                line((x + 1) * sizeInPx, (y + 1) * sizeInPx, (x + 1) * sizeInPx, (y + 2) * sizeInPx);
                stroke(0, 0, 0);
            }
            if ((movesMatrix[x][y] & 4) == 4) {
                fill(color('red'));
                noStroke();
                // text('X', (x + 1) * sizeInPx + sizeInPx / 2, (y + 1) * sizeInPx + sizeInPx / 2 - 4);   //- 8
                let blocksize = sizeInPx - lineWeightInPx;
                rect((x + 1) * sizeInPx + lineWeightInPx / 2, (y + 1) * sizeInPx + lineWeightInPx / 2, blocksize, blocksize);
                stroke(0, 0, 0);
                strokeWeight(lineWeightInPx);
                fill(color('black'));

            } else if ((movesMatrix[x][y] & 8) == 8) {
                fill(color('blue'));
                noStroke();
                // text('O', (x + 1) * sizeInPx + sizeInPx / 2, (y + 1) * sizeInPx + sizeInPx / 2 - 4);   //- 8
                let blocksize = sizeInPx - lineWeightInPx;
                rect((x + 1) * sizeInPx + lineWeightInPx / 2, (y + 1) * sizeInPx + lineWeightInPx / 2, blocksize, blocksize);
                stroke(0, 0, 0);
                strokeWeight(lineWeightInPx);
                fill(color('black'));

            } else if (x < movesMatrix.length - 1 && y < movesMatrix[x].length - 1) {
                gameWon = false;
            }
        }
    }

    if (gameWon && !gameOver) {
        gameOver = true;
        lastAiMove = undefined;
        setTimeout(() => {
            let scorex = parseInt(scoreX.innerHTML);
            let scoreo = parseInt(scoreO.innerHTML);
            if (SoundOn()) {
                media_victory();
            }

            if (scorex > scoreo) {
                alert('Player 1 won');
            } else if (scorex == scoreo) {
                alert('Draw');
            } else {
                alert('Player 2 won');
            }
        }, 0);
    }

    if (mousedown && clStartX > sizeInPx / 2 && clStartY > sizeInPx / 2 && clStartX < sizeInPx * size + sizeInPx / 2 && clStartY < sizeInPx * sizeVert + sizeInPx / 2       // if tap is inbetween bounds
        && (!againstAi || ((is1stPlayer && !PlayAsSecond()) || (!is1stPlayer && PlayAsSecond())))) {

        let onx = clStartX % sizeInPx;
        if (onx > sizeInPx / 2) {
            onx = - sizeInPx + onx;
        }
        clStartX = clStartX - onx;

        let ony = clStartY % sizeInPx;
        if (ony > sizeInPx / 2) {
            ony = - sizeInPx + ony;
        }
        clStartY = clStartY - ony;

        let boundSize = lineWeightInPx;
        // var vict = new Victor(clX - clStartX, clY - clStartY);
        let a = clX - clStartX, b = clY - clStartY;
        let vLength = Math.sqrt(a * a + b * b);
        if (vLength >= sizeInPx) {
            let r = (sizeInPx) / vLength;
            clX = a * r + clStartX;
            clY = b * r + clStartY;
        }

        const coordX = Math.round(clStartX / sizeInPx);
        const coordY = Math.round(clStartY / sizeInPx);

        lastMove[0] = coordX;
        lastMove[1] = coordY;
        // console.log('coord x, y', coordX, coordY);

        if (is1stPlayer) {
            stroke(color('red'));
        } else {
            stroke(color('blue'));
        }

        if (coordY > 1 && clStartY - clY <= sizeInPx + boundSize && clStartY - clY >= sizeInPx - boundSize &&
            clX <= clStartX + boundSize && clX >= clStartX - boundSize) {             // bound to top
            line(clStartX, clStartY, clStartX, (coordY - 1) * sizeInPx);
            lastMove[2] = coordX;
            lastMove[3] = coordY - 1;
        } else if (coordX < size && clX - clStartX <= sizeInPx + boundSize && clX - clStartX >= sizeInPx - boundSize
            && clY <= clStartY + boundSize && clY >= clStartY - boundSize) {          // bound to right
            line(clStartX, clStartY, (coordX + 1) * sizeInPx, clStartY);
            lastMove[2] = coordX + 1;
            lastMove[3] = coordY;
        } else if (coordY < sizeVert && clY - clStartY <= sizeInPx + boundSize && clY - clStartY >= sizeInPx - boundSize &&
            clX <= clStartX + boundSize && clX >= clStartX - boundSize) {             // bound to bottom
            line(clStartX, clStartY, clStartX, (coordY + 1) * sizeInPx);
            lastMove[2] = coordX;
            lastMove[3] = coordY + 1;
        } else if (coordX > 1 && clStartX - clX <= sizeInPx + boundSize && clStartX - clX >= sizeInPx - boundSize
            && clY <= clStartY + boundSize && clY >= clStartY - boundSize) {          // bound to left
            line(clStartX, clStartY, (coordX - 1) * sizeInPx, clStartY);
            lastMove[2] = coordX - 1;
            lastMove[3] = coordY;
        } else {
            line(clStartX, clStartY, clX, clY);
            lastMove[2] = null;
            lastMove[3] = null;
        }
        stroke(0, 0, 0);

    } else if (!mousedown) {
        if (lastMove[2] && lastMove[3]) {

            let left, rigth, top, bottom, newline = false;
            if (lastMove[0] != lastMove[2]) {
                let cx = lastMove[0] < lastMove[2] ? lastMove[0] : lastMove[2];
                if ((movesMatrix[cx - 1][lastMove[1] - 1] & 1) != 1) {      // if doesnt exist    
                    movesMatrix[cx - 1][lastMove[1] - 1] += 1;
                    newline = true;

                    if (lastMove[1] > 1 && (movesMatrix[cx - 1][lastMove[1] - 2] & 1) == 1 && (movesMatrix[cx - 1][lastMove[1] - 2] & 2) == 2 && cx < movesMatrix.length && (movesMatrix[cx][lastMove[1] - 2] & 2) == 2) {
                        top = true;
                        movesMatrix[cx - 1][lastMove[1] - 2] += is1stPlayer ? 4 : 8;
                        Functions.addScore(is1stPlayer);
                    }
                    if (lastMove[1] < movesMatrix[cx - 1].length && (movesMatrix[cx - 1][lastMove[1]] & 1) == 1 && (movesMatrix[cx - 1][lastMove[1] - 1] & 2) == 2 && cx < movesMatrix.length && (movesMatrix[cx][lastMove[1] - 1] & 2) == 2) {
                        bottom = true;
                        movesMatrix[cx - 1][lastMove[1] - 1] += is1stPlayer ? 4 : 8;
                        Functions.addScore(is1stPlayer);
                    }
                }
            } else if (lastMove[1] != lastMove[3]) {
                let cy = lastMove[1] < lastMove[3] ? lastMove[1] : lastMove[3];
                if ((movesMatrix[lastMove[0] - 1][cy - 1] & 2) != 2) {      // if doesnt exist
                    movesMatrix[lastMove[0] - 1][cy - 1] += 2;
                    newline = true;

                    if (lastMove[0] > 1 && (movesMatrix[lastMove[0] - 2][cy - 1] & 2) == 2 && (movesMatrix[lastMove[0] - 2][cy - 1] & 1) == 1 && cy < movesMatrix[lastMove[0] - 2].length && (movesMatrix[lastMove[0] - 2][cy] & 1) == 1) {
                        left = true;
                        movesMatrix[lastMove[0] - 2][cy - 1] += is1stPlayer ? 4 : 8;
                        Functions.addScore(is1stPlayer);
                    }
                    if (lastMove[0] < movesMatrix.length && (movesMatrix[lastMove[0]][cy - 1] & 2) == 2 && (movesMatrix[lastMove[0] - 1][cy - 1] & 1) == 1 && cy < movesMatrix[lastMove[0] - 1].length && (movesMatrix[lastMove[0] - 1][cy] & 1) == 1) {
                        rigth = true;
                        movesMatrix[lastMove[0] - 1][cy - 1] += is1stPlayer ? 4 : 8;
                        Functions.addScore(is1stPlayer);
                    }
                }
            }
            if (newline && againstAi) {
                lastAiMove = undefined;
            }

            if (!(left || rigth || top || bottom) && newline) {
                Functions.nextTurn();

                if (againstAi && ((!is1stPlayer && !PlayAsSecond()) || (is1stPlayer && PlayAsSecond()))) {
                    Functions.initAi();
                }
            }
            // Functions.printMatrix(movesMatrix);

            if (SoundOn()) {
                media_zip();
            }

            lastMove[2] = null;
            lastMove[3] = null;
        }
    }

    if (againstAi && !gameOver && ((!is1stPlayer && !PlayAsSecond()) || (is1stPlayer && PlayAsSecond()))) {

        if (lx < movesMatrix.length) {  //&& ly < movesMatrix[lx].length

            if ((movesMatrix[lx][ly] & 1) != 1 && lx < movesMatrix.length - 1) {
                movesMatrix[lx][ly] += 1;

                let sameTurnTop = false, sameTurnBottom = false;
                if (ly > 0 && (movesMatrix[lx][ly - 1] & 2) == 2 && (movesMatrix[lx][ly - 1] & 1) == 1 && lx < movesMatrix.length - 1 && (movesMatrix[lx + 1][ly - 1] & 2) == 2) {
                    movesMatrix[lx][ly - 1] |= is1stPlayer ? 4 : 8;
                    sameTurnTop = true;
                }
                if ((movesMatrix[lx][ly] & 2) == 2 && lx < movesMatrix.length - 1 && (movesMatrix[lx + 1][ly] & 2) == 2 && ly < movesMatrix[lx].length - 1 && (movesMatrix[lx][ly + 1] & 1) == 1) {
                    movesMatrix[lx][ly] |= is1stPlayer ? 4 : 8;
                    sameTurnBottom = true;
                }

                let turn;
                // if (!PlayAsSecond()) {
                turn = (sameTurnBottom || sameTurnTop) ? is1stPlayer : !is1stPlayer;
                // } else {
                //     turn = (sameTurnBottom || sameTurnTop) ? !is1stPlayer : is1stPlayer;
                // }
                let val = Functions.minmax(movesMatrix, (int)(minmaxCount), turn, (sameTurnBottom || sameTurnTop));
                movesMatrix[lx][ly] -= 1;
                if (sameTurnTop) {
                    movesMatrix[lx][ly - 1] &= is1stPlayer ? 11 : 7;
                }
                if (sameTurnBottom) {
                    movesMatrix[lx][ly] &= is1stPlayer ? 11 : 7;
                }

                if (!val[1]) {
                    if (PlayAsSecond()) {
                        val[0] -= 50;
                    } else {
                        val[0] += 50;
                    }
                }

                // console.log(val);
                if (val[0] == bestval[0]) {
                    mmove.push([lx, ly, 1]);
                    // console.log(val, lx, ly, 1, mmove);
                }
                if (!is1stPlayer && !PlayAsSecond()) {
                    if (val[0] < bestval[0]) {
                        bestval = val;
                        mmove = [];
                        mmove.push([lx, ly, 1]);
                        // console.log(val, lx, ly, 1, mmove);
                    }
                }
                if (is1stPlayer && PlayAsSecond()) {
                    if (val[0] > bestval[0]) {
                        bestval = val;
                        mmove = [];
                        mmove.push([lx, ly, 1]);
                        // console.log(val, lx, ly, 1, mmove);
                    }
                }
            }
            if ((movesMatrix[lx][ly] & 2) != 2 && ly < movesMatrix[lx].length - 1) {
                movesMatrix[lx][ly] += 2;

                let sameTurnLeft = false, sameTurnRight = false;
                if (lx > 0 && (movesMatrix[lx - 1][ly] & 1) == 1 && (movesMatrix[lx - 1][ly] & 2) == 2 && ly < movesMatrix[lx].length - 1 && (movesMatrix[lx - 1][ly + 1] & 1) == 1) {
                    movesMatrix[lx - 1][ly] |= is1stPlayer ? 4 : 8;
                    sameTurnLeft = true;
                }
                if ((movesMatrix[lx][ly] & 1) == 1 && ly < movesMatrix[lx].length - 1 && (movesMatrix[lx][ly + 1] & 1) == 1 && lx < movesMatrix.length - 1 && (movesMatrix[lx + 1][ly] & 2) == 2) {
                    movesMatrix[lx][ly] |= is1stPlayer ? 4 : 8;
                    sameTurnRight = true;
                }

                let turn
                // if (!PlayAsSecond()) {
                turn = (sameTurnLeft || sameTurnRight) ? is1stPlayer : !is1stPlayer;
                // } else {
                //     turn = (sameTurnLeft || sameTurnRight) ? !is1stPlayer : is1stPlayer;
                // }
                let val = Functions.minmax(movesMatrix, (int)(minmaxCount), turn, (sameTurnLeft || sameTurnRight))
                movesMatrix[lx][ly] -= 2;
                if (sameTurnLeft) {
                    movesMatrix[lx - 1][ly] &= is1stPlayer ? 11 : 7;
                }
                if (sameTurnRight) {
                    movesMatrix[lx][ly] &= is1stPlayer ? 11 : 7;
                }

                if (!val[1]) {
                    if (PlayAsSecond()) {
                        val[0] -= 50;
                    } else {
                        val[0] += 50;
                    }
                }

                // console.log(val);
                if (val[0] == bestval[0]) {
                    mmove.push([lx, ly, 2]);
                    // console.log(val, lx, ly, 2, mmove);
                }
                if (!is1stPlayer && !PlayAsSecond()) {
                    if (val[0] < bestval[0]) {
                        bestval = val;
                        mmove = [];
                        mmove.push([lx, ly, 2]);
                        // console.log(val, lx, ly, 1, mmove);
                    }
                }
                if (is1stPlayer && PlayAsSecond()) {
                    if (val[0] > bestval[0]) {
                        bestval = val;
                        mmove = [];
                        mmove.push([lx, ly, 2]);
                        // console.log(val, lx, ly, 1, mmove);
                    }
                }
            }

            ly++;
            if (ly == movesMatrix[lx].length) {
                ly = 0;
                lx++;
            }

            aiProgress++;
            strokeWeight(4);
            line(0, 0, aiProgress * width / (size * sizeVert), 0);
            strokeWeight(lineWeightInPx);
        }

        // let lblTime = document.getElementById(is1stPlayer ? 'timeForX' : 'timeForO');
        // let ret = Functions.processTime(lblTime.innerHTML, 1);
        // lblTime.innerHTML = ret;
        if (mmove.length > 0 && lx == movesMatrix.length) {
            let left, rigth, top, bottom;
            let rand = Math.floor(Math.random() * Math.floor(mmove.length));     // TODO uncomment
            let x = mmove[rand][0];
            let y = mmove[rand][1];
            movesMatrix[x][y] += mmove[rand][2];

            lastAiMove = [x, y, mmove[rand][2], is1stPlayer];

            if (mmove[rand][2] == 1) {
                if (y > 0 && (movesMatrix[x][y - 1] & 2) == 2 && (movesMatrix[x][y - 1] & 1) == 1 && x < movesMatrix.length - 1 && (movesMatrix[x + 1][y - 1] & 2) == 2) {
                    movesMatrix[x][y - 1] |= is1stPlayer ? 4 : 8;
                    top = true;
                    Functions.addScore(is1stPlayer);
                }
                if ((movesMatrix[x][y] & 2) == 2 && x < movesMatrix.length - 1 && (movesMatrix[x + 1][y] & 2) == 2 && y < movesMatrix[x].length - 1 && (movesMatrix[x][y + 1] & 1) == 1) {
                    movesMatrix[x][y] |= is1stPlayer ? 4 : 8;
                    bottom = true;
                    Functions.addScore(is1stPlayer);
                }
            }
            if (mmove[rand][2] == 2) {
                if (x > 0 && (movesMatrix[x - 1][y] & 1) == 1 && (movesMatrix[x - 1][y] & 2) == 2 && y < movesMatrix[x].length - 1 && (movesMatrix[x - 1][y + 1] & 1) == 1) {
                    movesMatrix[x - 1][y] |= is1stPlayer ? 4 : 8;
                    left = true;
                    Functions.addScore(is1stPlayer);
                }
                if ((movesMatrix[x][y] & 1) == 1 && y < movesMatrix[x].length - 1 && (movesMatrix[x][y + 1] & 1) == 1 && x < movesMatrix.length - 1 && (movesMatrix[x + 1][y] & 2) == 2) {
                    movesMatrix[x][y] |= is1stPlayer ? 4 : 8;
                    rigth = true;
                    Functions.addScore(is1stPlayer);
                }
            }

            if (!(left || rigth || top || bottom)) {
                Functions.nextTurn();
            } else {
                if (againstAi && ((!is1stPlayer && !PlayAsSecond()) || (is1stPlayer && PlayAsSecond()))) {
                    Functions.initAi();
                }
            }

            if (SoundOn()) {
                media_zip();
            }

            let auxMinMaxLevel = 3;
            if (minmaxLevel != 1) {
                auxMinMaxLevel = minmaxLevel;
            }

            if (size == 4 && minmaxCount <= auxMinMaxLevel) {
                minmaxCount += 1;
            } else if (size == 5 && minmaxCount < auxMinMaxLevel) {
                if (minmaxCount >= 3.8) {
                    minmaxCount += 0.2;
                } else {
                    minmaxCount += 0.4;
                }
            }
            else if (size == 6 && minmaxCount < auxMinMaxLevel && minmaxCount <= 3) {
                if (minmaxCount >= 3.5) {
                    minmaxCount += 0.14;
                } else {
                    minmaxCount += 0.20;
                }
            }
            if (minmaxCount > auxMinMaxLevel && size > 4) {
                minmaxCount = auxMinMaxLevel;
            }

            // console.log(minmaxLevel, auxMinMaxLevel, minmaxCount);
        }
        else if (mmove.length == 0 && lx == movesMatrix.length) {
            gameOver = true;
            lastAiMove = undefined;
            Functions.nextTurn();
        }
    }
}

var media_victory;
var media_pop;
var media_zip;

function SoundOn() {
    return window.localStorage['soundOn'] == 'true';
}

function PlayAsSecond() {
    return window.localStorage['playAsSecond'] == 'true' ? true : false;
}

function InitGame() {
    lerper = 0;
    mousedown = false;
    lastMove = new Array(4);
    movesMatrix = undefined;
    is1stPlayer = true;
    gameOver = false;
    lastAiMove = undefined;
    // reachedFull = false;
    if (PlayAsSecond()) {
        Functions.initAi();
    }

    minmaxCount = 1;    //todo minmaxCount = 1

    document.querySelector('#score #timeForX').innerHTML = '0:00:00';
    document.querySelector('#score #timeForO').innerHTML = '0:00:00';
    scoreX.innerHTML = '0';
    scoreO.innerHTML = '0';

    inGame = true;
}

function GameResume() {
    var gridSize = document.getElementById('gridSize');
    size = sizeVert = parseInt(gridSize.value);

    var scorePanel = document.getElementById('menu');
    scorePanel.style.display = 'none';
    var scorePanel = document.getElementById('score');
    scorePanel.style.display = 'flex';
}


function onDeviceReady() {
    if (window.localStorage['soundOn'] == undefined) {
        window.localStorage['soundOn'] = true;
    }

    function onAudioSuccess(e) {
        // console.log("onAudioSuccess", this, e)
    }
    function onAudioFail(e) {
        console.warn("onAudioFail", this, e)
    }

    // Cordova is now initialized. Have fun!
    // var cordova = cordova ?? {};
    // console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    this.preload = function () {
        window.plugins.NativeAudio.preloadSimple('click', 'sounds/click.wav', onAudioSuccess, onAudioFail);
        window.plugins.NativeAudio.preloadSimple('pop1', 'sounds/pop1.wav', onAudioSuccess, onAudioFail);
        window.plugins.NativeAudio.preloadSimple('victory', 'sounds/victory.mp3', onAudioSuccess, onAudioFail);
        // window.plugins.NativeAudio.preloadSimple('zip', 'sounds/zip0.wav'), onAudioSuccess, onAudioFail);
        window.plugins.NativeAudio.preloadComplex('zip', 'sounds/zip0.wav', 1, 8, 0, onAudioSuccess, onAudioFail)
    }

    this.unload = function () {
        window.plugins.NativeAudio.unload('click', onAudioSuccess, onAudioFail);
        window.plugins.NativeAudio.unload('pop1', onAudioSuccess, onAudioFail);
        window.plugins.NativeAudio.unload('victory', onAudioSuccess, onAudioFail);
        window.plugins.NativeAudio.unload('zip', onAudioSuccess, onAudioFail);
    }
    this.preload();


    var media_click = function () {
        if (SoundOn()) {
            window.plugins.NativeAudio.play('click');
        }
    } 
    media_victory = function () {
        if (SoundOn()) {
            window.plugins.NativeAudio.play('victory');
        }
    } 
    media_pop = function () {
        if (SoundOn()) {
            window.plugins.NativeAudio.play('pop1');
        }
    } 
    media_zip = function () {
        if (SoundOn()) {
            window.plugins.NativeAudio.play('zip');
        }
    } 

    const exitApp = () => {
        // console.log('exit clicked');

        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        } else {
            window.close();
        }
    };
    const menuClicked = () => {
        if (SoundOn()) {
            media_click();
        }

        var scorePanel = document.getElementById('menu');
        scorePanel.style.display = 'flex';
        var scorePanel = document.getElementById('score');
        scorePanel.style.display = 'none';

        inGame = false;
        animation = [[true, 0, undefined, undefined], [false, 0, undefined, undefined]];
    };

    document.getElementById('btnPvai').onclick = () => {
        if (SoundOn()) {
            media_click();
        }

        let selectAi = document.getElementById('aiDifficulty');
        minmaxLevel = parseInt(selectAi.value);

        GameResume();
        InitGame();
        againstAi = true;
    };
    document.getElementById('btnPvp').onclick = () => {
        if (SoundOn()) {
            media_click();
        }

        GameResume();
        InitGame();
        againstAi = false;
    };
    document.addEventListener("backbutton", () => {

        if (inGame) {
            menuClicked();
        } else {
            exitApp();
        }

    }, false);
    document.getElementById('btnExit').onclick = exitApp;

    document.getElementById('btnMenu').onclick = menuClicked;

    document.getElementById('btnRestart').onclick = () => {
        if (SoundOn()) {
            media_click();
        }

        InitGame();
    };

    let soundon = document.querySelectorAll('#btnSound > img')[0];
    let soundoff = document.querySelectorAll('#btnSound > img')[1];
    document.getElementById('btnSound').onclick = () => {
        if (window.localStorage['soundOn'] == 'false') {
            soundoff.style.display = "none";
            soundon.style.display = "block";
            window.localStorage['soundOn'] = true;
            media_click();

        } else {
            soundoff.style.display = "block";
            soundon.style.display = "none";
            window.localStorage['soundOn'] = false;
        }
    };

    if (window.localStorage['soundOn'] == 'false') {
        soundoff.style.display = "block";
        soundon.style.display = "none";
    } else {
        soundoff.style.display = "none";
        soundon.style.display = "block";
    }


    if (window.localStorage['aiDifficulty']) {
        document.getElementById('aiDifficulty').value = window.localStorage['aiDifficulty'];
    }
    document.getElementById('aiDifficulty').onchange = (e) => {
        let val = e.target.value;
        window.localStorage['aiDifficulty'] = val;
    };
    if (window.localStorage['gridSize']) {
        document.getElementById('gridSize').value = window.localStorage['gridSize'];
    }
    document.getElementById('gridSize').onchange = (e) => {
        let val = e.target.value;
        window.localStorage['gridSize'] = val;
    };

    if (window.localStorage['playAsSecond']) {
        document.getElementById('chkPlaySecond').checked = window.localStorage['playAsSecond'] == 'true' ? true : false;
    }
    document.getElementById('chkPlaySecond').onchange = (e) => {
        let val = e.target.checked;
        window.localStorage['playAsSecond'] = val;
    }

    var timex = document.querySelector('#score #timeForX');
    var timeo = document.querySelector('#score #timeForO');

    setInterval(() => {
        if (movesMatrix && movesMatrix.length > 0 && !gameOver) {
            if (is1stPlayer) {
                var time = Functions.processTime(timex.innerHTML, 1);
                timex.innerHTML = time;
            } else {
                var time = Functions.processTime(timeo.innerHTML, 1);
                timeo.innerHTML = time;
            }
        }
    }, 1000);
}
