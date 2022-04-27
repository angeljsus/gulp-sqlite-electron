const db = getDatabase();

function select(nombreTabla, jsonProp){
	console.log('Generando consulta..')
	let query = 'SELECT ';
	let objectVars = [], objectVals = [], objectCond = [], params = [], resultado = [];
	let object = {}, jsonResponse = {}, hayWere = {};
	let type = '', queryReturn = '', mensaje = '', contBucle = 1;

	return new Promise(function(resolve, reject){
		if (jsonProp) {
			// existen las columnas?
			if (jsonProp.cols && jsonProp.cols.length > 0) {
				query += jsonProp.cols.replace(/,$/, '');
			} else {
				query += '*';
				// sera todo *
			}
			// hay condiciones ?  
			if (jsonProp.where) {
				object = getCondiciones(jsonProp, nombreTabla)
				if (object.error) {
					reject(object.error)
				} else {
					query += ` FROM ${nombreTabla} WHERE ${object.complemento}`;
					jsonResponse = { consulta : query, valorVariables : object.valorVariables}
				}
			} 
			else {
					query += ` FROM ${nombreTabla} `;
					jsonResponse = { consulta : query, valorVariables : []}
			}
			resolve(jsonResponse)
		}
	})
	.then(function(data){
		// console.warn(data)
		queryReturn = data.consulta
		return new Promise(function(resolve, reject){
			// hay agrupaciones
			contBucle = 1;
			if (jsonProp.group) {
				if (jsonProp.group.variables) {
					queryReturn += `GROUP BY `;
					// si las existen valores dentro del grupo 
					if (jsonProp.group.valores && jsonProp.group.condiciones) {
						objectVars = jsonProp.group.variables.replace(/,$/, '').split(',');
						objectCond = jsonProp.group.condiciones.replace(/,$/, '').split(',')
						objectVals = jsonProp.group.valores.replace(/__$/, '').split('__');
						if (objectVars.length == objectVals.length && objectVars.length == objectCond.length) {
							objectVars.forEach(function(variable, index){
								queryReturn += `${objectVars[index]} `;
								queryReturn += `${objectCond[index]} `;
								type = parseInt(objectVals[index]);
								type = typeof type;
								if (type == 'number') {
									queryReturn += `${objectVals[index]}`;
								} else {
									queryReturn += `"${objectVals[index]}"`;
								}
								if (contBucle == objectVars.length) {
									queryReturn += '';
								} else {
									queryReturn += ',';
								}
								contBucle++;
							})
						} else {
							reject(`Faltan parametros en para agrupar con condicionales, deben ser la misma cantidad de variables\nvars: ${objectVars.length}\ncondc:${objectCond.length}\nvals:${objectVals.length}\nseparacion: ___`)
						}
					} else {
						queryReturn += jsonProp.group.variables;
					}
				}
			}
			// hay ordenamiento
			if (jsonProp.order && jsonProp.order.variables) {
				console.log('Hay ordenamiento')
				queryReturn += ` ORDER BY ${jsonProp.order.variables.replace(/,$/, '')}`;
				if (jsonProp.order.type) {
					queryReturn += ` ${jsonProp.order.type}`;
				}
			}
			// hay limite
			if (jsonProp.limit) {
				if (jsonProp.limit.start || jsonProp.limit.start == 0 && jsonProp.limit.start !== false) {
					queryReturn += ` LIMIT ${jsonProp.limit.start}`;
					if (jsonProp.limit.end){
						// agregar end
						queryReturn += `, ${jsonProp.limit.end}`;
					}
				}
			}
			// finalize
			queryReturn += ';';
			data.consulta = queryReturn;
			resolve(data)
		})
	})
	.then(function(data){
		queryReturn = data.consulta;
		console.warn('INFO:\nQuery: %s\nValores: %s',queryReturn, JSON.stringify(data.valorVariables));
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				console.log('Ejecutando consulta...')
				tx.executeSql(queryReturn, data.valorVariables, function(tx, results){
					console.log('Resultados encontrados: %s', results.rows.length)
					resultado = Object.keys(results.rows).map(function (key) { return results.rows[key]; });
					resolve(resultado);
				})
			}, function(err){
				console.log(err)
			})
		})
	})
}

function insert(nombreTabla, jsonProp){
	let mensaje = '';
	return new Promise(function(resolve, reject){
		if (jsonProp.cols) {
			resolve(jsonProp.cols.replace(/__$/,'').split('__'))
		} else {
			mensaje = 'No hay columnas para insertar.\n';
			reject(mensaje)
		}
	}) 
	.then(function(data){
		query = `INSERT INTO ${nombreTabla} VALUES (`
		data.forEach(function(item){
			query += '?,'
		})
		query = query.replace(/,$/,'');
		query += ');'
		// console.log(query)
		return new Promise(function(resolve, reject){
			// console.log('Consulta: %s', query)
			console.warn('INFO:\nQuery: %s\nValores: [%s]',query, JSON.stringify(data));
			db.transaction(function(tx){
				tx.executeSql(query, data)
			}, function(err){
				reject(err.message)
			}, function(){
				mensaje = `Fila insertada: ${JSON.stringify(data)}`
				resolve(data)
			})
		})
	}) 
}


function update(nombreTabla, jsonProp){
	let mensaje = '', query = '';
	return new Promise(function(resolve, reject){
		mensaje += 'Faltan cosas:\n'
		let error = 0, cols = 0, colsNames = 0;
		let response = {}, status = {};

		if (!jsonProp.cols) {
			mensaje += 'cols: No hay valores para modificar\n';
			error++;
		} else {
			cols = jsonProp.cols.replace(/__$/,'').split('__');
		}

		if (!jsonProp.colsNames) {
			mensaje += 'colsNames: No hay nombre de columnas\n';
			error++;
		} else {
			colsNames = jsonProp.colsNames.replace(/,$/,'').split(',');
			if (cols.length !== colsNames.length) {
				mensaje += `Los parametros no tienen las mismas cantidades:\ncols: ${cols.length}\ncolsNames: ${colsNames.length}`;
				error++;
			}
		}

		if (error > 0) {
			reject(mensaje)
		} else {
			if (jsonProp.where) {
				status = getCondiciones(jsonProp, nombreTabla)
				response = {valores : cols, columnas : colsNames, condicion: status}
			} else {
				response = {valores : cols, columnas : colsNames}
			}

			resolve(response)
		}
	})
	.then(function(object){
		return new Promise(function(resolve, reject){
			// hay algun error retornado
			if (object.condicion.error) {
				reject(object.condicion.error)
			} else {
				query = `UPDATE ${nombreTabla} SET `;
				object.columnas.forEach(function(colName, index){
					if (index == 0) {
						query += `${colName} = ?`
					} else {
						query += `, ${colName} = ?`
					}
				})
				// agregar las condiciones
				let noModificar = object.valores;
				let valores = [];
				// mandar los valores de las modificaciones
				object.valores.forEach(function(valor){
					valores.push(valor)
				})
				if (object.condicion.complemento) {
					query += ' WHERE ' + object.condicion.complemento;
					// mandar los valores de las condiciones
					object.condicion.valorVariables.forEach(function(valor){
						valores.push(valor)
					})
				}
				// end query
				query += ';';
				resolve({consulta: query, valores: valores, dataReturn : noModificar})
			}
		})
	})
	.then(function(data){
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				console.warn('INFO:\nQuery: %s\nValores: %s',data.consulta, JSON.stringify(data.valores));
				tx.executeSql(query, data.valores, function(tx, results){
					console.log('Registros actualizados: %s\nValores consultados: %s',results.rowsAffected,JSON.stringify(data.dataReturn) )
					resolve(results.rowsAffected)
				})
			}, function(err){
				reject(err.message)
			}, function(){
			})
		})
	}) 
}

function deleteReg(nombreTabla, jsonProp){
	let object = {};
	let jsonResponse = { consulta : '', valores : []}
	let query = '';
	return new Promise(function(resolve, reject){
		if (jsonProp.where) {
			object = getCondiciones(jsonProp, nombreTabla);
			if (object.error) {
				reject(object.error)
			} else {
				query += `DELETE FROM ${nombreTabla} `;
				if (object.complemento) {
					query += `WHERE ${object.complemento}`
					jsonResponse.valores = object.valorVariables;
				}
				jsonResponse.consulta = query;
				resolve(jsonResponse)
			}
		}
	})
	.then(function(data){
		console.log(data)
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				console.warn('INFO:\nQuery: %s\nValores: %s',data.consulta, JSON.stringify(data.valores));
				tx.executeSql(query, data.valores, function(tx, results){
					console.log('Registros eliminados: %s\nValores consultados: %s',results.rowsAffected,JSON.stringify(data.valores) )
					resolve(results.rowsAffected)
				})
			}, function(err){
				reject(err.message)
			}, function(){
			})
		})
	})

}


function getCondiciones(json, nombreTabla){
	// console.log(json)
	let query = '', condicion = '', mensaje = '', contBucle = 1;
	let object = {};
	if (json.where.variables && json.where.valores) {
		console.log('Hay propiedades')
		// se convierte en arreglo
		objectVars = json.where.variables.replace(/,$/, '').split(',');
		objectVals = json.where.valores.replace(/__$/, '').split('__');
		if (json.where.condiciones) {
			// hay condiciones
			objectCond = json.where.condiciones.split(',')
			condicion = true;
		}
		objectVars.forEach(function(variable, index){
			if (!objectVals[index] && objectVals[index] < 0 ) { 
				mensaje = `La cantidad de valores no corresponde a las variables enviadas, vars: ${objectVars.length} vals: ${objectVals.length}`;
			};
			query += variable + ' ';
			if (condicion > 0) {
				if (objectCond[index]) {
					// agrega la condicion que lleva
					query += `${objectCond[index]} `;
				} else {
					// agrega el operador =
					query += '= ';
				}
			} else {
				// todas las condiciones serán =
					query += '= ';
			}
			query += '? ';
			if (objectVars.length > contBucle) {
				query += `AND `;
			}
			contBucle++;
		})
		if (objectVars.length == objectVals.length) {
			object ={complemento : query, error: mensaje, valorVariables : objectVals} 
		} else {
			mensaje = `La cantidad de valores no corresponde a las variables enviadas, object.where.valores: ${objectVars.length} object.where.variables: ${objectVals.length}`;
			object ={complemento : query, error: mensaje, valorVariables : objectVals} 
		}
		return object;
	} 
	else {
		if (!json.where.variables && !json.where.valores) {
			mensaje = '';
		} else {
			mensaje = `No existe variable o valor de object.where.valores o object.where.variables`;
		}
		object ={error: mensaje} 
		return object;
	}
}

module.exports = { select, insert, update, deleteReg};