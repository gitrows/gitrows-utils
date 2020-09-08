const String={

	mime:(extension)=>{
		const mimetypes={
			csv:'text/csv',
			json:'application/json',
			md:'text/markdown',
			yaml:'application/x-yaml'
		}
		return mimetypes[extension]||'application/octet-stream';
	},

	btoa: string => typeof window === 'undefined'?Buffer.from(string, 'utf-8').toString('base64'):window.btoa(string),

	atob: string => typeof window === 'undefined'?Buffer.from(string, 'base64').toString('utf-8'):window.atob(string),
}

module.exports=String;
