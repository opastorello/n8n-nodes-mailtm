import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { MailTmRequestHelper } from './MailTmRequestHelper';

/**
 * Node principal Mail.tm para n8n
 * Suporta todos os recursos: Domínio, Conta, Mensagem, Fontes, Anexos
 */
export class MailTm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mail.tm',
    name: 'mailTm',
    icon: 'file:MailTm.svg',
		group: ['input', 'output'],
		version: 1,
		description: 'Automação e consulta de emails temporários com Mail.tm',
		defaults: { name: 'Mail.tm' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{ name: 'mailTmApi', required: false },
		],
		properties: [
			{
				displayName: 'Recurso',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Domínio', value: 'domain' },
					{ name: 'Conta', value: 'account' },
					{ name: 'Mensagem', value: 'message' },
					{ name: 'Fonte da Mensagem', value: 'source' },
					{ name: 'Anexo', value: 'attachment' },
				],
				default: 'account',
				description: 'Escolha o recurso da operação',
			},
			// --- DOMÍNIO ---
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['domain'] } },
				options: [
					{ name: 'Listar domínios', value: 'list' },
					{ name: 'Obter domínio por ID', value: 'get' },
				],
				default: 'list',
			},
			{
				displayName: 'Domínio ID',
				name: 'domainId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['domain'], operation: ['get'] } },
			},
			{
				displayName: 'Página',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: { show: { resource: ['domain'], operation: ['list'] } },
				description: 'Número da página para paginação',
			},
			// --- CONTA ---
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{ name: 'Criar conta', value: 'create' },
					{ name: 'Autenticar (obter token)', value: 'authenticate' },
					{ name: 'Info da conta (token)', value: 'getMe' },
					{ name: 'Info da conta (por ID)', value: 'getById' },
					{ name: 'Deletar conta', value: 'delete' },
				],
				default: 'getMe',
			},
			{
				displayName: 'Email',
				name: 'accountEmail',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['account'], operation: ['create', 'authenticate'] },
				},
			},
			{
				displayName: 'Senha',
				name: 'accountPassword',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['account'], operation: ['create', 'authenticate'] },
				},
			},
			{
				displayName: 'Conta ID',
				name: 'accountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['account'], operation: ['getById', 'delete'] },
				},
			},
			// --- MENSAGEM ---
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{ name: 'Listar mensagens', value: 'list' },
					{ name: 'Obter mensagem por ID', value: 'get' },
					{ name: 'Deletar mensagem', value: 'delete' },
					{ name: 'Marcar como lida', value: 'seen' }
				],
				default: 'list',
			},
			{
				displayName: 'Mensagem ID',
				name: 'messageId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['message'], operation: ['get', 'delete', 'seen'] } },
			},
			{
				displayName: 'Visto',
				name: 'seen',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: { resource: ['message'], operation: ['seen'] },
				},
			},
			{
				displayName: 'Página',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: { show: { resource: ['message'], operation: ['list'] } },
				description: 'Número da página para paginação',
			},
			// --- FONTE DA MENSAGEM ---
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['source'] } },
				options: [
					{ name: 'Obter fonte da mensagem', value: 'get' },
				],
				default: 'get',
			},
			{
				displayName: 'Mensagem ID',
				name: 'sourceId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['source'] } },
			},
			// --- ANEXO ---
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['attachment'] } },
				options: [
					{ name: 'Baixar anexo', value: 'download' },
				],
				default: 'download',
			},
			{
				displayName: 'URL do Anexo',
				name: 'attachmentUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['attachment'], operation: ['download'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Para endpoints autenticados, exceto criação/autenticação
		let token: string | undefined;
		let helper: MailTmRequestHelper;

		const needsAuth =
			(resource === 'account' && !['create', 'authenticate'].includes(operation)) ||
			resource === 'message' ||
			resource === 'source' ||
			resource === 'attachment';

		if (needsAuth) {
			const credentials = await this.getCredentials('mailTmApi');
			token = await MailTmRequestHelper.authenticate(credentials.email as string, credentials.password as string);
			helper = new MailTmRequestHelper(token);
		} else {
			helper = new MailTmRequestHelper();
		}

		for (let i = 0; i < items.length; i++) {
			try {
				// --- DOMÍNIO ---
				if (resource === 'domain') {
					if (operation === 'list') {
						const page = this.getNodeParameter('page', i, 1) as number;
						const res = await helper.get('/domains', { page });
						returnData.push({ json: res.data });
					}
					if (operation === 'get') {
						const domainId = this.getNodeParameter('domainId', i) as string;
						const res = await helper.get(`/domains/${domainId}`);
						returnData.push({ json: res.data });
					}
				}

				// --- CONTA ---
				if (resource === 'account') {
					if (operation === 'create') {
						const address = this.getNodeParameter('accountEmail', i) as string;
						const password = this.getNodeParameter('accountPassword', i) as string;
						const res = await helper.post('/accounts', { address, password });
						returnData.push({ json: res.data });
					}
					if (operation === 'authenticate') {
						const address = this.getNodeParameter('accountEmail', i) as string;
						const password = this.getNodeParameter('accountPassword', i) as string;
						const token = await MailTmRequestHelper.authenticate(address, password);
						returnData.push({ json: { token } });
					}
					if (operation === 'getMe') {
						const res = await helper.get('/me');
						returnData.push({ json: res.data });
					}
					if (operation === 'getById') {
						const id = this.getNodeParameter('accountId', i) as string;
						const res = await helper.get(`/accounts/${id}`);
						returnData.push({ json: res.data });
					}
					if (operation === 'delete') {
						const id = this.getNodeParameter('accountId', i) as string;
						const res = await helper.delete(`/accounts/${id}`);
						returnData.push({ json: { success: true, data: res.data } });
					}
				}

				// --- MENSAGEM ---
				if (resource === 'message') {
					if (operation === 'list') {
						const page = this.getNodeParameter('page', i, 1) as number;
						const res = await helper.get('/messages', { page });
						returnData.push({ json: res.data });
					}
					if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const res = await helper.get(`/messages/${messageId}`);
						returnData.push({ json: res.data });
					}
					if (operation === 'delete') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const res = await helper.delete(`/messages/${messageId}`);
						returnData.push({ json: { success: true, data: res.data } });
					}
					if (operation === 'seen') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const seen = this.getNodeParameter('seen', i) as boolean;
						const res = await helper.patch(`/messages/${messageId}`, { seen });
						returnData.push({ json: res.data });
					}
				}

				// --- FONTE DA MENSAGEM ---
				if (resource === 'source') {
					if (operation === 'get') {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						const res = await helper.get(`/sources/${sourceId}`);
						returnData.push({ json: res.data });
					}
				}

				// --- ANEXO ---
				if (resource === 'attachment') {
					if (operation === 'download') {
						const url = this.getNodeParameter('attachmentUrl', i) as string;
						const res = await helper.download(url);
						returnData.push({
							binary: {
								data: Buffer.from(res.data),
							},
							json: { message: 'Anexo baixado com sucesso' },
						});
					}
				}
			} catch (error: any) {
				returnData.push({ json: { error: error.message || error.toString() }, error });
			}
		}

		return [returnData];
	}
}
