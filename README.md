# 殡仪馆告别仪式预约管理平台

基于 Vue.js + Node.js + MySQL 的殡仪馆告别仪式在线预约管理系统。

## 功能特性

### 用户端
- 🏛️ 告别厅展示与选择
- 📅 在线预约时间段（自动检测冲突）
- 🎤 司仪选择与套餐
- 💄 化妆师选择与套餐
- 📝 预约信息填写与提交
- 📱 我的预约查询
- ⭐ 服务评分与留言评价

### 管理端
- 📊 排期管理（表格视图，一目了然）
- 📋 预约管理（确认/完成/取消）
- 💬 评价管理（查看与回复）

## 技术栈

**前端：**
- Vue 3 (Composition API)
- Vue Router
- Element Plus UI
- Axios
- Vite

**后端：**
- Node.js + Express
- MySQL
- CORS 跨域支持

## 项目结构

```
label-062/
├── backend/                 # 后端服务
│   ├── server.js           # 服务器入口
│   ├── db.js               # 数据库连接
│   ├── init-db.js          # 数据库初始化脚本
│   ├── .env                # 环境配置
│   ├── package.json
│   └── routes/             # API路由
│       ├── halls.js
│       ├── timeSlots.js
│       ├── staff.js
│       ├── packages.js
│       ├── appointments.js
│       ├── reviews.js
│       └── admin.js
└── frontend/               # 前端项目
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.js
        ├── App.vue
        ├── style.css
        ├── router/         # 路由配置
        ├── api/            # API接口
        ├── utils/          # 工具函数
        └── views/          # 页面组件
            ├── Home.vue
            ├── Booking.vue
            ├── BookingSuccess.vue
            ├── MyAppointments.vue
            ├── Review.vue
            ├── Admin.vue
            └── admin/
                ├── Schedule.vue
                ├── Appointments.vue
                └── Reviews.vue
```

## 快速开始

### 1. 环境要求

- Node.js >= 14
- MySQL >= 5.7

### 2. 数据库配置

编辑 `backend/.env` 文件，配置数据库连接信息：

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=funeral_booking
```

### 3. 初始化数据库

```bash
cd backend
npm run init-db
```

该命令会自动创建数据库、数据表，并插入初始测试数据。

### 4. 启动后端服务

```bash
cd backend
npm start
```

后端服务运行在 http://localhost:3000

### 5. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务运行在 http://localhost:5173

## 数据库表说明

### halls (告别厅表)
- id, name, capacity, description, image_url, status

### time_slots (时间段表)
- id, start_time, end_time, name, status

### staff (员工表)
- id, name, role (host/makeup), avatar, description, status

### packages (套餐表)
- id, name, description, price, type (host/makeup), includes

### appointments (预约表)
- id, appointment_no, hall_id, time_slot_id, appointment_date
- deceased_name, family_name, family_phone
- host_id, makeup_id, host_package_id, makeup_package_id
- total_price, status (pending/confirmed/completed/cancelled)
- remark, created_at, updated_at

### reviews (评价表)
- id, appointment_id, rating (1-5), comment, reply, created_at

## API 接口

### 公共接口
- `GET /api/halls` - 获取告别厅列表
- `GET /api/halls/:id` - 获取告别厅详情
- `GET /api/time-slots` - 获取时间段列表
- `GET /api/staff?role=` - 获取员工列表
- `GET /api/packages?type=` - 获取套餐列表

### 预约接口
- `GET /api/appointments/check-availability` - 查询可用时段
- `POST /api/appointments` - 创建预约
- `GET /api/appointments/my` - 查询我的预约
- `GET /api/appointments/:id` - 获取预约详情
- `PUT /api/appointments/:id/cancel` - 取消预约

### 评价接口
- `POST /api/reviews` - 提交/更新评价
- `GET /api/reviews/appointment/:id` - 获取预约评价
- `GET /api/reviews` - 获取评价列表

### 管理接口
- `GET /api/admin/schedule` - 获取排期数据
- `GET /api/admin/appointments` - 获取预约列表
- `PUT /api/admin/appointments/:id/status` - 更新预约状态

## 核心功能说明

### 场次冲突检测
创建预约时使用数据库事务和行级锁，确保同一时段同一告别厅不会被重复预约。同时检测司仪和化妆师的时间冲突。

### 预约流程
四步式预约流程：选择告别厅 → 选择时间 → 选择服务 → 填写信息

### 评价系统
仪式完成后（状态为completed），家属可以对服务进行1-5星评分，并留言评价。

## 测试数据

初始化后自带以下测试数据：
- 3个告别厅（福寿厅、永安厅、往生厅）
- 4个时间段
- 2位司仪、2位化妆师
- 2种司仪套餐、2种化妆套餐
