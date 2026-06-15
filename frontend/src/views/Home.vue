<template>
  <div class="home-page">
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon size="32"><OfficeBuilding /></el-icon>
          <span class="title">殡仪馆告别仪式预约平台</span>
        </div>
        <div class="nav">
          <el-button type="primary" @click="$router.push('/booking')">
            <el-icon><Calendar /></el-icon>
            立即预约
          </el-button>
          <el-button @click="$router.push('/my')">
            <el-icon><User /></el-icon>
            我的预约
          </el-button>
          <el-button @click="$router.push('/admin')">
            <el-icon><Setting /></el-icon>
            管理后台
          </el-button>
        </div>
      </div>
    </div>

    <div class="banner">
      <div class="banner-content">
        <h1>庄重肃穆 专业贴心</h1>
        <p>为逝者送上最后一程的温暖与尊严</p>
        <el-button type="primary" size="large" @click="$router.push('/booking')">
          在线预约告别仪式
        </el-button>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">告别厅介绍</h2>
      <div class="hall-list">
        <el-card 
          v-for="hall in halls" 
          :key="hall.id" 
          class="hall-card"
          shadow="hover"
        >
          <img :src="hall.image_url" :alt="hall.name" class="hall-image" />
          <div class="hall-info">
            <h3>{{ hall.name }}</h3>
            <p class="capacity">
              <el-icon><UserFilled /></el-icon>
              容纳 {{ hall.capacity }} 人
            </p>
            <p class="desc">{{ hall.description }}</p>
            <el-button type="primary" @click="goBooking(hall.id)">立即预约</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <div class="section service-section">
      <h2 class="section-title">服务套餐</h2>
      <div class="service-list">
        <div class="service-item">
          <el-icon size="48" color="#409eff"><Microphone /></el-icon>
          <h3>专业司仪</h3>
          <p>资深司仪主持，仪式庄重温馨</p>
        </div>
        <div class="service-item">
          <el-icon size="48" color="#67c23a"><Brush /></el-icon>
          <h3>遗体化妆</h3>
          <p>专业化妆师，还原逝者安详面容</p>
        </div>
        <div class="service-item">
          <el-icon size="48" color="#e6a23c"><Calendar /></el-icon>
          <h3>灵活排期</h3>
          <p>多时段可选，在线预约方便快捷</p>
        </div>
        <div class="service-item">
          <el-icon size="48" color="#f56c6c"><Medal /></el-icon>
          <h3>品质保证</h3>
          <p>专业团队，服务质量有保障</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>© 2024 殡仪馆告别仪式预约管理平台 版权所有</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHalls } from '@/api'

const router = useRouter()
const halls = ref([])

onMounted(async () => {
  const res = await getHalls()
  if (res.success) {
    halls.value = res.data
  }
})

const goBooking = (hallId) => {
  router.push({ path: '/booking', query: { hallId } })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
}

.logo .title {
  font-size: 20px;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 12px;
}

.banner {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  padding: 100px 24px;
  text-align: center;
}

.banner-content h1 {
  font-size: 42px;
  margin-bottom: 16px;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 40px;
  color: #2c3e50;
}

.hall-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.hall-card {
  overflow: hidden;
}

.hall-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hall-info {
  padding: 16px 0;
}

.hall-info h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.capacity {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  margin-bottom: 12px;
  font-size: 14px;
}

.desc {
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.6;
}

.service-section {
  background: #fff;
}

.service-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.service-item {
  text-align: center;
  padding: 24px;
}

.service-item h3 {
  font-size: 18px;
  margin: 16px 0 8px;
  color: #2c3e50;
}

.service-item p {
  color: #909399;
  font-size: 14px;
}

.footer {
  background: #1a1a2e;
  color: #fff;
  text-align: center;
  padding: 24px;
  font-size: 14px;
  opacity: 0.8;
}
</style>
