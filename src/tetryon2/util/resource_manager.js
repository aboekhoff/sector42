// TODO
// es6ify and support state change diffs

function get(options) {
  const {url, success, error} = options
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      if (xhr.status == 200) {
        options.success(xhr.response)
      }
      else {
        options.error(xhr.response)
        this.loadError = options.url;
      }
    }
  }
  xhr.open("GET", options.url, true);
  xhr.send();
}

export default class ResourceManager {
  constructor(options={}) {
    this.path  = options.path || ""

    this.cache = options.byName || {}
    this.urls  = {}

    this.previousManager = this.previousManager || null

    this.loading = []
    this.completed = 0
    this.readyCallbacks = []
  }

  storeResource(name, url, resource) {
    this.cache[name] = url
    this.urls[url] = resource
  }

  load(name, url=null) {
    if (url == null) { url = name }

    if (this.urls[url]) {
      this.cache[name] = url
      return
    }

    if (this.previousManager && this.previousManager.urls[url]) {
      this.storeResource(name, url, this.previousManager.urls[url])
      return
    }

    if (/.+\.(png|bmp|gif)/.test(url)) {
      this.loadImage(name, url)
      return
    }

    else {
      this.loadFile(name, url)
      return
    }
  }

  loadImage(name, url) {
    this.loading.push(url);
    var img = new Image();
    img.onload = function() {
      this.urls[url] = img;
      this.cache[name] = url;
      this.resourceDidLoad()
    }
  }

  loadFile(name, url) {
    this.loading.push(url);
    get({
      url: url,
      success: function(res) {
        this.urls[url] = res;
        this.cache[name] = res;
        if (this.isReady()) { this.invokeReadyCallbacks() }
      }.bind(this),
      error: function(res) {
        throw Error('could not load ' + url);
      }.bind(this)
    })
  }

  resourceDidLoad() {
    if (this.isReady()) {
      for (var i=0; i<this.readyCallbacks.length; i++) {
        this.readyCallbacks[i]()
      }
      this.readyCallbacks.length = 0
    }
  }

  onReady(callback) {
    this.onReadyCallbacks.push(callback)
  }

  isReady() {
    var ready = true;
    for (var i=0; i<this.loading.length; i++) {
      var url = this.loading[i];
      if (!this.urls[url]) {
        ready = false;
        break;
      }
    }
    return ready;
  }

  get(name) {
    return this.urls[this.cache[name]]
  }

}
