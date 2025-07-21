import { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Credencial Mail.tm para n8n
 * Usada para autenticação nos endpoints protegidos da API Mail.tm.
 * Documentação e UX seguindo o padrão dos nodes MailTm e MailTmTrigger.
 */
export class MailTmApi implements ICredentialType {
	name = 'mailTmApi';
	displayName = 'Mail.tm API';
	documentationUrl = 'https://docs.mail.tm';
	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			required: true,
			description: 'Email da conta Mail.tm temporária',
		},
		{
			displayName: 'Senha',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Senha da conta Mail.tm temporária',
		},
	];
}
