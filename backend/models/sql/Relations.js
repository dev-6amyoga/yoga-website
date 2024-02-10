const { Transaction } = require("./Transaction");
const { User } = require("./User");
const { ReferralCode } = require("./ReferralCode");
const { ReferralCodeUsage } = require("./ReferralCodeUsage");
const { Currency } = require("./Currency");
const { UserPlan } = require("./UserPlan");
const { Refund } = require("./Refund");
const { DiscountCoupon } = require("./DiscountCoupon");
const {
	DiscountCouponApplicablePlan,
} = require("./DiscountCouponApplicablePlan");
const { Plan } = require("./Plan");
const { PlanPricing } = require("./PlanPricing");
const { Invite } = require("./Invite");
const { LoginHistory } = require("./LoginHistory");
const { LoginToken } = require("./LoginToken");
const { Permission } = require("./Permission");
const { Role } = require("./Role");
const { RolePermission } = require("./RolePermission");
const { UpdateRequests } = require("./UpdateRequests");
const { UserInstitutePlanRole } = require("./UserInstitutePlanRole");
const { Institute } = require("./Institute");

// ----------------- UserInstitutePlanRole -----------------

UserInstitutePlanRole.belongsTo(User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
});
UserInstitutePlanRole.belongsTo(Role, {
	foreignKey: "role_id",
	onDelete: "SET NULL",
});
UserInstitutePlanRole.belongsTo(Institute, {
	foreignKey: "institute_id",
	onDelete: "SET NULL",
});
UserInstitutePlanRole.belongsTo(UserPlan, {
	foreignKey: "user_plan_id",
	onDelete: "SET NULL",
});

// ----------------- UserPlan -----------------

UserPlan.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
UserPlan.belongsTo(Plan, { foreignKey: "plan_id" });
UserPlan.belongsTo(Institute, { foreignKey: "institute_id" });

// ------------------ UpdateRequest  ------------------

UpdateRequests.belongsTo(User, { foreignKey: "user_id" });

// ---------------- RolePermission ------------------
RolePermission.belongsTo(Role, { foreignKey: "role_id" });
RolePermission.belongsTo(Permission, { foreignKey: "permission_id" });

// ----------------- DiscountCoupon -----------------
DiscountCoupon.belongsTo(User, {
	foreignKey: "linked_user_id",
	onDelete: "CASCADE",
});

// ---------- DiscountCouponApplicablePlan ----------
DiscountCouponApplicablePlan.belongsTo(DiscountCoupon, {
	foreignKey: "discount_coupon_id",
	onDelete: "CASCADE",
});

DiscountCouponApplicablePlan.belongsTo(Plan, {
	foreignKey: "plan_id",
	onDelete: "CASCADE",
});

// ----------------- Invite -----------------
Invite.belongsTo(
	User,
	{ foreignKey: "inviter_user_id" },
	{ onDelete: "cascade" }
);

Invite.belongsTo(
	User,
	{ foreignKey: "receiver_user_id" },
	{ onDelete: "cascade" }
);

// ----------------- LoginHistory -----------------
LoginHistory.belongsTo(User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

// ----------------- LoginToken -----------------

LoginToken.belongsTo(User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

// ----------------- PlanPricing -----------------
PlanPricing.belongsTo(Plan, { foreignKey: "plan_id", onDelete: "CASCADE" });

PlanPricing.belongsTo(Currency, {
	foreignKey: "currency_id",
	onDelete: "CASCADE",
});

// ----------------- ReferralCode -----------------
ReferralCode.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// ----------------- ReferralCodeUsage ----------------
ReferralCodeUsage.belongsTo(User, {
	foreignKey: "usage_user_id",
	onDelete: "CASCADE",
});

// ----------------- Transaction -----------------
Transaction.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

Transaction.hasOne(UserPlan, {
	foreignKeyConstraint: false,
	foreignKey: "transaction_order_id",
	sourceKey: "transaction_order_id",
});

Transaction.hasMany(Refund, {
	foreignKeyConstraint: false,
	foreignKey: "transaction_id",
	sourceKey: "transaction_id",
});

Transaction.belongsTo(DiscountCoupon, {
	foreignKey: "discount_coupon_id",
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});
Transaction.belongsTo(ReferralCode, {
	foreignKey: "referral_code_id",
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});

Transaction.belongsTo(Currency, {
	foreignKey: "currency_id",
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});

// ----------------- Refund -----------------
Refund.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

Refund.belongsTo(Transaction, {
	foreignKey: "transaction_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
