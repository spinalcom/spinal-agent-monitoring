import { InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType, SpinalBmsEndpoint, SpinalServiceTimeseries } from "spinal-model-bmsnetwork";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalNode } from "spinal-model-graph";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

export const spinalServiceTimeseries = new SpinalServiceTimeseries();

export function createNewBmsEndpoint(parentNode: SpinalNode, endpoint: InputDataEndpoint): Promise<SpinalNode> {
	const endpointModel = new SpinalBmsEndpoint(endpoint.name, endpoint.path, endpoint.currentValue, endpoint.unit, InputDataEndpointDataType[endpoint.dataType], InputDataEndpointType[endpoint.type], endpoint.id);

	endpointModel.add_attr({
		maxValue: (endpoint as any).maxValue || Infinity,
		minValue: (endpoint as any).minValue || -Infinity,
	});

	const node = new SpinalNode(endpoint.name, SpinalBmsEndpoint.nodeTypeName, endpointModel);

	node.info.mod_attr("name", endpointModel.name);
	node.info.mod_attr("path", endpointModel.path);
	node.info.mod_attr("idNetwork", endpointModel.id);

	return parentNode.addChild(node, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE).then(async (endpointNode) => {
		await createAttribute(endpointNode, endpointModel);
		return endpointNode;
	});
}

export function createAttribute(endpointNode: SpinalNode, element: SpinalBmsEndpoint): Promise<any> {
	const categoryName = "default";
	return serviceDocumentation
		.addCategoryAttribute(endpointNode, categoryName)
		.then(async (attributeCategory) => {
			const promises = [];
			for (const key of element._attribute_names) {
				promises.push(serviceDocumentation.addAttributeByCategory(endpointNode, attributeCategory, key, element[key]));
			}

			return Promise.all(promises);
		})
		.catch((error) => {});
}

export async function updateEndpoint(endpointNode: SpinalNode, newValue: string | number | boolean): Promise<SpinalNode> {
	const element = await endpointNode.getElement(true);
	element.currentValue.set(newValue);
	SpinalGraphService._addNode(endpointNode);

	if (typeof newValue === "number" || typeof newValue === "boolean") await spinalServiceTimeseries.pushFromEndpoint(endpointNode.getId().get(), newValue);
	return endpointNode;
}

export async function updateEndpointMaxDay(endpointNode: SpinalNode, maxDay: string | number = 2) {
	try {
		SpinalGraphService._addNode(endpointNode);
		await serviceDocumentation.createOrUpdateAttrsAndCategories(endpointNode, "default", { "timeSeries maxDay": maxDay.toString() });
	} catch (error) {
		return false;
	}
}

export async function updateOrCreateEndpoint(parentNode: SpinalNode, endpointData: InputDataEndpoint, value: { value: number; min?: number; max?: number }, existingEndpoints?: SpinalNode[]) {
	existingEndpoints = existingEndpoints || (await parentNode.getChildren([SpinalBmsEndpoint.relationName]));
	let endpoint = existingEndpoints.find((ep) => ep.getName().get() === endpointData.name);
	if (endpoint) {
		return updateEndpoint(endpoint, value.value);
	} else {
		const endpointDataFormatted = _formatEndpointData(endpointData, value);
		return createNewBmsEndpoint(parentNode, endpointDataFormatted);
	}
}

function _formatEndpointData(endpoint: InputDataEndpoint, data: { value: number | string | boolean; min?: number; max?: number }): InputDataEndpoint {
	return {
		...endpoint,
		currentValue: data.value,
		minValue: data.min,
		maxValue: data.max,
	} as InputDataEndpoint;
}
