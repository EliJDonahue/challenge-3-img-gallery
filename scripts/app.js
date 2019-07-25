requirejs.config({
    paths: {
        '@firebase/app': 'https://www.gstatic.com/firebasejs/6.3.1/firebase-app'
    }
});

require([
    '@firebase/app'
], function (firebase) {

    var firebaseConfig = {
        apiKey: "AIzaSyDVsu_V9qLYOEiavUFasGGe8ONAj40PLyo",
        authDomain: "gallerychallenge-1563332321987.firebaseapp.com",
        databaseURL: "https://gallerychallenge-1563332321987.firebaseio.com",
        projectId: "gallerychallenge-1563332321987",
        storageBucket: "",
        messagingSenderId: "148710615974",
        appId: "1:148710615974:web:8700844224dc7c35"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const IMGUR_OPTIONS = {
        SECTION: 'top',
        SORT: 'viral',
        PAGE: '1',
        WINDOW: 'week',
        SHOW_MATURE: 'false',
        SHOW_VIRAL: 'true',
        ALBUM_PREVIEWS: 'true'
    };

    // instances of this class represent an image from a source API
    class MyImage {
        constructor(obj, source) {
            switch (source) {
                case "Imgur":
                    this._buildImgurImage(obj);
                    break;

                default:
                    throw `Data source '${source}' has not been implemented for the MyImage Class.`;
            }
        }

        // parse the data from the passed object
        _buildImgurImage(obj) {
            this.id = obj.id;
            this.title = obj.title || 'Untitled';
            this.description = obj.description;
            this.filetype = obj.type;
            this.height = obj.height;
            this.width = obj.width;
            this.tags = obj.tags;
            this.url = obj.link;
            this.source = 'Imgur';
        }

        get fileurl() {
            // if the url already ends with an extension, return the url
            if (this.url.lastIndexOf('.') > this.url.length - 6) {
                return this.url;
            }

            // else, get the file type and add the extension to the url
            let extension = this.filetype.substring(this.filetype.lastIndexOf('/') + 1);
            return `${this.url}.${extension}`;
        }
    }

    // get the image data from the specified source
    const retrieveImages = async function (source, options) {

        let url;
        let headers = new Headers();
        
        switch (source) {
            case "Imgur":
                url = `https://api.imgur.com/3/gallery/${options.SECTION}/${options.SORT}/${options.WINDOW}/${options.PAGE}?showViral=${options.SHOW_VIRAL}&mature=${options.SHOW_MATURE}&album_previews=${options.ALBUM_PREVIEWS}`;
                // Note: ENV object is loaded from env.js, 
                // a .gitignored file I'm using as a temporary solution for environment variables
                headers.append('Authorization', `Client-ID ${ENV.IMGUR_KEY}`);
                break;

            default:
                throw `Data source '${source}' has not been implemented for retrieveImages().`;
        }
        
        let myInit = { 
            method: 'GET',
            headers: headers,
            mode: 'cors',
            cache: 'default' 
        };

        let request = new Request(url, myInit);
        let response = await fetch(request);
        let data = await response.json();
        
        return data;
    }

    const loadGallery = async function () {
        try {
            // get data
            document.myImages = [];
            let myImages = [];
            let result = await retrieveImages('Imgur', IMGUR_OPTIONS);
            result = result.data;

            let numCols = 4;
            let numImages = 0;
            createColumns(numCols);

            result.forEach(function (obj) {
                let thisCol = numImages % numCols;
                let imageAdded = false;
                let img;

                if (obj.is_album === false) {
                    // this object is a single image
                    img = new MyImage(obj, 'Imgur');
                    imageAdded = displayImage(img, thisCol);
                    if (imageAdded) {
                        numImages++;
                        myImages.push(img);
                    }

                } else {
                    // otherwise, this object is an album of images
                    images = obj.images;
                    images.forEach(function (item) {
                        img = new MyImage(item, 'Imgur');
                        imageAdded = displayImage(img, thisCol);
                        if (imageAdded) {
                            numImages++;
                            myImages.push(img);
                        }
                    });
                }
            });

            document.myImages = myImages;

        } catch (err) {
            console.log("Error: " + err.message);
            alert("Error: " + err.message);
        }
    };

    const createColumns = function (cols) {
        let container = document.getElementById('gallery-row');
        for (let i = 0; i < cols; i++) {
            let col = document.createElement('div');
            col.id = `col-${i}`;
            col.classList = 'column';
            container.appendChild(col);
        }
    };

    const displayImage = function (img, colNum) {
        if (img.url.indexOf('.mp4') > 0) {
            // skip it, we aren't showing videos
            return false;
        }

        // create image tag to add to document
        let img_tag = document.createElement('img');
        img_tag.src = img.fileurl;
        img_tag.id = img.id;
        img_tag.style.width = '100%';

        // add click event to show the selected image in a modal dialog
        img_tag.addEventListener('click', function (e) {
            let selected_id = e.target.id;
            let selected_obj = document.myImages.find(function (element) {
                return element.id === selected_id;
            });

            // set modal content
            let title_el = document.getElementById('selected-title');
            let body_el = document.getElementById('selected-body-img');
            title_el.innerHTML = selected_obj.title;
            body_el.src = selected_obj.fileurl;

            // call bootstrap modal dialog
            $('#img-modal').modal('show');
        });

        // add image to the doc
        let col = document.getElementById(`col-${colNum}`);
        col.appendChild(img_tag);
        return true;
    };

    // init gallery
    loadGallery();
});
