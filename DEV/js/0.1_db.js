function getDatabase(){
	return openDatabase('querys_app','1.0','Almacenamiento de prueba de información, consultas sqlite', 1000000);
}

function comprobarTablas(){
	const db = getDatabase();
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(`CREATE TABLE IF NOT EXISTS t1 (
					id int primary key,
					nombre varchar(200),
					apellidos varchar(300),
					edad int
				);`
			);

			tx.executeSql(`CREATE TABLE IF NOT EXISTS t2 (
					id int,
					modelo varchar(200),
					color varchar(300),
					año int
				);`
			);

			tx.executeSql(`CREATE TABLE IF NOT EXISTS t1 (
					id int,
					sabor varchar(200),
					cantidad int
				);`
			);
		}, function(err){
			reject(err.message)
			// console.error(err.message)
		}, function(){
			resolve();
		})
	})
}