//Different renderings require different data formats
self.addEventListener("message", e => {
    dealJSONData(e.data);
    postMessage(e.data);
    close();
});

/**
 * @function
 * @name dealJSONData
 *
 * Generate the data needed for graph rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function dealJSONData(JSONData){
    addFlatNodes(JSONData);
    deleteUnlessLinks(JSONData);
    addNodeLinks(JSONData);
}

/**
 * @function
 * @name addFlatNodes
 *
 * Generate the data needed for graph rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function addFlatNodes(JSONData){
    JSONData.flatNodes = {};
    JSONData.nodes.map(function(node){
        if(node.id){
            JSONData.flatNodes[node.id] = JSON.parse(JSON.stringify(node));
        }
    });
}

/**
 * @function
 * @name deleteUnlessLinks
 *
 * Generate the data needed for graph rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function deleteUnlessLinks(JSONData){
    for(let i = JSONData.links.length - 1;i >= 0;i--){
        if(!(JSONData.flatNodes[JSONData.links[i].source] && JSONData.flatNodes[JSONData.links[i].target])){
            JSONData.links.splice(i, 1);
        }
    }
}


/**
 * @function
 * @name addNodeLinks
 *
 * Data Flattening, Data deduplication and detection of dirty data, etc.
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function addNodeLinks(JSONData){
    arrayDeduplication(JSONData.nodes, ["id"]);
    arrayDeduplication(JSONData.links, ["source", "target"]);
    let nodeLinks = {};
    JSONData.links.map(function(link){
        if(JSONData.flatNodes[link.source] && JSONData.flatNodes[link.target]){
            if(!nodeLinks[link.source]){
                nodeLinks[link.source] = 0;
            }
            if(!nodeLinks[link.target]){
                nodeLinks[link.target] = 0;
            }
            nodeLinks[link.source]++;
            nodeLinks[link.target]++;
        }
    });
    JSONData.nodes.map(function(node){
        node.linkCount = nodeLinks[node.id];
    });
}

/**
 * @function
 * @name arrayDeduplication
 *
 * Data Flattening, Data deduplication and detection of dirty data, etc.
 * @param  {array}  arrData     
 * @param  {array}  eigenvalues     arrData performs deduplication based on these eigenvalues
 * 
 */
function arrayDeduplication(arrData, eigenvalues = []){
    let tempStack = [];
    for(let i = arrData.length - 1;i >= 0;i--){
        let value = "", flag = 0;
        for(let key of eigenvalues){
            if(!arrData[i][key]){
                flag = 1;
                break;
            }
            value += arrData[i][key];
        }
        if(flag || tempStack.indexOf(value) !== -1){
            arrData.splice(i, 1);
        }
        else{
            tempStack.push(value);
        }
    }
}
