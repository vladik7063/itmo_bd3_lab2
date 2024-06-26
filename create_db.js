const mysql = require('mysql2/promise');

async function createDatabaseAndTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'scientist',
        password: 'pass1234',
    });

    await connection.query('DROP DATABASE IF EXISTS observatorbd');
    await connection.query('CREATE DATABASE observatorbd');
    await connection.changeUser({ database: 'observatorbd' });

    try {
        await connection.query(`
            CREATE TABLE sector (
                id INT PRIMARY KEY AUTO_INCREMENT,
                coordinates VARCHAR(255) NOT NULL,
                light_intensity DECIMAL(10, 2) NOT NULL,
                foreign_objects TEXT,
                star_objects_count INT NOT NULL,
                undefined_objects_count INT NOT NULL,
                defined_objects_count INT NOT NULL,
                notes TEXT
            );
        `);
        await connection.query(`
            CREATE TABLE objects (
                id INT PRIMARY KEY AUTO_INCREMENT,
                type VARCHAR(255) NOT NULL,
                accuracy DECIMAL(5, 2) NOT NULL,
                quantity INT NOT NULL,
                time TIME NOT NULL,
                date DATE NOT NULL,
                notes TEXT
            );
        `);
        await connection.query(`
            CREATE TABLE natural_objects (
                id INT PRIMARY KEY AUTO_INCREMENT,
                type VARCHAR(255) NOT NULL,
                galaxy VARCHAR(255) NOT NULL,
                accuracy DECIMAL(5, 2) NOT NULL,
                light_flux DECIMAL(10, 2) NOT NULL,
                associated_objects TEXT,
                notes TEXT
            );
        `)
        await connection.query(`
            CREATE TABLE position (
                id INT PRIMARY KEY AUTO_INCREMENT,
                earth_pos VARCHAR(255) NOT NULL,
                sun_pos VARCHAR(255) NOT NULL,
                moon_pos VARCHAR(255) NOT NULL
            );
        `);

        await connection.query(`
            CREATE TABLE Observation (
                id INT PRIMARY KEY AUTO_INCREMENT,
                sector_id INT NOT NULL,
                object_id INT NOT NULL,
                natural_object_id INT NOT NULL,
                position_id INT NOT NULL,
                observation_time TIME NOT NULL,
                observation_date DATE NOT NULL,
                comments TEXT,
                FOREIGN KEY (sector_id) REFERENCES sector(id),
                FOREIGN KEY (object_id) REFERENCES objects(id),
                FOREIGN KEY (natural_object_id) REFERENCES natural_objects(id),
                FOREIGN KEY (position_id) REFERENCES position(id)
            );
        `);
        await connection.query(`
            CREATE TRIGGER update_object_trigger
            AFTER UPDATE ON Object
            FOR EACH ROW
            BEGIN
                UPDATE objects SET date_update = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
        `);
        await connection.query(`
            CREATE PROCEDURE join_tables(IN table1 VARCHAR(255), IN table2 VARCHAR(255))
            BEGIN
                SET @query = CONCAT('SELECT * FROM ', table1, ' t1 JOIN ', table2, ' t2 ON t1.id = t2.id');
                PREPARE stmt FROM @query;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            END;
        `)
        console.log("Таблицы созданы.");
    } catch (error) {
        console.error("Ошибка при создании таблиц:", error);
    }

    await connection.end();
}

createDatabaseAndTables().catch(err => {
    console.error('Ошибка создания базы данных', err);
});