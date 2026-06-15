<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <el-icon size="24"><Setting /></el-icon>
          <span>管理后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="menu"
          background-color="#1f2937"
          text-color="#9ca3af"
          active-text-color="#fff"
        >
          <el-menu-item index="/admin/schedule">
            <el-icon><Calendar /></el-icon>
            <span>排期管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/appointments">
            <el-icon><Tickets /></el-icon>
            <span>预约管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>评价管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-title">{{ pageTitle }}</div>
          <div class="header-right">
            <el-button text @click="$router.push('/')">
              <el-icon><House /></el-icon>
              返回前台
            </el-button>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('schedule')) return '排期管理'
  if (path.includes('appointments')) return '预约管理'
  if (path.includes('reviews')) return '评价管理'
  return '管理后台'
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background: #1f2937;
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #374151;
}

.menu {
  border-right: none;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.main-content {
  background: #f3f4f6;
  padding: 24px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item:hover) {
  background: #374151 !important;
}
</style>
