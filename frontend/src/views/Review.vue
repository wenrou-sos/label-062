<template>
  <div class="review-page">
    <div class="page-header">
      <div class="header-content">
        <el-button @click="$router.push('/my')" plain>
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1>服务评价</h1>
        <div></div>
      </div>
    </div>

    <div class="page-content" v-if="appointment">
      <el-card class="info-card">
        <h3>预约信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">告别厅：</span>
            <span class="value">{{ appointment.hall_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">时间：</span>
            <span class="value">{{ appointment.appointment_date }} {{ appointment.slot_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">逝者姓名：</span>
            <span class="value">{{ appointment.deceased_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">预约编号：</span>
            <span class="value">{{ appointment.appointment_no }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="review-card" v-if="existingReview">
        <h3>您的评价</h3>
        <div class="rating-display">
          <el-rate v-model="existingReview.rating" disabled :size="24" />
          <span class="rating-text">{{ existingReview.rating }} 分</span>
        </div>
        <div class="comment-display" v-if="existingReview.comment">
          <p>{{ existingReview.comment }}</p>
        </div>
        <div class="reply-section" v-if="existingReview.reply">
          <div class="reply-label">管理员回复：</div>
          <div class="reply-content">{{ existingReview.reply }}</div>
        </div>
        <p class="review-time">{{ formatDate(existingReview.created_at) }}</p>
        <el-button type="primary" plain @click="showEdit = true">修改评价</el-button>
      </el-card>

      <el-card class="review-card" v-else>
        <h3>请为我们的服务评分</h3>
        <el-form :model="formData" label-position="top">
          <el-form-item label="服务评分">
            <el-rate 
              v-model="formData.rating" 
              :size="32" 
              show-text
              :texts="['很差', '较差', '一般', '满意', '非常满意']"
            />
          </el-form-item>
          <el-form-item label="留言评价">
            <el-input
              v-model="formData.comment"
              type="textarea"
              :rows="5"
              placeholder="请分享您的体验和建议，帮助我们做得更好..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              @click="submitReview"
              :loading="submitting"
              :disabled="!formData.rating"
            >
              提交评价
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-dialog v-model="showEdit" title="修改评价" width="500px">
        <el-form :model="editForm" label-position="top">
          <el-form-item label="服务评分">
            <el-rate 
              v-model="editForm.rating" 
              :size="28" 
              show-text
              :texts="['很差', '较差', '一般', '满意', '非常满意']"
            />
          </el-form-item>
          <el-form-item label="留言评价">
            <el-input
              v-model="editForm.comment"
              type="textarea"
              :rows="4"
              placeholder="请分享您的体验和建议..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showEdit = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="submitting">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAppointmentDetail, submitReview as submitReviewApi, getReviewByAppointment } from '@/api'
import dayjs from 'dayjs'

const route = useRoute()
const appointment = ref(null)
const existingReview = ref(null)
const showEdit = ref(false)
const submitting = ref(false)

const formData = reactive({
  rating: 0,
  comment: ''
})

const editForm = reactive({
  rating: 0,
  comment: ''
})

onMounted(async () => {
  const [apptRes, reviewRes] = await Promise.all([
    getAppointmentDetail(route.params.id),
    getReviewByAppointment(route.params.id)
  ])
  
  if (apptRes.success) {
    appointment.value = apptRes.data
  }
  if (reviewRes.success && reviewRes.data) {
    existingReview.value = reviewRes.data
  }
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const submitReview = async () => {
  if (!formData.rating) {
    ElMessage.warning('请选择评分')
    return
  }

  submitting.value = true
  try {
    const res = await submitReviewApi({
      appointment_id: route.params.id,
      rating: formData.rating,
      comment: formData.comment
    })
    
    if (res.success) {
      ElMessage.success('评价提交成功')
      const reviewRes = await getReviewByAppointment(route.params.id)
      if (reviewRes.success) {
        existingReview.value = reviewRes.data
      }
    }
  } finally {
    submitting.value = false
  }
}

const saveEdit = async () => {
  submitting.value = true
  try {
    const res = await submitReviewApi({
      appointment_id: route.params.id,
      rating: editForm.rating,
      comment: editForm.comment
    })
    
    if (res.success) {
      ElMessage.success('修改成功')
      showEdit.value = false
      const reviewRes = await getReviewByAppointment(route.params.id)
      if (reviewRes.success) {
        existingReview.value = reviewRes.data
      }
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 700px;
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
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
}

.info-card {
  margin-bottom: 24px;
}

.info-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  font-size: 14px;
}

.info-item .label {
  color: #909399;
}

.info-item .value {
  color: #303133;
}

.review-card h3 {
  font-size: 16px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rating-text {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.comment-display {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.comment-display p {
  color: #606266;
  line-height: 1.6;
}

.reply-section {
  background: #ecf5ff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.reply-label {
  color: #409eff;
  font-size: 13px;
  margin-bottom: 6px;
}

.reply-content {
  color: #606266;
  font-size: 14px;
}

.review-time {
  color: #909399;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>
