<template>
  <div class="success-page">
    <div class="success-card">
      <div class="success-icon">
        <el-icon :size="64" color="#67c23a"><CircleCheckFilled /></el-icon>
      </div>
      <h1>预约成功</h1>
      <p class="subtitle">您的告别仪式预约已提交，请等待工作人员联系确认</p>

      <div class="info-card" v-if="appointment">
        <h3>预约信息</h3>
        <div class="info-item">
          <span class="label">预约编号：</span>
          <span class="value">{{ appointment.appointment_no }}</span>
        </div>
        <div class="info-item">
          <span class="label">告别厅：</span>
          <span class="value">{{ appointment.hall_name }}</span>
        </div>
        <div class="info-item">
          <span class="label">时间：</span>
          <span class="value">{{ appointment.appointment_date }} {{ appointment.slot_name }}</span>
        </div>
        <div class="info-item" v-if="appointment.host_name">
          <span class="label">司仪：</span>
          <span class="value">{{ appointment.host_name }}</span>
        </div>
        <div class="info-item" v-if="appointment.makeup_name">
          <span class="label">化妆师：</span>
          <span class="value">{{ appointment.makeup_name }}</span>
        </div>
        <div class="info-item total">
          <span class="label">总费用：</span>
          <span class="value price">¥{{ appointment.total_price }}</span>
        </div>
      </div>

      <div class="actions">
        <el-button type="primary" size="large" @click="$router.push('/')">
          返回首页
        </el-button>
        <el-button size="large" @click="$router.push('/my')">
          查看我的预约
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAppointmentDetail } from '@/api'

const route = useRoute()
const appointment = ref(null)

onMounted(async () => {
  const res = await getAppointmentDetail(route.params.id)
  if (res.success) {
    appointment.value = res.data
  }
})
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.success-card {
  background: #fff;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.success-icon {
  margin-bottom: 24px;
}

.success-card h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.subtitle {
  color: #909399;
  margin-bottom: 32px;
}

.info-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 24px;
  text-align: left;
  margin-bottom: 32px;
}

.info-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
}

.info-item .value {
  color: #303133;
}

.info-item.total {
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  margin-top: 12px;
}

.info-item.total .value {
  font-size: 20px;
  font-weight: 600;
}

.info-item.total .price {
  color: #f56c6c;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
