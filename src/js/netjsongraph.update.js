"use strict";

import NetJSONGraphUtil from "./netjsongraph.util.js";

class NetJSONGraphUpdate extends NetJSONGraphUtil {
  /**
   * @function
   * @name searchElements
   * Add search function for new elements.
   *
   * @param {string} url      listen url
   * @param {object} _this    NetJSONGraph object
   *
   * @return {function} searchFunc
   */

  searchElements(url, _this) {
    window.history.pushState({ searchValue: "" }, "");

    window.onpopstate = event => {
      updateSearchedElements(event.state.searchValue);
    };

    return function searchFunc(key) {
      let searchValue = key.trim();

      if (
        !history.state ||
        (history.state && history.state.searchValue !== searchValue)
      ) {
        history.pushState({ searchValue }, "");
        return updateSearchedElements(searchValue);
      }
    };

    function updateSearchedElements(searchValue) {
      return fetch(url + searchValue)
        .then(data => data.json())
        .then(data => {
          _this.utils.JSONDataUpdate.call(_this, data);
        })
        .catch(error => {
          throw error;
        });
    }
  }

  /**
   * @function
   * @name dealDataByWorker
   *
   * Deal JSONData by WebWorker and render.
   * @param  {object}    JSONData     NetJSONData
   * @param  {string}    workerFile   url
   * @param  {object}    _this        NetJSONGraph object
   * @param  {function}  callback
   *
   */

  dealDataByWorker(JSONData, workerFile, _this, callback) {
    let worker = new Worker(workerFile);

    worker.postMessage(JSONData);

    worker.addEventListener("error", e => {
      console.error("Error in dealing JSONData!");
    });
    worker.addEventListener("message", e => {
      if (callback) {
        callback();
      } else {
        _this.utils._overrideData(e.data, _this);

        _this.utils.updateMetadata.call(_this);
      }
    });
  }

  /**
   * @function
   * @name JSONDataUpdate
   *
   * Callback function executed when data update. Update Information and view.
   * @param  {object|string}  Data     JSON data or url
   * @param  {boolean}        override If old data need to be overrided?
   * @param  {boolean}        isRaw    If data need to deal with the configuration?
   *
   * @this  {object}   NetJSONGraph object
   *
   */

  JSONDataUpdate(Data, override = true, isRaw = true) {
    const _this = this;
    _this.config.onUpdate.call(_this);

    _this.utils
      .JSONParamParse(Data)
      .then(JSONData => {
        if (isRaw) {
          _this.config.prepareData.call(_this, JSONData);
          if (_this.config.dealDataByWorker) {
            _this.utils.dealDataByWorker(
              JSONData,
              _this.config.dealDataByWorker,
              _this,
              _update
            );
          } else {
            _update();
          }
        } else {
          _update();
        }

        function _update() {
          // override data.
          if (override) {
            _this.utils._overrideData(JSONData, _this);
          }
          // append data.
          else {
            _this.utils._appendData(JSONData, _this);
          }
          // update metadata
          _this.utils.updateMetadata.call(_this);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * @function
   * @name _appendData
   *
   * Add new data after render. Can only be used for map render !
   * Internal use. Recommend to use `JSONDateUpdate` directly.
   * @param  {object}         JSONData   Data
   * @param  {object}         _this      NetJSONGraph object
   *
   */
  _appendData(JSONData, _this) {
    if (_this.config.render !== _this.utils.mapRender) {
      console.error("AppendData function can only be used for map render!");
      return;
    }
    const opts = _this.utils.generateMapOption(JSONData, _this);
    opts.series.map((obj, index) => {
      _this.echarts.appendData({
        seriesIndex: index,
        data: obj.data
      });
    });
    const nodes = _this.data.nodes.concat(JSONData.nodes),
      links = _this.data.links.concat(JSONData.links);
    Object.assign(_this.data, JSONData, {
      nodes,
      links
    });
  }
  /**
   * @function
   * @name _overrideData
   *
   * Override new data after render.
   * Internal use. Recommend to use `JSONDateUpdate` directly.
   * @param  {object}         JSONData   Data
   * @param  {object}         _this      NetJSONGraph object
   *
   */
  _overrideData(JSONData, _this) {
    _this.data = JSONData;

    _this.utils.NetJSONRender();
  }
}

export default NetJSONGraphUpdate;
