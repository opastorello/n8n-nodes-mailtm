import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	ITriggerResponse,
} from 'n8n-workflow';
import { MailTmRequestHelper } from './MailTmRequestHelper';

/**
 * Node de disparo (gatilho) Mail.tm para n8n
 * Aciona o workflow sempre que uma nova mensagem for recebida na conta Mail.tm
 * Documentação e UX seguindo o padrão do node MailTm principal
 */
export class MailTmTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mail.tm Trigger',
    name: 'mailTmTrigger',
    icon: 'file:MailTm.svg',
		group: ['trigger'],
		version: 1,
		description: 'Dispara o workflow quando uma nova mensagem é recebida na conta Mail.tm',
		defaults: {
			name: 'Mail.tm Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'mailTmApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Intervalo de checagem (segundos)',
				name: 'pollInterval',
				type: 'number',
				default: 60,
				description: 'Com que frequência verificar se há novos emails (mínimo: 10s)',
				typeOptions: {
					minValue: 10,
				},
			},
			{
				displayName: 'Marcar mensagem como lida após acionar?',
				name: 'markAsRead',
				type: 'boolean',
				default: true,
				description: 'Define se a mensagem será marcada como lida após disparar o workflow',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('mailTmApi');
		const token = await MailTmRequestHelper.authenticate(
			credentials.email as string,
			credentials.password as string
		);
		const helper = new MailTmRequestHelper(token);

		let lastSeenMessageId: string | undefined;

		const pollInterval = this.getNodeParameter('pollInterval', 0) as number;
		const markAsRead = this.getNodeParameter('markAsRead', 0) as boolean;

		const poll = async () => {
			const response = await helper.get('/messages', { page: 1 });
			const messages = response.data['hydra:member'] ?? [];
			if (messages.length === 0) return;

			// Encontra todas as mensagens novas (não vistas) desde o último polling
			const newMessages: any[] = [];
			for (const msg of messages) {
				if (msg.id === lastSeenMessageId) break;
				newMessages.push(msg);
			}

			if (newMessages.length > 0) {
				// Atualiza o ID da mensagem mais recente para não reenviar
				lastSeenMessageId = newMessages[0].id;
				// Emite cada nova mensagem recebida
				for (const msg of newMessages.reverse()) {
					if (markAsRead && !msg.seen) {
						await helper.patch(`/messages/${msg.id}`, { seen: true });
					}
					this.emit([
						{
							json: msg,
						} as INodeExecutionData,
					]);
				}
			}
		};

		const interval = setInterval(poll, pollInterval * 1000);

		async function closeFunction() {
			clearInterval(interval);
		}

		return {
			closeFunction,
		};
	}
}
