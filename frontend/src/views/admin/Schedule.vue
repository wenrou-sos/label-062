<template>
  <div class="schedule-page">
    <el-card class="date-picker-card">
      <div class="date-selector">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          size="large"
          @change="loadSchedule"
        />
        <el-button type="primary" size="large" @click="loadSchedule" :loading="loading">
          <el-icon><Search /></el-icon>
          查询排期
        </el-button>
      </div>
    </el-card>

    <el-card class="schedule-card" v-loading="loading">
      <div class="schedule-table" v-if="scheduleData.length > 0">
        <div class="table-header">
          <div class="header-cell time-col">时间</div>
          <div 
            class="header-cell" 
            v-for="hall in halls" 
            :key="hall.id"
          >
            {{ hall.name }}
            <span class="capacity">({{ hall.capacity }}人)</span>
          </div>
        </div>
        <div class="table-body">
          <div class="table-row" v-for="slot in slots" :key="slot.id">
            <div class="cell time-cell">
              <div class="time-range">{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</div>
              <div class="slot-name">{{ slot.name }}</div>
            </div>
            <div 
              class="cell" 
              v-for="hall in halls" 
              :key="hall.id"
            >
              <div 
                class="appointment-block"
                v-if="getAppointment(hall.id, slot.id)"
                :class="getStatusClass(getAppointment(hall.id, slot.id).status)"
              >
                <div class="deceased">{{ getAppointment(hall.id, slot.id).deceased_name }}</div>
                <div class="no">{{ getAppointment(hall.id, slot.id).appointment_no }}</div>
                <div class="status">{{ getStatusText(getAppointment(hall.id, slot.id).status) }}</div>
              </div>
              <div class="empty-slot" v-else>
                <el-icon :size="20" color="#9ca3af"><Plus /></el-icon>
                <span>空闲</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="暂无排期数据" />
    </el-card>

    <el-dialog v-model="detailVisible" title="预约详情" width="600px">
      <div v-if="currentAppointment" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预约编号">{{ currentAppointment.appointment_no }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentAppointment.status)">
              {{ getStatusText(currentAppointment.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告别厅">{{ currentAppointment.hall_name }}</el-descriptions-item>
          <el-descriptions-item label="时间">
            {{ currentAppointment.appointment_date }} {{ currentAppointment.slot_name }}
          </el-descriptions-item>
          <el-descriptions-item label="逝者姓名">{{ currentAppointment.deceased_name }}</el-descriptions-item>
          <el-descriptions-item label="家属姓名">{{ currentAppointment.family_name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentAppointment.family_phone }}</el-descriptions-item>
          <el-descriptions-item label="总费用">¥{{ currentAppointment.total_price }}</el-descriptions-item>
          <el-descriptions-item label="司仪" v-if="currentAppointment.host_name">
            {{ currentAppointment.host_name }}
          </el-descriptions-item>
          <el-descriptions-item label="化妆师" v-if="currentAppointment.makeup_name">
            {{ currentAppointment.makeup_name }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2" v-if="currentAppointment.remark">
            {{ currentAppointment.remark }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button 
            v-if="currentAppointment.status === 'pending'"
            type="primary"
            @click="updateStatus('confirmed')"
          >
            确认预约
          </el-button>
          <el-button 
            v-if="currentAppointment.status === 'confirmed'"
            type="success"
            @click="updateStatus('completed')"
          >
            标记完成
          </el-button>
          <el-button 
            v-if="currentAppointment.status !== 'cancelled' && currentAppointment.status !== 'completed'"
            type="danger"
            @click="updateStatus('cancelled')"
          >
            取消预约
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSchedule, updateAppointmentStatus } from '@/api'
import dayjs from 'dayjs'

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const loading = ref(false)
const halls = ref([])
const slots = ref([])
const appointments = ref([])
const scheduleData = ref([])
const detailVisible = ref(false)
const currentAppointment = ref(null)

const loadSchedule = async () => {
  loading.value = true
  try {
    const res = await getSchedule(selectedDate.value)
    if (res.success) {
      halls.value = res.data.halls
      slots.value = res.data.slots
      appointments.value = res.data.appointments
      scheduleData.value = res.data.schedule
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSchedule()
})

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

const getAppointment = (hallId, slotId) => {
  return appointments.value.find(
    a => a.hall_id === hallId && a.time_slot_id === slotId
  )
}

const getStatusClass = (status) => {
  const map = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return map[status] || ''
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

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const viewDetail = (appt) => {
  currentAppointment.value = appt
  detailVisible.value = true
}

const updateStatus = async (status) => {
  const res = await updateAppointmentStatus(currentAppointment.value.id, status)
  if (res.success) {
    ElMessage.success('状态更新成功')
    detailVisible.value = false
    loadSchedule()
  }
}
</script>

<style scoped>
.schedule-page {
}

.date-picker-card {
  margin-bottom: 20px;
}

.date-selector {
  display: flex;
  gap: 12px;
  align-items: center;
}

.schedule-card {
  min-height: 400px;
}

.schedule-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-cell {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-right: 1px solid #e5e7eb;
}

.header-cell:last-child {
  border-right: none;
}

.header-cell.time-col {
  flex: 0 0 120px;
  background: #f3f4f6;
}

.capacity {
  font-size: 12px;
  color: #9ca3af;
  font-weight: normal;
}

.table-body {
  background: #fff;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  flex: 1;
  min-height: 100px;
  padding: 12px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell:last-child {
  border-right: none;
}

.cell.time-cell {
  flex: 0 0 120px;
  background: #f9fafb;
  flex-direction: column;
  gap: 4px;
}

.time-range {
  font-weight: 600;
  color: #374151;
}

.slot-name {
  font-size: 12px;
  color: #6b7280;
}

.appointment-block {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.appointment-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.appointment-block.status-pending {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.appointment-block.status-confirmed {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.appointment-block.status-completed {
  background: #d1fae5;
  border-left: 4px solid #10b981;
}

.appointment-block.status-cancelled {
  background: #f3f4f6;
  border-left: 4px solid #9ca3af;
  opacity: 0.6;
}

.deceased {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.no {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.status {
  font-size: 11px;
  color: #374151;
}

.empty-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #9ca3af;
  font-size: 12px;
}

.detail-content {
  padding: 10px 0;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
</style>
