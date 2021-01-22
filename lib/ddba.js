const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
	httpOptions: {
		timeout: 5000
	},
	maxRetries: 3
});

const ddba = {

	_getItem: (table, key) => {
		return ddb.get({
				TableName: table,
				Key: key,
			})
			.promise()
			.then(res => res.Item)
			.catch(err => err);
	},

	_getItemByIndex: (table, index, key, filter) => {
		let items = [];
		let params = {
			TableName: table,
			IndexName: index,
			KeyConditionExpression: '#k = :k',
			ExpressionAttributeValues: {
				':k': Object.values(key)[0]
			},
			ExpressionAttributeNames: {
				"#k": Object.keys(key)[0]
			}
		};
		if (typeof filter != 'undefined') {
			params.FilterExpression = '#f = :f';
			params.ExpressionAttributeValues[':f'] = Object.values(filter)[0];
			params.ExpressionAttributeNames['#f'] = Object.keys(filter)[0];
		}
		const evaluateResponse = (res) => {
			items = [...items, ...res.Items];
			if (res.LastEvaluatedKey) {
				params.ExclusiveStartKey = res.LastEvaluatedKey;
				return ddb.query(params)
					.promise()
					.then(res => evaluateResponse(res))
					.catch(err => err);
			}
			return items;
		};
		return ddb.query(params)
			.promise()
			.then(res => evaluateResponse(res))
			.catch(err => err);
	},

	_putItem: (table, item, params = {}) => {
		return ddb.put({
				TableName: table,
				Item: item,
				...params
			})
			.promise()
			.then(res => res)
			.catch(err => err);
	},

	_deleteItem: (table, key) => {
		return ddb.delete({
				TableName: table,
				Key: key,
			})
			.promise()
			.then(res => res)
			.catch(err => err);
	},

	getUser: (uid) => ddba._getItem('gitrows-users', {
		user: uid
	}),

	getUserByName: (username) => ddba._getItemByIndex('gitrows-users', 'username-index', {
		username: username
	}),

	deleteUser: (uid) => ddba._deleteItem('gitrows-users', {
		user: uid
	}),

	getAcl: (guid) => ddba._getItem('gitrows-acl', {
		GUID: guid
	}),

	getAclByPath: (path, filter) => ddba._getItemByIndex('gitrows-acl', 'path-index', {
		path: path
	}, filter),

	getAclByUser: (user, filter) => ddba._getItemByIndex('gitrows-acl', 'user-alias-index', {
		user: user
	}, filter),

	getAclByAlias: (alias, filter) => ddba._getItemByIndex('gitrows-acl', 'alias-index', {
		alias: alias
	}, filter),

	createAcl: (data) => {
		data.created = new Date().toISOString();
		return ddba._putItem('gitrows-acl', data)
	},

	updateAcl: (data) => {
		data.updated = new Date().toISOString();
		return ddba._putItem('gitrows-acl', data)
	},

	deleteAcl: (guid) => ddba._deleteItem('gitrows-acl', {
		GUID: guid
	}),

	getStravaUser: (id) => ddba._getItemByIndex('flink-users', 'id-strava-index', {
		"id:strava": id
	}),

	getFlinkUser: async (id) => {
		let result;
		if (~id.indexOf(':')){
			let [service,uid]=[...id.split(':')];
			switch (service) {
				case 'strava':
					result=await ddba.getStravaUser(uid);
					console.log(result);
					result=Array.isArray(result)?result.pop():result;
					break;
				case 'stripe':
					result=await ddba._getItemByIndex('flink-users', 'customer-index', {
						"customer": uid
					});
					result=Array.isArray(result)?result.pop():result;
					break;
				case 'auth0':
					result=await ddba._getItemByIndex('flink-users', 'id-auth0-index', {
						"id:auth0": uid
					});
					result=Array.isArray(result)?result.pop():result;
					break;

				default:
					var query={};
					query["id:"+service]=uid
					result=await ddba._getItemByIndex('flink-users', `id-${service}-index`, query);
					result=Array.isArray(result)?result.pop():result;
			}
		} else
		result=await ddba._getItem('flink-users', {
			id: id
		});
		return result;
	},

	updateStravaUser: (data) => {
		data.updated = new Date().toISOString();
		return ddba._putItem('strava-users', data)
	},

	updateFlinkUser: (data) => {
		data.updated = new Date().toISOString();
		return ddba._putItem('flink-users', data)
	},

	createStravaActivity:(data) => {
		data.source = 'strava';
		return ddba._putItem('flink-activities', data)
	},

	updateStravaActivity:(data) => {
		data.updated = new Date().toISOString();
		return ddba.createStravaActivity(data);
	},

	getStravaActivity:(id) => ddba._getItem('flink-activities', {
		id: id,
		source: 'strava'
	}),

	deleteStravaActivity:(id) => ddba._deleteItem('flink-activities', {
		id: id,
		source: 'strava'
	}),

	getAthleteActivities: (id) => ddba._getItemByIndex('flink-activites', 'athlete-index', {
		"athlete": id
	}),

	createLock: (id) => ddb.put({
		TableName: 'gitrows-transactions',
		Item: {
			id: id,
			expire: Math.floor(Date.now() / 1000) + 3600
		},
		ConditionExpression: 'attribute_not_exists(id)'
	}).promise(),

};
module.exports = ddba;
