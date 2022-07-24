import {
	FilesPropertyItemObjectResponse,
	MultiSelectPropertyItemObjectResponse,
	TitlePropertyItemObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export function getTitlePlainText(input: TitlePropertyItemObjectResponse) {
	return input.title.plain_text;
}

export function getMultiSelectNames(input: MultiSelectPropertyItemObjectResponse) {
	return input.multi_select.map((item) => item.name);
}

export function getFiles(input: FilesPropertyItemObjectResponse) {
	return input.files.map((item) => item.name);
}
