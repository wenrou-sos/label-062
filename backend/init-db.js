const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log('开始初始化数据库...');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS halls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        capacity INT NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        name VARCHAR(50) NOT NULL,
        status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        role ENUM('host', 'makeup') NOT NULL COMMENT 'host-司仪 makeup-化妆师',
        avatar VARCHAR(255),
        description TEXT,
        status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        type ENUM('host', 'makeup') NOT NULL COMMENT 'host-司仪套餐 makeup-化妆套餐',
        includes TEXT COMMENT '包含服务，JSON格式',
        status TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_no VARCHAR(32) NOT NULL UNIQUE,
        hall_id INT NOT NULL,
        time_slot_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        deceased_name VARCHAR(50) NOT NULL COMMENT '逝者姓名',
        family_name VARCHAR(50) NOT NULL COMMENT '家属姓名',
        family_phone VARCHAR(20) NOT NULL COMMENT '家属电话',
        host_id INT COMMENT '司仪ID',
        makeup_id INT COMMENT '化妆师ID',
        host_package_id INT COMMENT '司仪套餐ID',
        makeup_package_id INT COMMENT '化妆套餐ID',
        total_price DECIMAL(10,2) DEFAULT 0,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_hall_date (hall_id, appointment_date),
        INDEX idx_family_phone (family_phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        rating TINYINT NOT NULL COMMENT '评分1-5',
        comment TEXT,
        reply TEXT COMMENT '管理员回复',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_appointment (appointment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('数据库表创建完成！');

    const [hallsCount] = await connection.query('SELECT COUNT(*) as count FROM halls');
    if (hallsCount[0].count === 0) {
      const halls = [
        ['福寿厅', 50, '宽敞明亮，庄严肃穆，可容纳50人', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
        ['永安厅', 80, '大气庄重，设施齐全，可容纳80人', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'],
        ['往生厅', 100, '豪华大厅，设备完善，可容纳100人', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400']
      ];
      for (const hall of halls) {
        await connection.query(
          'INSERT INTO halls (name, capacity, description, image_url) VALUES (?, ?, ?, ?)',
          hall
        );
      }
      console.log('告别厅数据插入完成！');
    }

    const [slotsCount] = await connection.query('SELECT COUNT(*) as count FROM time_slots');
    if (slotsCount[0].count === 0) {
      const slots = [
        ['08:00:00', '09:30:00', '上午第一场'],
        ['10:00:00', '11:30:00', '上午第二场'],
        ['13:30:00', '15:00:00', '下午第一场'],
        ['15:30:00', '17:00:00', '下午第二场']
      ];
      for (const slot of slots) {
        await connection.query(
          'INSERT INTO time_slots (start_time, end_time, name) VALUES (?, ?, ?)',
          slot
        );
      }
      console.log('时间段数据插入完成！');
    }

    const [staffCount] = await connection.query('SELECT COUNT(*) as count FROM staff');
    if (staffCount[0].count === 0) {
      const staff = [
        ['张司仪', 'host', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', '资深司仪，从业20年，经验丰富'],
        ['李司仪', 'host', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', '专业司仪，主持风格庄重大气'],
        ['王化妆师', 'makeup', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', '资深化妆师，技术精湛'],
        ['陈化妆师', 'makeup', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', '专业化妆师，服务细致周到']
      ];
      for (const s of staff) {
        await connection.query(
          'INSERT INTO staff (name, role, avatar, description) VALUES (?, ?, ?, ?)',
          s
        );
      }
      console.log('员工数据插入完成！');
    }

    const [pkgCount] = await connection.query('SELECT COUNT(*) as count FROM packages');
    if (pkgCount[0].count === 0) {
      const packages = [
        ['标准司仪服务', '包含基础仪式主持', 2000.00, 'host', '["仪式主持","流程安排","音乐配合"]'],
        ['豪华司仪服务', '包含全套仪式主持及家属心理疏导', 3800.00, 'host', '["仪式主持","流程安排","音乐配合","悼词撰写","家属疏导"]'],
        ['基础化妆服务', '包含仪容整理和基础化妆', 800.00, 'makeup', '["仪容整理","基础化妆","发型设计"]'],
        ['完整化妆服务', '包含全身仪容整理及高级化妆', 1500.00, 'makeup', '["仪容整理","高级化妆","发型设计","服装搭配","美容护理"]']
      ];
      for (const pkg of packages) {
        await connection.query(
          'INSERT INTO packages (name, description, price, type, includes) VALUES (?, ?, ?, ?, ?)',
          pkg
        );
      }
      console.log('套餐数据插入完成！');
    }

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initDatabase();
