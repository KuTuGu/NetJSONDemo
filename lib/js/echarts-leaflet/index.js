import createLeafletCoordSystem from './LeafletCoordSys';
import extendLeafletModel from './LeafletModel';
import extendLeafletView from './LeafletView';

/**
 * echarts register leaflet coord system
 * @param {object} echarts
 * @param {object} L
 */
function registerLeafletSystem(echarts, L) {
  extendLeafletModel(echarts);
  extendLeafletView(echarts, L);

  echarts.registerCoordinateSystem('leaflet', createLeafletCoordSystem(echarts, L));
  
  echarts.registerAction({
    type: 'leafletMove',
    event: 'leafletMove',
    update: 'none'
  }, function (payload, ecModel) {
    const ec = ecModel.scheduler.ecInstance;
    ec._chartsViews.map(({group}) => {
      updateViewOnPan({
        target: group
      }, payload.dx, payload.dy);
    }) 
  
    ecModel.eachComponent('leaflet', function (leafletModel) {
      var leaflet = leafletModel.getLeaflet();
      var center = leaflet.getCenter();
      leafletModel.setCenterAndZoom([center.lng, center.lat], leaflet.getZoom());
    });
  });
  echarts.registerAction({
    type: 'leafletZoom',
    event: 'leafletZoom',
    update: 'updateLayout'
  }, function (payload, ecModel) {
    ecModel.eachComponent('leaflet', function (leafletModel) {
      var leaflet = leafletModel.getLeaflet();
      var center = leaflet.getCenter();
      leafletModel.setCenterAndZoom([center.lng, center.lat], leaflet.getZoom());
    });
  });
}

/**
 * For geo and graph.
 *
 * @param {Object} controllerHost
 * @param {module:zrender/Element} controllerHost.target
 */
function updateViewOnPan(controllerHost, dx, dy) {
  var target = controllerHost.target;
  var pos = target.position;
  pos[0] += dx;
  pos[1] += dy;
  (function dirty(target) {
      target.__dirty = true;
      target.__zr && target.__zr.refreshImmediately();
  })(target)
}

registerLeafletSystem.version = '1.0.0';

export default registerLeafletSystem;
