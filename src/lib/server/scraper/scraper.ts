import { z } from 'zod/v4';
import type { scrapedBookDataSchema } from '../zod/schema';

export type BookData = z.infer<typeof scrapedBookDataSchema>;

export abstract class BookScraper {
	protected url: string;

	constructor(url: string) {
		this.url = url;
	}

	public async scrape(): Promise<BookData> {
		const html = await this.fetchHtml();
		const data: BookData = await this.parse(html);

		return data;
	}

	private async fetchHtml(cookie?: string): Promise<string> {
		const response = await fetch(this.url, {
			credentials: 'include',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
				'Sec-GPC': '1',
				'Upgrade-Insecure-Requests': '1',
				'Sec-Fetch-Dest': 'document',
				'Sec-Fetch-Mode': 'navigate',
				'Sec-Fetch-Site': 'none',
				Cookie: cookie ?? '',
				Priority: 'u=0, i',
			},
			method: 'GET',
			mode: 'cors',
		});

		if (response.status !== 200) {
			throw new Error('URL is not valid');
		}

		return await response.text();
	}

	protected abstract parse(html: string): Promise<BookData>;
}
