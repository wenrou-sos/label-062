<template>
  <div class="appointments-page">
    <el-card class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAppointments">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="appointments" v-loading="loading" stripe>
        <el-table-column prop="appointment_no" label="预约编号" width="140" />
        <el-table-column prop="hall_name" label="告别厅" width="100" />
        <el-table-column label="时间" width="200">
          <template #default="{ row }">
            {{ row.appointment_date }} {{ row.slot_name }}
          </template>
        </el-table-column>
        <el-table-column prop="deceased_name" label="逝者姓名" width="100" />
        <el-table-column prop="family_name" label="家属姓名" width="100" />
        <el-table-column prop="family_phone" label="联系电话" width="130" />
        <el-table-column prop="host_name" label="司仪" width="100" />
        <el-table-column prop="makeup_name" label="化妆师" width="100" />
        <el-table-column prop="total_price" label="费用" width="100">
          <template #default="{ row }">
            ¥{{ row.total_price }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              link
              @click="viewDetail(row)"
            >
              详情
            </el-button>
            <el-button 
              v-if="row.status === 'pending'"
              type="success" 
              size="small" 
              link
              @click="updateStatus(row, 'confirmed')"
            >
              确认
            </el-button>
            <el-button 
              v-if="row.status === 'confirmed'"
              type="success" 
              size="small" 
              link
              @click="updateStatus(row, 'completed')"
            >
              完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadAppointments"
          @current-change="loadAppointments"
        />
      </div>
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
          <el-descriptions-item label="时间段">
            {{ formatTime(currentAppointment.start_time) }} - {{ formatTime(currentAppointment.end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="日期" :span="2">{{ currentAppointment.appointment_date }}</el-descriptions-item>
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
            @click="confirmAppointment"
          >
            确认预约
          </el-button>
          <el-button 
            v-if="currentAppointment.status === 'confirmed'"
            type="success"
            @click="completeAppointment"
          >
            标记完成
          </el-button>
          <el-button 
            v-if="currentAppointment.status !== 'cancelled' && currentAppointment.status !== 'completed'"
            type="danger"
            @click="cancelAppointment"
          >
            取消预约
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminAppointments, updateAppointmentStatus } from '@/api'

const loading = ref(false)
const appointments = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({
  date: '',
  status: ''
})

const detailVisible = ref(false)
const currentAppointment = ref(null)

const loadAppointments = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...(filters.date && { date: filters.date }),
      ...(filters.status && { status: filters.status })
    }
    const res = await getAdminAppointments(params)
    if (res.success) {
      appointments.value = res.data
      total.value = res.total
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAppointments()
})

const resetFilters = () => {
  filters.date = ''
  filters.status = ''
  page.value = 1
  loadAppointments()
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

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

const viewDetail = (row) => {
  currentAppointment.value = row
  detailVisible.value = true
}

const updateStatus = async (row, status) => {
  try {
    await ElMessageBox.confirm(`确定要${getStatusText(status)}该预约吗？`, '提示', {
      type: 'warning'
    })
    
    const res = await updateAppointmentStatus(row.id, status)
    if (res.success) {
      ElMessage.success('操作成功')
      loadAppointments()
    }
  } catch {
  }
}

const confirmAppointment = async () => {
  const res = await updateAppointmentStatus(currentAppointment.value.id, 'confirmed')
  if (res.success) {
    ElMessage.success('预约已确认')
    detailVisible.value = false
    loadAppointments()
  }
}

const completeAppointment = async () => {
  const res = await updateAppointmentStatus(currentAppointment.value.id, 'completed')
  if (res.success) {
    ElMessage.success('已标记完成')
    detailVisible.value = false
    loadAppointments()
  }
}

const cancelAppointment = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
      type: 'warning'
    })
    
    const res = await updateAppointmentStatus(currentAppointment.value.id, 'cancelled')
    if (res.success) {
      ElMessage.success('预约已取消')
      detailVisible.value = false
      loadAppointments()
    }
  } catch {
  }
}
</script>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
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
