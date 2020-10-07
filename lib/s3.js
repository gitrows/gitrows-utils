const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const mime = require('mime-types');
const CSV = {
	parse:require('csv-parse/lib/sync'),
	stringify: require('csv-stringify/lib/sync')
};

const S3 = {

	 _getData: (bucket, key) => {
			const type = mime.lookup(key);
			const params = {
				Bucket: bucket,
				Key: key,
			};
			return s3.getObject(params).promise().then(r => r.Body.toString('utf-8')).then(b=>S3._parse(b,mime.extension(type))).catch(e => console.log(e));
		},

		 _putData: (bucket, key, data) => {
				const type = mime.lookup(key);
				const body = S3._stringify(data,mime.extension(type));
				const params = {
					Bucket: bucket,
					Key: key,
					Body: body,
					ContentType: type,
					ACL: 'public-read'
				};
				return s3.putObject(params).promise().then(r => r).catch(e => console.log(e));
			},

			 _stringify: (obj, type = 'json') => {
					try {
						switch (type.toLowerCase()) {
							case 'csv':
								return Array.isArray(obj) ? CSV.stringify(obj, {
									header: true
								}) : null;
								break;
							default:
								return JSON.stringify(obj, null, 2);
						}
					} catch (e) {
						return null;
					}
				},

			 _parse: (content, type = 'json') => {
					type = type.toLowerCase();
					try {
						switch (type) {
							case 'csv':
								return CSV.parse(content, {
									columns: true,
									skip_empty_lines: true,
									cast: true
								});
								break;
							default:
								return JSON.parse(content);
						}
					} catch (e) {
						return null;
					}
				},
}

module.exports=S3;
