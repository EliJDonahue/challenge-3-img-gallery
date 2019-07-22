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
    var httpRequest = new XMLHttpRequest();
    
    return new Promise(function (resolve, reject) {
        // resolve or reject the promise when the response comes back
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                // resolve the promise and return the response text
                resolve(httpRequest.response);

            }
            else if (httpRequest.readyState == 4) {
                // reject the promise and return an error
                reject(new Error(httpRequest.status + " (" + httpRequest.statusText + ") from " + url));
            }
        };

        switch (source) {
            case "Imgur":
                httpRequest.open('GET', `https://api.imgur.com/3/gallery/${options.SECTION}/${options.SORT}/${options.WINDOW}/${options.PAGE}?showViral=${options.SHOW_VIRAL}&mature=${options.SHOW_MATURE}&album_previews=${options.ALBUM_PREVIEWS}`, true);
                // Note: ENV object is loaded from env.js, 
                // a .gitignored file I'm using as a temporary solution for environment variables
                httpRequest.setRequestHeader('Authorization', `Client-ID ${ENV.IMGUR_KEY}`);
                break;

            default:
                throw `Data source '${source}' has not been implemented for retrieveImages().`;
        }

        httpRequest.send();
    });
}

const loadGallery = async function () {
    // get data
    document.myImages = [];
    let myImages = [];
    let result = await retrieveImages('Imgur', IMGUR_OPTIONS);
    result = JSON.parse(result).data;

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

loadGallery();
