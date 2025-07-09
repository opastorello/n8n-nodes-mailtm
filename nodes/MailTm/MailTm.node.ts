import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class MailTm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mail.tm',
		name: 'mailTm',
		icon: 'file:MailTm.svg',
		group: ['output'],
		version: 1,
		description: 'Interact with the Mail.tm temporary email API',
		defaults: {
			name: 'Mail.tm',
		},
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		credentials: [],
		properties: [
			// ----------------------------------
			//         Operation
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage accounts',
						action: 'Manage accounts',
					},
					{
						name: 'Message',
						value: 'message',
						description: 'Manage messages',
						action: 'Manage messages',
					},
					{
						name: 'Attachment',
						value: 'attachment',
						description: 'Manage attachments',
						action: 'Manage attachments',
					},
					{
						name: 'Workflow',
						value: 'workflow',
						description: 'Perform complex workflows',
						action: 'Perform complex workflows',
					},
				],
				default: 'message',
			},

			// --------------------------------------------------------------------------
			//         Auth Token Field (Corrected Visibility)
			// --------------------------------------------------------------------------
			{
				displayName: 'Auth Token',
				name: 'authToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'Token de autenticação de um passo anterior. Se preenchido, sobrepõe o uso de credenciais.',
				displayOptions: {
					hide: {
						accountAction: ['accountCreate'],
						workflowAction: ['domains:listAll'],
					},
				},
			},

			// --------------------------------------------------------------------------
			// -------------------------      ACCOUNT      ------------------------------
			// --------------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'accountAction',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['account'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'accounts:create',
						description: 'Create a new email account',
						action: 'Create an account',
					},
					{
						name: 'Get Authenticated User Info',
						value: 'accountGetAuthenticatedUser',
						description: 'Get details of the currently authenticated user',
						action: 'Get authenticated user info',
					},
				],
				default: 'accountGetAuthenticatedUser',
			},
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						accountAction: ['accountCreate'],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				displayOptions: {
					show: {
						accountAction: ['accountCreate'],
					},
				},
			},

			// --------------------------------------------------------------------------
			// -------------------------      MESSAGE      ------------------------------
			// --------------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'messageAction',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['message'],
					},
				},
				options: [
					{
						name: 'Delete',
						value: 'messagesDelete',
						description: 'Delete a single message',
						action: 'Delete a message',
					},
					{
						name: 'Delete All',
						value: 'messagesDeleteAll',
						description: 'Delete ALL messages in the inbox. Use with caution.',
						action: 'Delete all messages',
					},
					{
						name: 'Get by ID',
						value: 'messagesGetById',
						description: 'Get a single message by its ID',
						action: 'Get a message by ID',
					},
					{
						name: 'Get Latest',
						value: 'messagesGetLatest',
						description: 'Get the most recent message in the inbox',
						action: 'Get the latest message',
					},
					{
						name: 'List All',
						value: 'messagesListAll',
						description: 'List all messages in the inbox (paginated)',
						action: 'List all messages',
					},
					{
						name: 'Mark as Read',
						value: 'messagesMarkAsRead',
						description: 'Mark a message as read',
						action: 'Mark a message as read',
					},
				],
				default: 'messagesGetLatest',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						messageAction: ['messagesGetById', 'messagesMarkAsRead', 'messagesDelete'],
					},
				},
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						messageAction: ['messagesListAll'],
					},
				},
			},

			// --------------------------------------------------------------------------
			// -------------------------      ATTACHMENT      ---------------------------
			// --------------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'attachmentAction',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['attachment'],
					},
				},
				options: [
					{
						name: 'Download',
						value: 'attachmentsDownload',
						description: 'Download a single attachment from a message',
						action: 'Download an attachment',
					},
				],
				default: 'attachmentsDownload',
			},
			{
				displayName: 'Message ID',
				name: 'attachmentMessageId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['attachment'],
					},
				},
			},
			{
				displayName: 'Attachment ID',
				name: 'attachmentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['attachment'],
					},
				},
			},

			// --------------------------------------------------------------------------
			// -------------------------      WORKFLOW      -----------------------------
			// --------------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'workflowAction',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['workflow'],
					},
				},
				options: [
					{
						name: 'Apply Inbox Rules',
						value: 'workflows:applyInboxRules',
						description: 'Apply a set of rules (e.g., delete, mark as read) to the inbox',
						action: 'Apply inbox rules',
					},
					{
						name: 'Get Inbox Summary',
						value: 'inbox:getSummary',
						description: 'Get a summary of the inbox (total, unread, etc.)',
						action: 'Get inbox summary',
					},
					{
						name: 'Get Latest Unread and Mark as Read',
						value: 'messagesGetLatestUnreadAndMarkAsRead',
						description: 'Get the latest unread message and mark it as read',
						action: 'Get latest unread and mark as read',
					},
					{
						name: 'List Domains',
						value: 'domains:listAll',
						description: 'List all available domains for account creation',
						action: 'List domains',
					},
					{
						name: 'Wait for Message and Extract URLs',
						value: 'workflows:waitForMessageAndExtractUrl',
						description: 'Wait for a message to arrive and extract all URLs from it',
						action: 'Wait for message and extract URLs',
					},
				],
				default: 'workflows:waitForMessageAndExtractUrl',
			},
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeoutSeconds',
				type: 'number',
				default: 60,
				displayOptions: {
					show: {
						workflowAction: ['workflows:waitForMessageAndExtractUrl'],
					},
				},
			},
			{
				displayName: 'Subject Contains',
				name: 'subject',
				type: 'string',
				default: '',
				description: '(Optional) Wait for a message whose subject contains this text',
				displayOptions: {
					show: {
						workflowAction: ['workflows:waitForMessageAndExtractUrl'],
					},
				},
			},
			{
				displayName: 'Rules',
				name: 'rules',
				type: 'json',
				typeOptions: {
					alwaysOpen: true,
				},
				default: `[
          {"if": {"from": "spam@example.com"}, "then": "delete"},
          {"if": {"subjectContains": "Newsletter"}, "then": "markAsRead"},
          {"if": {"from": "boss@example.com"}, "then": "ignore"}
        ]`,
				description: 'JSON array of rules to apply to the inbox',
				displayOptions: {
					show: {
						workflowAction: ['workflows:applyInboxRules'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const baseUrl = 'https://api.mail.tm';

		for (let i = 0; i < items.length; i++) {
			try {
				const operationType = this.getNodeParameter('operation', i) as string;
				let operation = '';
				if (operationType === 'account') {
					operation = this.getNodeParameter('accountAction', i) as string;
				} else if (operationType === 'message') {
					operation = this.getNodeParameter('messageAction', i) as string;
				} else if (operationType === 'attachment') {
					operation = this.getNodeParameter('attachmentAction', i) as string;
				} else if (operationType === 'workflow') {
					operation = this.getNodeParameter('workflowAction', i) as string;
				}

				let token: string | undefined;

				const noAuthOperations = ['domains:listAll', 'accountCreate'];

				if (!noAuthOperations.includes(operation)) {
					token = this.getNodeParameter('authToken', i, '') as string;

					if (!token) {
						try {
							const credentials = await this.getCredentials('mailTmApi', i);
							const tokenResponse = await this.helpers.request({
								method: 'POST',
								url: `${baseUrl}/token`,
								body: {
									address: credentials.address as string,
									password: credentials.password as string,
								},
								json: true,
							});
							token = tokenResponse.token as string;
						} catch (error) {
							// Silently ignore if credentials are not found, so the final error is clearer
						}
					}

					if (!token) {
						throw new NodeOperationError(
							this.getNode(),
							'Authentication required. Provide an Auth Token or set up credentials for this node.',
							{ itemIndex: i },
						);
					}
				}

				let response: any;

				switch (operation) {
					case 'accountCreate': {
						const username = this.getNodeParameter('username', i) as string;
						const password = this.getNodeParameter('password', i) as string;
						let address = '';

						const domainsList = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/domains`,
							json: true,
						});

						if (!Array.isArray(domainsList) || !domainsList[0]?.domain) {
							throw new NodeOperationError(this.getNode(), 'No available domains found.');
						}

						const firstDomain = domainsList[0].domain;

						address = `${username}@${firstDomain}`;

						const accountData = await this.helpers.request({
							method: 'POST',
							url: `${baseUrl}/accounts`,
							body: { address, password },
							json: true,
						});

						const tokenData = await this.helpers.request({
							method: 'POST',
							url: `${baseUrl}/token`,
							body: { address, password },
							json: true,
						});

						response = {
							account: accountData,
							tokenInfo: tokenData,
						};
						break;
					}

					case 'accountGetAuthenticatedUser': {
						response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/me`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						break;
					}

					// MESSAGE CASES
					case 'messagesListAll': {
						const pageNumber = this.getNodeParameter('page', i, 1) as number;
						response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/messages?page=${pageNumber}`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						break;
					}
					case 'messagesGetById': {
						const messageId = this.getNodeParameter('messageId', i) as string;
						response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/messages/${messageId}`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						break;
					}
					case 'messagesGetLatest': {
						const messagesList = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/messages?page=1`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						response = messagesList['hydra:member']?.[0] || { message: 'No messages found.' };
						break;
					}
					case 'messagesMarkAsRead': {
						const messageId = this.getNodeParameter('messageId', i) as string;
						response = await this.helpers.request({
							method: 'PATCH',
							url: `${baseUrl}/messages/${messageId}`,
							headers: {
								Authorization: `Bearer ${token}`,
								'Content-Type': 'application/merge-patch+json',
							},
							body: {
								seen: true,
							},
							json: true,
						});
						break;
					}
					case 'messagesDelete': {
						const messageId = this.getNodeParameter('messageId', i) as string;
						await this.helpers.request({
							method: 'DELETE',
							url: `${baseUrl}/messages/${messageId}`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						response = { success: true, message: `Message ${messageId} deleted.` };
						break;
					}
					case 'messagesDeleteAll': {
						const messagesList = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/messages`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						let deletedCount = 0;
						for (const message of messagesList['hydra:member'] || []) {
							await this.helpers.request({
								method: 'DELETE',
								url: `${baseUrl}/messages/${message.id}`,
								headers: { Authorization: `Bearer ${token}` },
								json: true,
							});
							deletedCount++;
							await new Promise((resolve) => setTimeout(resolve, 150));
						}
						response = { success: true, deletedCount };
						break;
					}

					// ATTACHMENT CASES
					case 'attachmentsDownload': {
						const messageId = this.getNodeParameter('attachmentMessageId', i) as string;
						const attachmentId = this.getNodeParameter('attachmentId', i) as string;
						const message = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/messages/${messageId}`,
							headers: { Authorization: `Bearer ${token}` },
							json: true,
						});
						const attachment = message.attachments.find((att: any) => att.id === attachmentId);
						if (!attachment) {
							throw new NodeOperationError(this.getNode(), 'Attachment not found.');
						}
						const binaryData = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}${attachment.downloadUrl}`,
							headers: { Authorization: `Bearer ${token}` },
							encoding: 'arraybuffer',
						});

						const binary = await this.helpers.prepareBinaryData(
							Buffer.from(binaryData as ArrayBuffer),
							attachment.filename,
						);

						returnData.push({
							json: items[i].json,
							binary: {
								data: binary,
							},
						});
						continue;
					}

					// WORKFLOW CASES
					case 'domains:listAll': {
						response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/domains`,
							json: true,
						});
						break;
					}
					case 'workflows:waitForMessageAndExtractUrl': {
						const timeoutSeconds = this.getNodeParameter('timeoutSeconds', i, 60) as number;
						const subject = this.getNodeParameter('subject', i, '') as string;
						const pollInterval = 5000;
						const startTime = Date.now();
						let messageContent: any = null;
						while (Date.now() - startTime < timeoutSeconds * 1000) {
							const messagesList = await this.helpers.request({
								method: 'GET',
								url: `${baseUrl}/messages?page=1`,
								headers: { Authorization: `Bearer ${token}` },
								json: true,
							});
							const potentialMessage = subject
								? messagesList['hydra:member']?.find((msg: any) =>
										msg.subject.toLowerCase().includes(subject.toLowerCase()),
									)
								: messagesList['hydra:member']?.[0];
							if (potentialMessage) {
								messageContent = await this.helpers.request({
									method: 'GET',
									url: `${baseUrl}/messages/${potentialMessage.id}`,
									headers: { Authorization: `Bearer ${token}` },
									json: true,
								});
								break;
							}
							await new Promise((resolve) => setTimeout(resolve, pollInterval));
						}
						if (!messageContent) {
							throw new NodeOperationError(
								this.getNode(),
								`Timeout: No matching message arrived in ${timeoutSeconds} seconds.`,
							);
						}
						const urlRegex = /https?:\/\/[^\s"<>]+/gi;
						const body = messageContent.html?.join('') || messageContent.text || '';
						const urlsFound = body.match(urlRegex);
						response = { message: messageContent, extractedUrls: urlsFound || [] };
						break;
					}
				}

				if (response) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(response),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}
		return this.prepareOutputData(returnData);
	}
}
