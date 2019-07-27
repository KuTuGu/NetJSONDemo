if(typeof(L) !== 'undefined') {
    L.CanvasLayer = L.Layer.extend({  
        includes: [],

        options: {
            minZoom: 0,
            maxZoom: 28,
            tileSize: 256,
            subdomains: 'abc',
            errorTileUrl: '',
            attribution: '',
            zoomOffset: 0,
        },
        
        initialize: function (options = {}) {
            const { ecInstance, ...res } = options;

            this.render = this.render.bind(this);
            this._ec = ecInstance;
            this._container = this._ec.getDom();
            this._canvas = this._container.getElementsByTagName("canvas")[0];
            L.Util.setOptions(this, res);

            // backCanvas for zoom animation
            // this._backCanvas = this._createCanvas();
            if(!this._ec || !this._canvas){
                console.error("No echarts layer to render!");
                return;
            }
            this.currentAnimationFrame = -1;
            this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                                            return window.setTimeout(callback, 1000 / 60);
                                        };
            this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame ||
                                        window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function(id) { clearTimeout(id); };
        },
        
        // _createCanvas: function() {
        //     var canvas;
        //     canvas = document.createElement('canvas');
        //     canvas.style.position = 'absolute';
        //     canvas.style.top = 0;
        //     canvas.style.left = 0;
        //     canvas.style.pointerEvents = "none";
        //     canvas.style.zIndex = this.options.zIndex || 0;
        //     var className = 'leaflet-tile-container leaflet-zoom-animated';
        //     canvas.setAttribute('class', className);
        //     return canvas;
        // },
        
        onAdd: function (map) {
            this._map = map;
            this._prePostion = {};
            const self = this;
        
            // hack: listen to predrag event launched by dragging to
            // set container in position (0, 0) in screen coordinates
            // if (map.dragging.enabled()) {
            //     map.dragging._draggable.on('predrag', function() {
            //         var d = map.dragging._draggable;
            //         L.DomUtil.setPosition(this._canvas, { x: -d._newPos.x, y: -d._newPos.y });
            //     }, this);
            // }
        
            map.on('viewreset resize', this._reset, this);

            map.on("movestart", function(event){
                let pos = self.getMapOffset();
                if (pos) {
                    Object.assign(self._prePostion, {x: pos.x,  y: pos.y})
                }
            })

            map.on('move', this._moveHandler, this);
            map.on('zoom', function(event){
                // let pos = self.getMapOffset();
                // if (pos) {
                //     Object.assign(self._prePostion, {x: pos.x,  y: pos.y})
                // }
                self._moveHandler();
                self._ec._api.dispatchAction({
                  type: 'leafletRoam'
                });
            });

            this._unbindEvent();
            // map.on({
            //     'zoomanim': this._animateZoom,
            //     'zoomend': this._endZoomAnim
            // }, this);
        
            // if(this.options.tileLoader) {
            //     this._initTileLoader();
            // }
        
            this._reset();
        },
        
        // _animateZoom: function (e) {
        //     if (!this._animating) {
        //         this._animating = true;
        //     }
        //     var back = this._backCanvas;
        
        //     back.width = this._canvas.width;
        //     back.height = this._canvas.height;
        
        //     // paint current canvas in back canvas with trasnformation
        //     var pos = this._canvas._leaflet_pos || { x: 0, y: 0 };
        //     back.getContext('2d').drawImage(this._canvas, 0, 0);
        
        //     // hide original
        //     this._canvas.style.display = 'none';
        //     back.style.display = 'block';
        //     var map = this._map;
        //     var scale = map.getZoomScale(e.zoom);
        //     var newCenter = map._latLngToNewLayerPoint(map.getCenter(), e.zoom, e.center);
        //     var oldCenter = map._latLngToNewLayerPoint(e.center, e.zoom, e.center);
        
        //     var origin = {
        //         x:  newCenter.x - oldCenter.x,
        //         y:  newCenter.y - oldCenter.y
        //     };
        
        //     var bg = back;
        //     var transform = L.DomUtil.TRANSFORM;
        //     bg.style[transform] =  L.DomUtil.getTranslateString(origin) + ' scale(' + e.scale + ') ';
        // },
        
        // _endZoomAnim: function () {
        //     this._animating = false;
        //     this._canvas.style.display = 'block';
        //     this._backCanvas.style.display = 'none';
        // },
        
        getCanvas: function() {
            return this._canvas;
        },

        getEcharts: function() {
            return this._ec;
        },
        
        getAttribution: function() {
            return this.options.attribution;
        },

        getMapOffset(){
            let pos = L.DomUtil.getPosition(this._map.getPanes().mapPane);
            if(!pos){
                console.error("Can't get the map offset!");
                return;
            }
            return pos;
        },
        
        draw: function() {
            return this._reset();
        },
        
        onRemove: function (map) {
            this._container.parentNode.removeChild(this._container);
            map.off({
                'viewreset': this._reset,
                'move': this._moveHandler,
                'resize': this._reset,
                // 'zoomanim': this._animateZoom,
                // 'zoomend': this._endZoomAnim
            }, this);
        },
        
        addTo: function (map) {
            map.addLayer(this);
            return this;
        },
        
        // setOpacity: function (opacity) {
        //     this.options.opacity = opacity;
        //     this._updateOpacity();
        //     return this;
        // },
        
        setZIndex: function(zIndex) {
            this._canvas.style.zIndex = zIndex;
        },
        
        // bringToFront: function () {
        //     return this;
        // },
        
        // bringToBack: function () {
        //     return this;
        // },
        
        _reset: function () {
            // Custom interface
            this.onResize();

            this._ec.resize();
            // fix position
            let pos = this.getMapOffset();
            if (pos) {
                L.DomUtil.setPosition(this._container, { x: -pos.x, y: -pos.y });

                this._render();
            }
        },
        
        /*
        _project: function(x) {
            var point = this._map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
            return [point.x, point.y];
        },
        */
        
        // _updateOpacity: function () { },
        
        _render: function() {
            if (this.currentAnimationFrame >= 0) {
                this.cancelAnimationFrame.call(window, this.currentAnimationFrame);
            }
            this.currentAnimationFrame = this.requestAnimationFrame.call(window, this.render);
        },
        
        // use direct: true if you are inside an animation frame call
        _moveHandler: function(direct) {
            let pos = this.getMapOffset();
            if (pos) {
                const { x, y } = pos;
                L.DomUtil.setPosition(this._container, { x: -x, y: -y });

                const self = this;
                this._ec._chartsViews.map(({group}) => {
                    self.updateViewOnPan({
                      target: group
                    }, x - self._prePostion.x, y - self._prePostion.y);
                })
                Object.assign(this._prePostion, {x, y});
    
                if (direct) {
                    this.render();
                } else {
                    this._render();
                }
            }
        },
        
        onResize: function() {
        },
        
        render: function() {
        },

        /**
         * For geo and graph.
         *
         * @param {Object} controllerHost
         * @param {module:zrender/Element} controllerHost.target
         */
        updateViewOnPan(controllerHost, dx, dy) {
            var target = controllerHost.target;
            var pos = target.position;
            pos[0] += dx;
            pos[1] += dy;
            target.dirty();
        },

        /**
         * For geo and graph.
         *
         * @param {Object} controllerHost
         * @param {module:zrender/Element} controllerHost.target
         * @param {number} controllerHost.zoom
         * @param {number} controllerHost.zoomLimit like: {min: 1, max: 2}
         */
        updateViewOnZoom(controllerHost, zoomDelta, zoomX, zoomY) {
            var target = controllerHost.target;
            var zoomLimit = controllerHost.zoomLimit;
            var pos = target.position;
            var scale = target.scale;
            var newZoom = controllerHost.zoom = controllerHost.zoom || 1;
            newZoom *= zoomDelta;
        
            if (zoomLimit) {
            var zoomMin = zoomLimit.min || 0;
            var zoomMax = zoomLimit.max || Infinity;
            newZoom = Math.max(Math.min(zoomMax, newZoom), zoomMin);
            }
        
            var zoomScale = newZoom / controllerHost.zoom;
            controllerHost.zoom = newZoom; // Keep the mouse center when scaling
        
            pos[0] -= (zoomX - pos[0]) * (zoomScale - 1);
            pos[1] -= (zoomY - pos[1]) * (zoomScale - 1);
            scale[0] *= zoomScale;
            scale[1] *= zoomScale;
            target.dirty();
        },

        _unbindEvent() {
            this._ec.getZr().off("dragstart", function() {}),
            this._ec.getZr().off("dragend", function() {}),
            this._ec.getZr().off("mouseup", function() {}),
            this._ec.getZr().off("mousedown", function() {}),
            this._ec.getZr().off("mousewheel", function() {})
        },
    });
    
}