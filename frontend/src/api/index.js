import request from '@/utils/request'

export const getHalls = () => request.get('/halls')
export const getHallDetail = (id) => request.get(`/halls/${id}`)

export const getTimeSlots = () => request.get('/time-slots')

export const getStaff = (role) => request.get('/staff', { params: { role } })

export const getPackages = (type) => request.get('/packages', { params: { type } })

export const checkAvailability = (hallId, date) => 
  request.get('/appointments/check-availability', { params: { hall_id: hallId, date } })

export const createAppointment = (data) => request.post('/appointments', data)

export const getAppointmentDetail = (id) => request.get(`/appointments/${id}`)

export const getMyAppointments = (params) => request.get('/appointments/my', { params })

export const cancelAppointment = (id) => request.put(`/appointments/${id}/cancel`)

export const submitReview = (data) => request.post('/reviews', data)

export const getReviewByAppointment = (appointmentId) => 
  request.get(`/reviews/appointment/${appointmentId}`)

export const getReviews = (params) => request.get('/reviews', { params })

export const getAdminAppointments = (params) => 
  request.get('/admin/appointments', { params })

export const updateAppointmentStatus = (id, status) => 
  request.put(`/admin/appointments/${id}/status`, { status })

export const getSchedule = (date) => 
  request.get('/admin/schedule', { params: { date } })
