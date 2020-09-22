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

	uid: (length=12) => {for(var a = '', b = 36; a.length < length;) a += (Math.random() * b | 0).toString(b);return a;},

	uuid: () => {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=> {
	    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
  	});
	},

	toUrlString:(buffer)=>buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '').toLowerCase(),

}

module.exports=String;
