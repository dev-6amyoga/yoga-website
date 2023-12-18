const { sequelize } = require('./init.sequelize');
const { Institute } = require('./models/sql/Institute');
const { Permission } = require('./models/sql/Permission');
const { Plan } = require('./models/sql/Plan');
const { Role } = require('./models/sql/Role');
const { User } = require('./models/sql/User');
const { UserInstitute } = require('./models/sql/UserInstitute');

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
];

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
];

const users = [
    {
        role_id: 1,
        institute_id: null,
        username: 'root',
        name: 'Root',
        email: 'root@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 2,
        institute_id: 1,
        username: 'ins1_owner',
        name: 'ins1_owner',
        email: 'ins1_owner@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 3,
        institute_id: 1,
        username: 'ins1_admin',
        name: 'ins1_admin',
        email: 'ins1_admin@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 4,
        institute_id: 1,
        username: 'ins1_teacher',
        name: 'ins1_teacher',
        email: 'ins1_teacher@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 2,
        institute_id: 2,
        username: 'ins2_owner',
        name: 'ins2_owner',
        email: 'ins2_owner@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 3,
        institute_id: 2,
        username: 'ins2_admin',
        name: 'ins2_admin',
        email: 'ins2_admin@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 4,
        institute_id: 2,
        username: 'ins2_teacher',
        name: 'ins2_teacher',
        email: 'ins2_teacher@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 5,
        institute_id: 1,
        username: 'student1',
        name: 'student1',
        email: 'student1@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
    {
        role_id: 5,
        institute_id: 2,
        username: 'student2',
        name: 'student2',
        email: 'student2@gmail.com',
        password:
            '$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6',
        is_google_login: false,
        last_login: null,
    },
];

const user_institute = [
    { user_id: 1, institute_id: null },
    { user_id: 2, institute_id: 1 },
    { user_id: 3, institute_id: 1 },
    { user_id: 4, institute_id: 1 },
    { user_id: 5, institute_id: 2 },
    { user_id: 6, institute_id: 2 },
    { user_id: 7, institute_id: 2 },
    { user_id: 8, institute_id: 1 },
    { user_id: 9, institute_id: 2 },
];

const permissions = [];

const plans = [
    {
        name: 'Fixed',
        has_basic_playlist: true,
        has_playlist_creation: false,
        playlist_creation_limit: 0,
        has_self_audio_upload: false,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Fixed',
        has_basic_playlist: true,
        has_playlist_creation: false,
        playlist_creation_limit: 0,
        has_self_audio_upload: false,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Fixed',
        has_basic_playlist: true,
        has_playlist_creation: false,
        playlist_creation_limit: 0,
        has_self_audio_upload: false,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Fixed',
        has_basic_playlist: true,
        has_playlist_creation: false,
        playlist_creation_limit: 0,
        has_self_audio_upload: false,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: false,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: false,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: false,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: false,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: false,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: false,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: false,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: false,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: false,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: false,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: false,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: false,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: false,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: false,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: false,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Tailor Made',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: false,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: true,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: true,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: true,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: true,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: true,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: true,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: true,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: true,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: true,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: true,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: true,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: true,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: true,
        number_of_teachers: 5,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: true,
        number_of_teachers: 10,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: true,
        number_of_teachers: 15,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Master Plan',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: true,
        number_of_teachers: 100000,
        plan_validity: 0,
        plan_user_type: 'institute',
    },
    {
        name: 'Fixed Plan Student',
        has_basic_playlist: true,
        has_playlist_creation: false,
        playlist_creation_limit: 0,
        has_self_audio_upload: false,
        number_of_teachers: 0,
        plan_validity: 0,
        plan_user_type: 'student',
    },
    {
        name: 'Tailor Made Plan Student',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 5,
        has_self_audio_upload: false,
        number_of_teachers: 0,
        plan_validity: 0,
        plan_user_type: 'student',
    },
    {
        name: 'Tailor Made Plan Student',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 10,
        has_self_audio_upload: false,
        number_of_teachers: 0,
        plan_validity: 0,
        plan_user_type: 'student',
    },
    {
        name: 'Tailor Made Plan Student',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 15,
        has_self_audio_upload: false,
        number_of_teachers: 0,
        plan_validity: 0,
        plan_user_type: 'student',
    },
    {
        name: 'Tailor Made Plan Student',
        has_basic_playlist: true,
        has_playlist_creation: true,
        playlist_creation_limit: 1000000,
        has_self_audio_upload: false,
        number_of_teachers: 0,
        plan_validity: 0,
        plan_user_type: 'student',
    },
];

const bulkCreateSampleData = async () => {
    const t = await sequelize.transaction();
    // INSTITUTE
    try {
        const ri = await Institute.bulkCreate(institutes, { transaction: t });
        console.log(
            `Institutes sample data inserted : ${institutes.length}/${ri.length}`
        );
    } catch (err) {
        await t.rollback();
        throw err;
    }

    // ROLE
    try {
        const rr = await Role.bulkCreate(roles, { transaction: t });
        console.log(
            `Roles sample data inserted : ${roles.length}/${rr.length}`
        );
    } catch (err) {
        await t.rollback();
        throw err;
    }

    // USER
    try {
        const ru = await User.bulkCreate(users, { transaction: t });
        console.log(
            `Users sample data inserted : ${users.length}/${ru.length}`
        );
    } catch (err) {
        await t.rollback();
        throw err;
    }

    // USER_INSTITUTE
    try {
        const rui = await UserInstitute.bulkCreate(user_institute, {
            transaction: t,
        });
        console.log(
            `UserInstitute sample data inserted : ${user_institute.length}/${rui.length}`
        );
    } catch (err) {
        await t.rollback();
        throw err;
    }

    // PERMISSION
    try {
        const rp = await Permission.bulkCreate(permissions, { transaction: t });
        console.log(
            `Permissions sample data inserted : ${permissions.length}/${rp.length}`
        );
    } catch (err) {
        await t.rollback();
        throw err;
    }

    // PLAN
    try {
        const rpl = await Plan.bulkCreate(plans, { transaction: t });
        console.log(
            `Plans sample data inserted : ${plans.length}/${rpl.length}`
        );
    } catch (err) {
        await t.rollback();
        throw err;
    }

    await t.commit();
};
//         })
//         .catch((err) => {
//             console.error('Error creating institutes : ', err);
//         });
// };
module.exports = { bulkCreateSampleData };
