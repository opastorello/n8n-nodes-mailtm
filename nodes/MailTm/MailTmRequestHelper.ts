import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Helper for Mail.tm API requests
 * Handles authentication, Bearer token and standardizes error handling
 */
export class MailTmRequestHelper {
	private api: AxiosInstance;
	private token?: string;

	constructor(token?: string) {
		this.token = token;
		this.api = axios.create({
			baseURL: 'https://api.mail.tm',
			headers: token
				? { Authorization: `Bearer ${token}` }
				: undefined,
		});
	}

	static async authenticate(address: string, password: string): Promise<string> {
		const { data } = await axios.post('https://api.mail.tm/token', { address, password });
		return data.token;
	}

	async get(path: string, params?: any, config?: AxiosRequestConfig) {
		return this.api.get(path, { ...config, params });
	}

	async post(path: string, data?: any, config?: AxiosRequestConfig) {
		return this.api.post(path, data, config);
	}

	async delete(path: string, config?: AxiosRequestConfig) {
		return this.api.delete(path, config);
	}

	async patch(path: string, data: any, config?: AxiosRequestConfig) {
		return this.api.patch(path, data, config);
	}

	async download(path: string, responseType: AxiosRequestConfig['responseType'] = "arraybuffer") {
		return this.api.get(path, { responseType });
	}
}
