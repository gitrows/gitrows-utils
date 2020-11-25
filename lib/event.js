const url = require('url');
const Event={

	getData:(event)=>{
		let body=event.isBase64Encoded?Buffer.from(event.body, 'base64').toString('utf-8'):event.body;
		let data,urlParams;
		switch (event.headers['content-type']) {
			case 'application/x-www-form-urlencoded':
				urlParams=new url.URLSearchParams(body);
				data=Object.fromEntries(urlParams);
				break;

			default:
			try {
				data=JSON.parse(body);
			} catch (e) {
				data=body;
			}
		}
		return data;
	},

	getQueryParams:(event)=>{
		if (Event.hasMultiHeaders(event))
			return Event._flatten(event.multiValueQueryStringParameters);
		return event.queryStringParameters;
	},

	getHeaders:(event)=>{
		if (Event.hasMultiHeaders(event))
			return Event._flatten(event.multiValueHeaders);
		return event.headers;
	},

	getAuth:(event)=>{
		const headers=Event.getHeaders(event);
		if (Array.isArray(headers.authorization))
			headers.authorization=headers.authorization.pop();
		headers.authorization?headers.authorization.split(' '):false;
	},

	getCookies:(event)=>{
		const headers=Event.getHeaders(event);
		return headers.cookie?Object.fromEntries(headers.cookie.split('; ').map(x => x.split('='))):{};
	},

	hasMultiHeaders:(event)=>{
		return !!(event.multiValueHeaders);
	},

	_flatten:(data)=>{
		Object.keys(data).forEach((key)=>{
			if (Array.isArray(data[key])&&data[key].length<2) data[key]=data[key][0];
		});
		return data;
	},

}
module.exports = Event;
