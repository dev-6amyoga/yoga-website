const { sequelize } = require('./init.sequelize')
const { Institute } = require('./models/sql/Institute')
const { Permission } = require('./models/sql/Permission')
const { Plan } = require('./models/sql/Plan')
const { Role } = require('./models/sql/Role')
const { User } = require('./models/sql/User')
const { PlanPricing } = require('./models/sql/PlanPricing')
const { Currency } = require('./models/sql/Currency')
const { UserInstitutePlanRole } = require('./models/sql/UserInstitutePlanRole')
const { RolePermission } = require('./models/sql/RolePermission')
const { ZoomClassModel } = require('./models/sql/ZoomClassModel')
const { UserPlanAttendance } = require('./models/sql/UserPlanAttendance')
const { ClassAttendance } = require('./models/sql/ClassAttendance')

const institutes = [
  {
    name: 'Institute 1',
    address1: '#192, 1st Main, 2nd Cross, 5th Phase',
    address2: 'JP Nagar, Bangalore',
    email: 'institute1@gmail.com',
    phone: '1234567890',
    billing_address: 'JP Nagar, Bangalore',
  },
  {
    name: 'Institute 2',
    address1: '#3838, 1st Main, 2nd Cross, 5th Phase',
    address2: 'Sarjapur, Bangalore',
    email: 'institute2@gmail.com',
    phone: '1234567890',
    billing_address: 'Sarjapur, Bangalore',
  },
]

const roles = [
  {
    name: 'ROOT',
  },
  {
    name: 'INSTITUTE_OWNER',
  },
  {
    name: 'INSTIUTE_ADMIN',
  },
  {
    name: 'TEACHER',
  },
  {
    name: 'STUDENT',
  },
]

// roles we have yes?

const users = [
  {
    username: 'root',
    name: 'Root',
    email: 'root@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'ins1_owner',
    name: 'ins1_owner',
    email: 'ins1_owner@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'ins1_admin',
    name: 'ins1_admin',
    email: 'ins1_admin@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'ins1_teacher',
    name: 'ins1_teacher',
    email: 'ins1_teacher@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'ins2_owner',
    name: 'ins2_owner',
    email: 'ins2_owner@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'ins2_admin',
    name: 'ins2_admin',
    email: 'ins2_admin@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'ins2_teacher',
    name: 'ins2_teacher',
    email: 'ins2_teacher@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'student1',
    name: 'student1',
    email: 'student1@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
  {
    username: 'student2',
    name: 'student2',
    email: 'student2@gmail.com',
    password: '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
    is_google_login: false,
    last_login: null,
  },
]

const user_institute_plan_role = [
  { user_id: 1, role_id: 1, user_plan_id: null, institute_id: null },
  { user_id: 1, role_id: 4, user_plan_id: null, institute_id: null },
  { user_id: 1, role_id: 5, user_plan_id: null, institute_id: null },
  { user_id: 2, role_id: 2, user_plan_id: null, institute_id: 1 },
  { user_id: 3, role_id: 3, user_plan_id: null, institute_id: 1 },
  { user_id: 4, role_id: 4, user_plan_id: null, institute_id: 1 },
  { user_id: 5, role_id: 2, user_plan_id: null, institute_id: 2 },
  { user_id: 6, role_id: 3, user_plan_id: null, institute_id: 2 },
  { user_id: 7, role_id: 4, user_plan_id: null, institute_id: 2 },
  { user_id: 8, role_id: 5, user_plan_id: null, institute_id: null },
  { user_id: 9, role_id: 5, user_plan_id: null, institute_id: null },
]

// const user_institute = [
//   { user_id: 1, institute_id: null },
//   { user_id: 2, institute_id: 1 },
//   { user_id: 3, institute_id: 1 },
//   { user_id: 4, institute_id: 1 },
//   { user_id: 5, institute_id: 2 },
//   { user_id: 6, institute_id: 2 },
//   { user_id: 7, institute_id: 2 },
//   { user_id: 8, institute_id: 1 },
//   { user_id: 9, institute_id: 2 },
// ];

const permissions = [
  { name: 'USER_CREATE' },
  { name: 'USER_READ' },
  { name: 'USER_UPDATE' },
  { name: 'USER_DELETE' },
]

// role 1: ROOT
// role 2: INSTITUTE_OWNER
const roles_perms = [
  { role_id: 1, permission_id: 1 },
  { role_id: 1, permission_id: 2 },
  { role_id: 1, permission_id: 3 },
  { role_id: 1, permission_id: 4 },
]

const plans = [
  {
    name: 'Basic Plan',
    description: 'Uses 6AM playlist',
    watch_time_limit: 50 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: false,
    playlist_creation_limit: 0,
    has_self_audio_upload: false,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    number_of_teachers: 0,
    plan_validity_days: 30,
    plan_user_type: 'STUDENT',
  },
  {
    name: 'Family Plan',
    description: 'Can Create new playlist	',
    watch_time_limit: 100 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_self_audio_upload: false,
    number_of_teachers: 0,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    plan_validity_days: 30,
    plan_user_type: 'STUDENT',
  },
  {
    name: 'Solo Plan',
    description: '1 teacher + Uses 6AM playlist +  Can Create new playlist',
    watch_time_limit: 200 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_self_audio_upload: false,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    number_of_teachers: 1,
    plan_validity_days: 30,
    plan_user_type: 'INSTITUTE',
  },
  {
    name: 'Small Plan',
    description: '5 teachers  + Uses 6AM playlist +  Can Create new playlist	',
    watch_time_limit: 1000 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_self_audio_upload: true,
    has_zoom_classes: true,
    number_of_zoom_classes: 4,
    number_of_teachers: 5,
    plan_validity_days: 30,
    plan_user_type: 'INSTITUTE',
  },
  {
    name: 'Medium Plan',
    description: '10 teachers + Uses 6AM playlist +  Can Create new playlist	',
    watch_time_limit: 2000 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_self_audio_upload: true,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    number_of_teachers: 10,
    plan_validity_days: 30,
    plan_user_type: 'INSTITUTE',
  },
  {
    name: 'Basic Plan',
    description: 'Uses 6AM playlist',
    watch_time_limit: 50 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: false,
    playlist_creation_limit: 0,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    has_self_audio_upload: false,
    number_of_teachers: 0,
    plan_validity_days: 90,
    plan_user_type: 'STUDENT',
  },
  {
    name: 'Family Plan',
    description: 'Can Create new playlist	',
    watch_time_limit: 100 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_self_audio_upload: false,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    number_of_teachers: 0,
    plan_validity_days: 90,
    plan_user_type: 'STUDENT',
  },
  {
    name: 'Solo Plan',
    description: '1 teacher + Uses 6AM playlist +  Can Create new playlist',
    watch_time_limit: 200 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_self_audio_upload: false,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    number_of_teachers: 1,
    plan_validity_days: 90,
    plan_user_type: 'INSTITUTE',
  },
  {
    name: 'Small Plan',
    description: '5 teachers  + Uses 6AM playlist +  Can Create new playlist	',
    watch_time_limit: 1000 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    playlist_creation_limit: 1000,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    has_self_audio_upload: true,
    number_of_teachers: 5,
    plan_validity_days: 90,
    plan_user_type: 'INSTITUTE',
  },
  {
    name: 'Medium Plan',
    description: '10 teachers + Uses 6AM playlist +  Can Create new playlist	',
    watch_time_limit: 2000 * (60 * 60),
    has_basic_playlist: true,
    has_playlist_creation: true,
    has_zoom_classes: true,
    number_of_zoom_classes: 20,
    playlist_creation_limit: 1000,
    has_self_audio_upload: true,
    number_of_teachers: 10,
    plan_validity_days: 90,
    plan_user_type: 'INSTITUTE',
  },
]

const currency = [
  { name: 'Indian Rupee', short_tag: 'INR' },
  { name: 'United States Dollar', short_tag: 'USD' },
  { name: 'Euro', short_tag: 'EUR' },
]

const plan_pricing = [
  { plan_id: 1, currency_id: 1, denomination: 1999 },
  { plan_id: 2, currency_id: 1, denomination: 2999 },
  { plan_id: 3, currency_id: 1, denomination: 4999 },
  { plan_id: 4, currency_id: 1, denomination: 14999 },
  { plan_id: 5, currency_id: 1, denomination: 24999 },

  { plan_id: 1, currency_id: 2, denomination: 35 },
  { plan_id: 2, currency_id: 2, denomination: 55 },
  { plan_id: 3, currency_id: 2, denomination: 90 },
  { plan_id: 4, currency_id: 2, denomination: 270 },
  { plan_id: 5, currency_id: 2, denomination: 450 },

  { plan_id: 1, currency_id: 3, denomination: 35 },
  { plan_id: 2, currency_id: 3, denomination: 55 },
  { plan_id: 3, currency_id: 3, denomination: 90 },
  { plan_id: 4, currency_id: 3, denomination: 270 },
  { plan_id: 5, currency_id: 3, denomination: 450 },

  { plan_id: 6, currency_id: 1, denomination: 4999 },
  { plan_id: 7, currency_id: 1, denomination: 6999 },
  { plan_id: 8, currency_id: 1, denomination: 12499 },
  { plan_id: 9, currency_id: 1, denomination: 34999 },
  { plan_id: 10, currency_id: 1, denomination: 64999 },

  { plan_id: 6, currency_id: 2, denomination: 90 },
  { plan_id: 7, currency_id: 2, denomination: 125 },
  { plan_id: 8, currency_id: 2, denomination: 225 },
  { plan_id: 9, currency_id: 2, denomination: 700 },
  { plan_id: 10, currency_id: 2, denomination: 1150 },

  { plan_id: 6, currency_id: 3, denomination: 90 },
  { plan_id: 7, currency_id: 3, denomination: 125 },
  { plan_id: 8, currency_id: 3, denomination: 225 },
  { plan_id: 9, currency_id: 3, denomination: 700 },
  { plan_id: 10, currency_id: 3, denomination: 1150 },
]

const user_plan_attendance = [
  {
    user_id: 8, // student1
    plan_id: 1, // Basic Plan
    start_date: new Date('2025-10-01'),
    expiry_date: new Date('2025-10-31'),
    classes_allowed: 30,
    classes_attended: 5,
    status: 'ACTIVE',
  },
  {
    user_id: 9, // student2
    plan_id: 2, // Family Plan
    start_date: new Date('2025-10-01'),
    expiry_date: new Date('2025-10-31'),
    classes_allowed: 60,
    classes_attended: 12,
    status: 'ACTIVE',
  },
]

const class_attendance = [
  {
    user_id: 8,
    plan_id: 1,
    user_plan_id: 1,
    class_id: 1,
    device_id: 'Mozilla/5.0 (Windows NT 10.0)',
    date: new Date('2025-10-06T06:30:00Z'),
    attendance_status: 'ATTENDED',
    join_time: new Date('2025-10-06T06:28:00Z'),
    leave_time: new Date('2025-10-06T07:30:00Z'),
    duration_minutes: 62,
    marked_by: 'SYSTEM',
    instructor_id: 4, // ins1_teacher
    remarks: 'Completed full class',
  },
  {
    user_id: 8,
    plan_id: 1,
    user_plan_id: 1,
    class_id: 2,
    device_id: 'Mozilla/5.0 (Windows NT 10.0)',
    date: new Date('2025-10-06T13:00:00Z'),
    attendance_status: 'JOINED_LATE',
    join_time: new Date('2025-10-06T13:15:00Z'),
    leave_time: new Date('2025-10-06T14:00:00Z'),
    duration_minutes: 45,
    marked_by: 'INSTRUCTOR',
    instructor_id: 4,
    remarks: 'Joined 15 minutes late',
  },
  {
    user_id: 9,
    plan_id: 2,
    user_plan_id: 2,
    class_id: 6,
    device_id: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    date: new Date('2025-10-07T07:00:00Z'),
    attendance_status: 'ATTENDED',
    join_time: new Date('2025-10-07T06:55:00Z'),
    leave_time: new Date('2025-10-07T08:00:00Z'),
    duration_minutes: 65,
    marked_by: 'SYSTEM',
    instructor_id: 7, // ins2_teacher
    remarks: null,
  },
]

const zoom_classes = [
  // One-time classes (unchanged)
  {
    zoom_class_id: 1,
    zoom_class_name: 'Morning Vinyasa Flow',
    plan_id: 101,
    institute_id: 10,
    teacher_id: 501,
    start_time: new Date('2025-10-06T06:30:00Z'),
    end_time: new Date('2025-10-06T07:30:00Z'),
    zoom_url: 'https://zoom.us/j/1234567890?pwd=abc123',
    zoom_meeting_id: '1234567890',
    zoom_meeting_password: 'abc123',
    class_type: 'one_time',
    recurring_days: null,
    recurring_start_time: null,
    recurring_end_time: null,
  },
  {
    zoom_class_id: 2,
    zoom_class_name: 'Evening Hatha Yoga',
    plan_id: 102,
    institute_id: 10,
    teacher_id: 502,
    start_time: new Date('2025-10-06T13:00:00Z'),
    end_time: new Date('2025-10-06T14:00:00Z'),
    zoom_url: 'https://zoom.us/j/2345678901?pwd=def456',
    zoom_meeting_id: '2345678901',
    zoom_meeting_password: 'def456',
    class_type: 'one_time',
    recurring_days: null,
    recurring_start_time: null,
    recurring_end_time: null,
  },
  // Recurring class example
  {
    zoom_class_id: 6,
    zoom_class_name: 'Weekly Power Yoga',
    plan_id: 103,
    institute_id: 11,
    teacher_id: 503,
    start_time: null,
    end_time: null,
    zoom_url: 'https://zoom.us/j/3456789012?pwd=ghi789',
    zoom_meeting_id: '3456789012',
    zoom_meeting_password: 'ghi789',
    class_type: 'recurring',
    recurring_days: [1, 3, 5], // Monday, Wednesday, Friday
    recurring_start_time: '07:00', // 7:00 AM
    recurring_end_time: '08:00', // 8:00 AM
  },
  {
    zoom_class_id: 7,
    zoom_class_name: 'Daily Gentle Stretch',
    plan_id: 104,
    institute_id: 12,
    teacher_id: 504,
    start_time: null,
    end_time: null,
    zoom_url: 'https://zoom.us/j/4567890123?pwd=jkl012',
    zoom_meeting_id: '4567890123',
    zoom_meeting_password: 'jkl012',
    class_type: 'recurring',
    recurring_days: [0, 1, 2, 3, 4, 5, 6], // All days
    recurring_start_time: '18:30', // 6:30 PM
    recurring_end_time: '19:15', // 7:15 PM
  },
  // Another one-time class for completeness
  {
    zoom_class_id: 5,
    zoom_class_name: 'Pranayama and Meditation',
    plan_id: 105,
    institute_id: 13,
    teacher_id: 505,
    start_time: new Date('2025-10-09T02:00:00Z'),
    end_time: new Date('2025-10-09T03:00:00Z'),
    zoom_url: 'https://zoom.us/j/5678901234?pwd=mno345',
    zoom_meeting_id: '5678901234',
    zoom_meeting_password: 'mno345',
    class_type: 'one_time',
    recurring_days: null,
    recurring_start_time: null,
    recurring_end_time: null,
  },
]

const bulkCreateSampleData = async () => {
  const t = await sequelize.transaction()
  // // INSTITUTE
  // try {
  //   const ri = await Institute.bulkCreate(institutes, { transaction: t })
  //   //console.log(
  //     `Institutes sample data inserted : ${institutes.length}/${ri.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // // ROLE
  // try {
  //   const rr = await Role.bulkCreate(roles, { transaction: t })
  //   //console.log(`Roles sample data inserted : ${roles.length}/${rr.length}`)
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // // USER
  // try {
  //   const ru = await User.bulkCreate(users, { transaction: t })
  //   //console.log(`Users sample data inserted : ${users.length}/${ru.length}`)
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // USER_INSTITUTE
  // try {
  //   const rui = await UserInstitute.bulkCreate(user_institute, {
  //     transaction: t,
  //   })
  //   //console.log(
  //     `UserInstitute sample data inserted : ${user_institute.length}/${rui.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // USER_ROLE
  // try {
  //   const rur = await UserInstitutePlanRole.bulkCreate(
  //     user_institute_plan_role,
  //     {
  //       transaction: t,
  //     }
  //   )
  //   //console.log(
  //     `UserInstitutePlanRole sample data inserted : ${user_institute_plan_role.length}/${rur.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // PERMISSION
  // try {
  //   const rp = await Permission.bulkCreate(permissions, { transaction: t })
  //   //console.log(
  //     `Permissions sample data inserted : ${permissions.length}/${rp.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // ROLE_PERMSSION
  // try {
  //   const rrp = await RolePermission.bulkCreate(roles_perms, {
  //     transaction: t,
  //   })
  //   //console.log(
  //     `RolePermission sample data inserted : ${permissions.length}/${rrp.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // PLAN
  // try {
  //   const rpl = await Plan.bulkCreate(plans, { transaction: t })
  //   //console.log(`Plans sample data inserted : ${plans.length}/${rpl.length}`)
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // // CURRENCY
  // try {
  //   const rc = await Currency.bulkCreate(currency, { transaction: t })
  //   //console.log(
  //     `Currency sample data inserted : ${currency.length}/${rc.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // // // PLAN PRICING
  // try {
  //   const rpp = await PlanPricing.bulkCreate(plan_pricing, {
  //     transaction: t,
  //   })
  //   //console.log(
  //     `Plan pricing sample data inserted : ${plan_pricing.length}/${rpp.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // try {
  //   const rpp = await ZoomClassModel.bulkCreate(zoom_classes, {
  //     transaction: t,
  //   })
  //   //console.log(
  //     `Zoom class sample data inserted : ${zoom_classes.length}/${rpp.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }
  // try {
  //   const rupa = await UserPlanAttendance.bulkCreate(user_plan_attendance, {
  //     transaction: t,
  //   })
  //   //console.log(
  //     `UserPlanAttendance sample data inserted : ${user_plan_attendance.length}/${rupa.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }

  // // CLASS ATTENDANCE
  // try {
  //   const rca = await ClassAttendance.bulkCreate(class_attendance, {
  //     transaction: t,
  //   })
  //   //console.log(
  //     `ClassAttendance sample data inserted : ${class_attendance.length}/${rca.length}`
  //   )
  // } catch (err) {
  //   await t.rollback()
  //   throw err
  // }
  await t.commit()
}

module.exports = { bulkCreateSampleData }
