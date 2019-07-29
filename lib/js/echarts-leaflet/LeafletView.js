/**
 * extend echarts view
 * @param {object} echarts
 * @param {object} L
 */
export default function extendLeafletView(echarts, L) {
  echarts.extendComponentView({
    type: 'leaflet',

    render: function(leafletModel, ecModel, api) {
      let rendering = true;

      const leaflet = leafletModel.getLeaflet();
      const moveContainer = api.getZr().painter.getViewportRoot().parentNode;
      const coordSys = leafletModel.coordinateSystem;
      const _preMapStatus = {
        x: 0, y: 0, zoom: leaflet.getZoom()
      };

      if(this._oldMoveStartHandler){
        leaflet.off('movestart', this._oldMoveStartHandler);
      }
      if (this._oldMoveHandler) {
        leaflet.off('move', this._oldMoveHandler);
      }
      if (this._oldZoomHandler) {
        leaflet.off('zoom', this._oldZoomHandler);
      }
      if (this._oldZoomEndHandler) {
        leaflet.off('zoomend', this._oldZoomEndHandler);
      }

      leaflet.on('movestart', setPosition);
      leaflet.on('move', moveHandler);
      leaflet.on('zoom', zoomHandler);
      leaflet.on('zoomend', zoomEndHandler);
      // leaflet.on('resize', resizeHandler);

      this._oldMoveStartHandler = setPosition;
      this._oldMoveHandler = moveHandler;
      this._oldZoomHandler = zoomHandler;
      this._oldZoomEndHandler = zoomEndHandler;

      const { roam } = leafletModel.get('mapOptions');
      // can move
      if (roam && roam !== 'scale') {
        leaflet.dragging.enable();
      } else {
        leaflet.dragging.disable();
      }
      // can zoom (may need to be more fine-grained)
      if (roam && roam !== 'move') {
        leaflet.scrollWheelZoom.enable();
        leaflet.doubleClickZoom.enable();
        leaflet.touchZoom.enable();
      } else {
        leaflet.scrollWheelZoom.disable();
        leaflet.doubleClickZoom.disable();
        leaflet.touchZoom.disable();
      }

      function setPosition(){
        if (rendering) {
          return;
        }

        let pos = getMapOffset(leaflet);
        if (pos) {
            Object.assign(_preMapStatus, {x: pos.x,  y: pos.y})
        }
      }

      function moveHandler() {
        if (rendering) {
          return;
        }

        const offset = setOffset();
        if(offset){
          const { dx, dy } = offset;
          api.dispatchAction({
            type: 'leafletMove',
            dx, dy
          });
        }
      };

      /**
       * handler for map zoom event
       */
      function zoomHandler(e) { 
        if (rendering) {
          return;
        }

        const { _animateToZoom, _animateToCenter } = e.target;
        const { zoom } = _preMapStatus;

        setOffset();
        
        // let { x, y } = leaflet.latLngToLayerPoint(_animateToCenter);console.log(e);
        // if(_animateToZoom > zoom){
        //   leaflet.setZoom(zoom + 1);
        //   api.dispatchAction({
        //     type: 'leafletZoom',
        //     x, y, zoomLevel: _animateToZoom - _zoom,
        //   });
        // }
        // else if(_animateToZoom < zoom){
        //   leaflet.setZoom(zoom - 1);
        //   api.dispatchAction({
        //     type: 'leafletZoom',
        //     x, y, zoomIn: false,
        //   });
        // }
        api.dispatchAction({
          type: 'leafletZoom',
        });

        // _preMapStatus.zoom = _animateToZoom;
      }
      /**
       * handler for map zoomEnd event
       */
      function zoomEndHandler(e) {
        if (rendering){
          return;
        }

        api.dispatchAction({
          type: 'leafletZoom',
        });
      }

      function resizeHandler(e) {
      //   let { newSize, oldSize } = e;
        
      //   api.dispatchAction({
      //     type: 'leafletMove',
      //     dx: newSize.x - oldSize.x,
      //     dy: newSize.y - oldSize.y,
      //   });
      }

      function getMapOffset(map){
        let pos = L.DomUtil.getPosition(map.getPanes().mapPane);
        if(!pos){
            console.error("Can't get the map offset!");
            return;
        }
        return pos;
      }

      function setOffset(){
        const pos = getMapOffset(leaflet);
        if(pos){
          const { x, y } = pos,
                dx = x - _preMapStatus.x,
                dy = y - _preMapStatus.y;

          Object.assign(_preMapStatus, { x, y });
          
          L.DomUtil.setPosition(moveContainer, { x: -x, y: -y });

          coordSys.setMapOffset([x, y]);
          leafletModel.__mapOffset = [x, y];

          return {dx, dy};
        }
        return;
      }

      rendering = false;
    },
  });
}
