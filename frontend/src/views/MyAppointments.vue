<template>
  <div class="my-page">
    <div class="page-header">
      <div class="header-content">
        <el-button @click="$router.push('/')" plain>
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <h1>我的预约</h1>
        <div></div>
      </div>
    </div>

    <div class="page-content">
      <el-card class="query-card">
        <el-form :model="queryForm" inline>
          <el-form-item label="预约编号">
            <el-input v-model="queryForm.appointment_no" placeholder="请输入预约编号" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="queryForm.phone" placeholder="请输入联系电话" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryAppointments">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="appointment-list" v-if="appointments.length > 0">
        <el-card v-for="appt in appointments" :key="appt.id" class="appointment-card" shadow="hover">
          <div class="card-header">
            <div class="left">
              <span class="hall-name">{{ appt.hall_name }}</span>
              <el-tag :type="getStatusType(appt.status)" size="small">
                {{ getStatusText(appt.status) }}
              </el-tag>
            </div>
            <span class="order-no">编号：{{ appt.appointment_no }}</span>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <el-icon><Calendar /></el-icon>
              <span>{{ appt.appointment_date }} {{ appt.slot_name }}</span>
            </div>
            <div class="info-row">
              <el-icon><User /></el-icon>
              <span>逝者：{{ appt.deceased_name }}</span>
            </div>
            <div class="info-row" v-if="appt.host_name">
              <el-icon><Microphone /></el-icon>
              <span>司仪：{{ appt.host_name }}</span>
            </div>
            <div class="info-row" v-if="appt.makeup_name">
              <el-icon><Brush /></el-icon>
              <span>化妆师：{{ appt.makeup_name }}</span>
            </div>
            <div class="info-row price">
              <span>费用：¥{{ appt.total_price }}</span>
            </div>
          </div>

          <div class="card-footer">
            <el-button size="small" @click="viewDetail(appt.id)">查看详情</el-button>
            <div class="actions">
              <el-button 
                size="small" 
                type="danger" 
                plain
                v-if="appt.status === 'pending' || appt.status === 'confirmed'"
                @click="cancelAppointment(appt.id)"
              >
                取消预约
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                v-if="appt.status === 'completed'"
                @click="goReview(appt.id)"
              >
                去评价
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <el-empty v-else description="暂无预约记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyAppointments, cancelAppointment as cancelApptApi } from '@/api'

const router = useRouter()
const appointments = ref([])
const queryForm = ref({
  appointment_no: '',
  phone: ''
})

onMounted(() => {
  queryAppointments()
})

const queryAppointments = async () => {
  if (!queryForm.value.appointment_no && !queryForm.value.phone) {
    appointments.value = []
    return
  }
  
  const res = await getMyAppointments(queryForm.value)
  if (res.success) {
    appointments.value = res.data
  }
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const viewDetail = (id) => {
  router.push(`/booking/success/${id}`)
}

const cancelAppointment = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
      type: 'warning'
    })
    
    const res = await cancelApptApi(id)
    if (res.success) {
      ElMessage.success('取消成功')
      queryAppointments()
    }
  } catch {
  }
}

const goReview = (id) => {
  router.push(`/review/${id}`)
}
</script>

<style scoped>
.my-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 20px;
  margin: 0;
}

.page-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.query-card {
  margin-bottom: 24px;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.card-header .left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hall-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.order-no {
  font-size: 13px;
  color: #909399;
}

.card-body {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.info-row.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
  margin-top: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
