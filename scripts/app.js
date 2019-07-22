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

}