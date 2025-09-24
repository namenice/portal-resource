-- 1. Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vendors Table
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 3. Hardware Types Table
CREATE TABLE hardware_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT DEFAULT ''
);

-- 4. Hardware Statuses Table
CREATE TABLE hardware_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT DEFAULT ''
);

-- 5. Hardware Model Table
CREATE TABLE hardware_models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    UNIQUE KEY unique_model (brand, model)
);

-- 6. Sites Table
CREATE TABLE sites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 7. Projects Table
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    owner VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_owner (owner)
);

-- 8. Clusters Table
CREATE TABLE clusters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    project_id INT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    INDEX idx_name (name),
    INDEX idx_project_id (project_id)
);

-- 9. Locations Table
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_id INT NOT NULL,
    room VARCHAR(100) NOT NULL,
    rack VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE KEY unique_location (site_id, room, rack),
    INDEX idx_site_id (site_id),
    INDEX idx_room (room),
    INDEX idx_rack (rack)
);

-- 10. Hardware Table
CREATE TABLE hardware (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hostname VARCHAR(255) NOT NULL UNIQUE,
    status_id INT NOT NULL,
    ipmi VARCHAR(255),
    serial VARCHAR(255),
    type_id INT NOT NULL,
    model_id INT NOT NULL,
    vendor_id INT,
    owner VARCHAR(255) NOT NULL,
    specifications TEXT DEFAULT '',
    note TEXT DEFAULT '',
    location_id INT NOT NULL,
    unit_range VARCHAR(20) NOT NULL,
    cluster_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES hardware_statuses(id),
    FOREIGN KEY (type_id) REFERENCES hardware_types(id),
    FOREIGN KEY (model_id) REFERENCES hardware_models(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL,
    INDEX idx_hostname (hostname),
    INDEX idx_location_status (location_id, status_id)
);

-- 11. Switches Table
CREATE TABLE switches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    model_id INT NOT NULL,
    vendor_id INT,
    location_id INT,
    ip_mgmt VARCHAR(45),
    note TEXT DEFAULT '',
    specifications TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES hardware_models(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_name (name),
    INDEX idx_location_id (location_id)
);

-- 12. Switch Connections Table
CREATE TABLE switch_connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hardware_id INT NOT NULL,
    switch_id INT NOT NULL,
    port VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
    FOREIGN KEY (switch_id) REFERENCES switches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_switch_port (switch_id, port),
    INDEX idx_hardware_id (hardware_id),
    INDEX idx_switch_id (switch_id)
);

-- 13. Network Interfaces Table
CREATE TABLE network_interfaces (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hardware_id INT NOT NULL,
    interface_name VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    netmask VARCHAR(45),
    gateway VARCHAR(45),
    mac_address CHAR(17),
    vlan VARCHAR(50),
    description TEXT DEFAULT '',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
    UNIQUE KEY unique_hardware_interface (hardware_id, interface_name),
    INDEX idx_hardware_id (hardware_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_mac_address (mac_address),
    INDEX idx_vlan (vlan)
);

-- Stored Function for Expanding Unit Range
DELIMITER //
CREATE FUNCTION expand_unit_range(unit_range VARCHAR(20))
RETURNS TEXT
DETERMINISTIC
BEGIN
    DECLARE start_unit INT;
    DECLARE end_unit INT;
    DECLARE result TEXT DEFAULT '';
    
    IF unit_range NOT LIKE '%-%' THEN
        RETURN unit_range;
    END IF;
    
    SET start_unit = CAST(SUBSTRING(unit_range, 2, LOCATE('-', unit_range) - 2) AS UNSIGNED);
    SET end_unit = CAST(SUBSTRING(unit_range, LOCATE('-', unit_range) + 2) AS UNSIGNED);
    
    WHILE start_unit <= end_unit DO
        SET result = CONCAT(result, 'U', LPAD(start_unit, 2, '0'), ',');
        SET start_unit = start_unit + 1;
    END WHILE;
    
    RETURN TRIM(TRAILING ',' FROM result);
END //
DELIMITER ;

-- Trigger for Insert
DELIMITER //
CREATE TRIGGER check_unit_overlap_insert
BEFORE INSERT ON hardware
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    SELECT COUNT(*)
    INTO overlap_count
    FROM hardware h
    JOIN locations l1 ON h.location_id = l1.id
    JOIN locations l2 ON NEW.location_id = l2.id
    WHERE l1.site_id = l2.site_id
      AND l1.room = l2.room
      AND l1.rack = l2.rack
      AND (
          NEW.unit_range = h.unit_range
          OR (
              NEW.unit_range LIKE '%-%' 
              AND h.unit_range LIKE '%-%'
              AND (
                  CAST(SUBSTRING(NEW.unit_range, 2, LOCATE('-', NEW.unit_range) - 2) AS UNSIGNED) <= 
                  CAST(SUBSTRING(h.unit_range, LOCATE('-', h.unit_range) + 2) AS UNSIGNED)
                  AND 
                  CAST(SUBSTRING(NEW.unit_range, LOCATE('-', NEW.unit_range) + 2) AS UNSIGNED) >= 
                  CAST(SUBSTRING(h.unit_range, 2, LOCATE('-', h.unit_range) - 2) AS UNSIGNED)
              )
          )
          OR (
              NEW.unit_range NOT LIKE '%-%' 
              AND h.unit_range LIKE '%-%'
              AND NEW.unit_range >= CONCAT('U', LPAD(CAST(SUBSTRING(h.unit_range, 2, LOCATE('-', h.unit_range) - 2) AS UNSIGNED), 2, '0'))
              AND NEW.unit_range <= CONCAT('U', LPAD(CAST(SUBSTRING(h.unit_range, LOCATE('-', h.unit_range) + 2) AS UNSIGNED), 2, '0'))
          )
          OR (
              h.unit_range NOT LIKE '%-%' 
              AND NEW.unit_range LIKE '%-%'
              AND h.unit_range >= CONCAT('U', LPAD(CAST(SUBSTRING(NEW.unit_range, 2, LOCATE('-', NEW.unit_range) - 2) AS UNSIGNED), 2, '0'))
              AND h.unit_range <= CONCAT('U', LPAD(CAST(SUBSTRING(NEW.unit_range, LOCATE('-', NEW.unit_range) + 2) AS UNSIGNED), 2, '0'))
          )
      );
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unit range overlaps with existing hardware';
    END IF;
END //
DELIMITER ;

-- Trigger for Update
DELIMITER //
CREATE TRIGGER check_unit_overlap_update
BEFORE UPDATE ON hardware
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    SELECT COUNT(*)
    INTO overlap_count
    FROM hardware h
    JOIN locations l1 ON h.location_id = l1.id
    JOIN locations l2 ON NEW.location_id = l2.id
    WHERE l1.site_id = l2.site_id
      AND l1.room = l2.room
      AND l1.rack = l2.rack
      AND (
          NEW.unit_range = h.unit_range
          OR (
              NEW.unit_range LIKE '%-%' 
              AND h.unit_range LIKE '%-%'
              AND (
                  CAST(SUBSTRING(NEW.unit_range, 2, LOCATE('-', NEW.unit_range) - 2) AS UNSIGNED) <= 
                  CAST(SUBSTRING(h.unit_range, LOCATE('-', h.unit_range) + 2) AS UNSIGNED)
                  AND 
                  CAST(SUBSTRING(NEW.unit_range, LOCATE('-', NEW.unit_range) + 2) AS UNSIGNED) >= 
                  CAST(SUBSTRING(h.unit_range, 2, LOCATE('-', h.unit_range) - 2) AS UNSIGNED)
              )
          )
          OR (
              NEW.unit_range NOT LIKE '%-%' 
              AND h.unit_range LIKE '%-%'
              AND NEW.unit_range >= CONCAT('U', LPAD(CAST(SUBSTRING(h.unit_range, 2, LOCATE('-', h.unit_range) - 2) AS UNSIGNED), 2, '0'))
              AND NEW.unit_range <= CONCAT('U', LPAD(CAST(SUBSTRING(h.unit_range, LOCATE('-', h.unit_range) + 2) AS UNSIGNED), 2, '0'))
          )
          OR (
              h.unit_range NOT LIKE '%-%' 
              AND NEW.unit_range LIKE '%-%'
              AND h.unit_range >= CONCAT('U', LPAD(CAST(SUBSTRING(NEW.unit_range, 2, LOCATE('-', NEW.unit_range) - 2) AS UNSIGNED), 2, '0'))
              AND h.unit_range <= CONCAT('U', LPAD(CAST(SUBSTRING(NEW.unit_range, LOCATE('-', NEW.unit_range) + 2) AS UNSIGNED), 2, '0'))
          )
      )
      AND h.id != NEW.id;
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unit range overlaps with existing hardware';
    END IF;
END //
DELIMITER ;