![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-mailtm

This is an n8n community node. It lets you use Mail.tm in your n8n workflows.

Mail.tm is a free disposable email service with a public API, ideal for testing, automations, and temporary registrations that require email confirmation.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

To install in your n8n instance:

```bash
n8n install @opastorello/n8n-nodes-mailtm
```
or

```bash
npm install @opastorello/n8n-nodes-mailtm
```

## Operations

The Mail.tm node supports the following operations:

### Domains
- List all available domains
- Get a domain by ID

### Accounts
- Create a new temporary account
- Authenticate (retrieve JWT token)
- Get account info (by token or by ID)
- Delete account (irreversible)

### Messages
- List all messages (with pagination)
- Get message details by ID
- Delete message
- Mark message as read/unread

### Message Source
- Retrieve full MIME/raw source of a message

### Attachments
- Download attachments from your mailbox

### Trigger Node
- Instantly trigger workflows when a new email arrives in your inbox

## Credentials

You must authenticate with your Mail.tm account to access most API features.

**Set up:**
1. Go to [https://mail.tm](https://mail.tm) and create a temporary email account, or use the node to create one.
2. In n8n, go to **Credentials > New credential** and search for “Mail.tm API”.
3. Enter the email and password of your Mail.tm account.

No API key is required. The node will handle token generation automatically.

## Compatibility

- Requires n8n v1.0.0 or newer.
- Tested with n8n v1.x and v2.x.
- No known incompatibilities.

## Usage

- Add the **Mail.tm** node to your workflow and select the operation you want.
- For automatic reactions to incoming mail, use the **Mail.tm Trigger** node and set the polling interval.
- Attachments are returned as binary data for use in other n8n nodes.
- All API errors are returned as JSON for easy troubleshooting.
- The Mail.tm API does **not** support sending emails (receive-only).

For more on getting started with n8n, see the [Try it out](https://docs.n8n.io/try-it-out/) documentation.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Mail.tm API documentation](https://docs.mail.tm)

## Version history

- **1.0.0** — Initial release. Supports all main Mail.tm API endpoints and trigger node.
