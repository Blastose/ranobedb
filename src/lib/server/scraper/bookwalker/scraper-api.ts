import { z } from 'zod/v4';
import { convertDateToDateNumber, parseStaff, zBwBook } from './scraper';
import { fullToHalf } from '../char-conversion';
import { filter } from './filter-bw-titles';

const bwApiSchema = z.object({
	productName: z.string(),
	productNameKana: z.string(),
	saleStartTime: z.string(),
	categoryName: z.string(),
	productExplanationDetails: z.string(),
	saleCompanyId: z.number(),
	companyName: z.string(),
	labelId: z.number(),
	labelName: z.string(),
	seriesId: z.number().nullable(),
	seriesName: z.string().nullable(),
	coverFileName: z.string(),
	uuid: z.string(),
	authorList: z.array(
		z.object({
			authorId: z.number(),
			authorName: z.string(),
			authorNameKana: z.string(),
			authorTypeName: z.string(),
			displaySeqNo: z.number(),
		}),
	),
});

export async function fromBwApi(id: string): Promise<z.infer<typeof zBwBook>> {
	const json = await (await fetch(`https://bookwalker-api.vercel.app/api/bw?id=${id}`)).json();
	const res = bwApiSchema.parse(json);

	const date = res.saleStartTime.slice(0, 10);

	const staff = parseStaff(
		res.authorList.map((v) => ({
			text: `${v.authorName}(${v.authorTypeName})`,
			url: `https://bookwalker.jp/author/${v.authorId}/`,
		})),
	);

	return zBwBook.parse({
		id: res.uuid,
		url: `https://bookwalker.jp/de${res.uuid}/`,
		title: fullToHalf(filter(res.productName)) ?? '',
		series:
			res.seriesName && res.seriesId
				? {
						name: fullToHalf(filter(res.seriesName, res.companyName, res.labelName)),
						url: `https://bookwalker.jp/series/${res.seriesId}/list/`,
						id: res.seriesId,
					}
				: null,
		publisher: {
			id: res.saleCompanyId,
			name: fullToHalf(res.companyName),
			url: `https://bookwalker.jp/company/${res.saleCompanyId}/`,
		},
		label: {
			id: res.labelId,
			name: fullToHalf(res.labelName),
			url: `https://bookwalker.jp/label/${res.labelId}/`,
		},
		staff: staff,
		category: res.categoryName,
		date: date,
		dateNumber: convertDateToDateNumber(date),
		teihonDate: null,
		teihonDateNumber: null,
		imageSrc: `https://bwcommercial-external-images.s3.amazonaws.com/${res.uuid}.jpg`,
		description: res.productExplanationDetails,
		pages: null,
		tags: [],
		kana: res.productNameKana,
	});
}
