docker exec -i mariadb-test mysql -u root -ppassword resources -h 172.71.7.194 < hms_schema.sql
docker exec -i mariadb-test mysql -u root -ppassword resources -h 172.71.7.194 < init_data.sql

DROP DATABASE IF EXISTS resources;
CREATE DATABASE resources;
USE resources;