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

export async function updateEndpoint(endpointNode: SpinalNode, newValue: string | number | boolean): Promise<void> {
	const element = await endpointNode.getElement(true);
	element.currentValue.set(newValue);
	SpinalGraphService._addNode(endpointNode);

	if (typeof newValue === "number" || typeof newValue === "boolean") await spinalServiceTimeseries.pushFromEndpoint(endpointNode.getId().get(), newValue);
}
