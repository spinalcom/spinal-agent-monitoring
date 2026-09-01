"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinalServiceTimeseries = void 0;
exports.createNewBmsEndpoint = createNewBmsEndpoint;
exports.createAttribute = createAttribute;
exports.updateEndpoint = updateEndpoint;
exports.updateEndpointMaxDay = updateEndpointMaxDay;
exports.updateOrCreateEndpoint = updateOrCreateEndpoint;
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
exports.spinalServiceTimeseries = new spinal_model_bmsnetwork_1.SpinalServiceTimeseries();
function createNewBmsEndpoint(parentNode, endpoint) {
    const endpointModel = new spinal_model_bmsnetwork_1.SpinalBmsEndpoint(endpoint.name, endpoint.path, endpoint.currentValue, endpoint.unit, spinal_model_bmsnetwork_1.InputDataEndpointDataType[endpoint.dataType], spinal_model_bmsnetwork_1.InputDataEndpointType[endpoint.type], endpoint.id);
    endpointModel.add_attr({
        maxValue: endpoint.maxValue || Infinity,
        minValue: endpoint.minValue || -Infinity,
    });
    const node = new spinal_model_graph_1.SpinalNode(endpoint.name, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.nodeTypeName, endpointModel);
    node.info.mod_attr("name", endpointModel.name);
    node.info.mod_attr("path", endpointModel.path);
    node.info.mod_attr("idNetwork", endpointModel.id);
    return parentNode.addChild(node, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE).then(async (endpointNode) => {
        await createAttribute(endpointNode, endpointModel);
        return endpointNode;
    });
}
function createAttribute(endpointNode, element) {
    const categoryName = "default";
    return spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation
        .addCategoryAttribute(endpointNode, categoryName)
        .then(async (attributeCategory) => {
        const promises = [];
        for (const key of element._attribute_names) {
            promises.push(spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addAttributeByCategory(endpointNode, attributeCategory, key, element[key]));
        }
        return Promise.all(promises);
    })
        .catch((error) => { });
}
async function updateEndpoint(endpointNode, newValue) {
    const element = await endpointNode.getElement(true);
    element.currentValue.set(newValue);
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(endpointNode);
    if (typeof newValue === "number" || typeof newValue === "boolean")
        await exports.spinalServiceTimeseries.pushFromEndpoint(endpointNode.getId().get(), newValue);
    return endpointNode;
}
async function updateEndpointMaxDay(endpointNode, maxDay = 2) {
    try {
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(endpointNode);
        await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.createOrUpdateAttrsAndCategories(endpointNode, "default", { "timeSeries maxDay": maxDay.toString() });
    }
    catch (error) {
        return false;
    }
}
async function updateOrCreateEndpoint(parentNode, endpointData, value, existingEndpoints) {
    existingEndpoints = existingEndpoints || (await parentNode.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]));
    let endpoint = existingEndpoints.find((ep) => ep.getName().get() === endpointData.name);
    if (endpoint) {
        return updateEndpoint(endpoint, value.value);
    }
    else {
        const endpointDataFormatted = _formatEndpointData(endpointData, value);
        return createNewBmsEndpoint(parentNode, endpointDataFormatted);
    }
}
function _formatEndpointData(endpoint, data) {
    return {
        ...endpoint,
        currentValue: data.value,
        minValue: data.min,
        maxValue: data.max,
    };
}
//# sourceMappingURL=networkService.js.map