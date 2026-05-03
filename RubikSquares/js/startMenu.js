
var startMenu = new function () {
    this.name = "startmenu";
    this.gametypes;

    this.onBack = function () {
        document.body.className = "";
        // document.body.style.position = "fixed";
        // app.backgroundAnimation.setOn(true);
        window.setTimeout(function () {
            app.backgroundAnimation.start();
        }, 1000)

        toggleDisplay("startmenu");
        toggleVisibility("header")
        toggleDisplay("menu");


        startMenu.clear();

        return true;
    }
    this.onStart = function () {
        var menu = document.getElementById("menu");
        menu.className = "";
        document.body.className = "noanimation";

        // document.body.style.position = "static";
        window.setTimeout(function () {
            app.backgroundAnimation.stop();
        }, 1);

        toggleDisplay("menu");
        toggleVisibility("header");
        toggleDisplay("startmenu");

        startMenu.start();
    }

    this.start = function () {
        var dim = Math.round(window.innerWidth / 3);

        this.gametypes = [];
        this.gametypes.push(new game.gameTypes.simpleVertical());
        this.gametypes.push(new game.gameTypes.simpleHorizontal());
        this.gametypes.push(new game.gameTypes.sequence(dim - 20));
        this.gametypes.push(new game.gameTypes.imagePuzzle("img/smiley.png"));
        this.gametypes.push(new game.gameTypes.imagePuzzle("img/kitten.jpg"));
        this.gametypes.push(new game.gameTypes.imagePuzzle("img/tree.jpg"));


        var divGetImg = document.getElementById("divGetImage");
        var imgPrev = document.getElementById("imgPreview");
        divGetImg.style.width = dim + "px";
        divGetImg.style.height = dim + "px";
        imgPrev.style.width = dim + "px";
        imgPrev.style.height = dim + "px";

        var wrapper = document.createElement("div");
        wrapper.style.width = dim + "px";
        wrapper.style.height = dim + "px";
        wrapper.classList.add("gtwrapper");

        var row, table = document.getElementsByClassName("startmenutable")[1];
        var nrColumns = 2;

        for (var inc = 0; inc < this.gametypes.length; inc++) {
            if (inc % nrColumns == 0) {
                row = document.createElement("tr");
                table.appendChild(row);
            }

            var td = document.createElement("td");
            var preview = this.gametypes[inc].toHtml();
            var wr = wrapper.cloneNode();
            wr.appendChild(preview);
            td.appendChild(wr);
            row.appendChild(td);

            wr.addEventListener("click", startGame.bind(this.gametypes[inc]));
        }

        if (window.localStorage["imgData"]) {
            loadPreview(window.localStorage["imgData"], false);
        } else {
            var imgPrev = document.getElementById("imgPreview");
            imgPrev.onclick = this.loadImageGallery;
        }
    }

    this.clear = function () {
        console.log("startmenu clear", this);
        delete this.gametypes;
        var table = document.getElementsByClassName("startmenutable")[1];
        table.innerHTML = "";
    }

    this.loadImageCamera = function () {
        var q = app.settings.imgQuality();
        console.log("loadImageCamera", q);

        if (cordova.platformId === 'browser') {
            console.log('Running in browser');

            var imgInput = document.getElementById("imgInput");
            imgInput.onchange = loadImageInBrowser;
            imgInput.click();
        } else {
            console.log('Running on device:', cordova.platformId);
            var cameraOptions = {
                quality: q,
                // allowEdit: true,
                destinationType: Camera.DestinationType.NATIVE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            }
            loadImage(cameraOptions);
        }
    };

    this.loadImageGallery = function () {
        var q = app.settings.imgQuality();
        console.log("loadImageGallery", q);

        var cameraOptions = {
            quality: q,
            // allowEdit: true,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        }
        loadImage(cameraOptions);
    };

    function startGame(ind) {
        console.log("startGame", this)
        if (this.ready()) {
            game.mMedia.click();
            game.gameType = this;
            app.onClickStartActivity.call(game);
        }
    }

    function loadPreview(imageURL, store) {
        // console.log("img onSuccess", this, imageURL);
        var imgPrev = document.getElementById("imgPreview");
        var gt = new game.gameTypes.imagePuzzle(imageURL, store);
        var img = gt.toHtml();
        imgPrev.innerHTML = "";
        imgPrev.appendChild(img);
        imgPrev.onclick = startGame.bind(gt);
    }

    function loadImage(options) {
        navigator.camera.getPicture(onSuccess, onFail, options);

        function onSuccess(imageURL) {
            window.localStorage.removeItem("totalSize");
            window.localStorage.removeItem("imgData");

            loadPreview(imageURL, true);
        }

        function onFail(message) {
            // TODO get toast plugin maybe
            // alert('Could not load image: ' + message);
            console.log('Could not load image: ' + message);
        }

    }

    function loadImageInBrowser() {
        var file = this.files[0];   

        if (!file) return;
        
        console.log(file.name);
        console.log(file.type);
        console.log(file); // bytes

        // const imageURL = URL.createObjectURL(file);
        const reader = new FileReader();

        reader.onload = () => {
            const imageURL = reader.result; // data:image/png;base64,...
            // preview.src = url;
            window.localStorage.removeItem("totalSize");
            window.localStorage.removeItem("imgData");

            loadPreview(imageURL, true);
        };

        reader.readAsDataURL(file);
    }
}
