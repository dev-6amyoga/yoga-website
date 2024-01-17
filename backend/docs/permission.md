# Permissions and Roles

## Models

SQL

-   User [x]
-   Role [x]
-   Permission [x]
-   RolePermission
-   UserRole [not implemented]
-   Institute [x]
-   UserInstitute
-   LoginHistory [not implemented]
-   LoginToken [not implemented]
-   ReferralCode [x]
-   ReferralCodeUsage
-   Plan [x]
-   UserPlan
-   PlanPricing [to be edited]
-   Invite [x]
-   DiscountCoupon [x]
-   DiscountCouponApplicablePlan
-   Currency [x]

MONGODB

-   Asana [x]
-   Language [x]
-   Playlist [x]
-   PlaylistUser
-   UserPlaylistCount

## Permissions

user

-   USER_CREATE
-   USER_READ
-   USER_UPDATE
-   USER_DELETE

role

-   ROLE_CREATE
-   ROLE_READ
-   ROLE_UPDATE
-   ROLE_DELETE

permission

-   PERMISSION_CREATE
-   PERMISSION_READ
-   PERMISSION_UPDATE
-   PERMISSION_DELETE

Institute

-   INSTITUTE_CREATE
-   INSTITUTE_READ
-   INSTITUTE_UPDATE
-   INSTITUTE_DELETE

Plan

-   PLAN_CREATE
-   PLAN_READ
-   PLAN_UPDATE
-   PLAN_DELETE

ReferralCode

-   REFERRAL_CODE_CREATE
-   REFERRAL_CODE_READ
-   REFERRAL_CODE_UPDATE
-   REFERRAL_CODE_DELETE

DiscountCoupon

-   DISCOUNT_COUPON_CREATE
-   DISCOUNT_COUPON_READ
-   DISCOUNT_COUPON_UPDATE
-   DISCOUNT_COUPON_DELETE

Currency

-   CURRENCY_CREATE
-   CURRENCY_READ
-   CURRENCY_UPDATE
-   CURRENCY_DELETE

Asana

-   ASANA_CREATE
-   ASANA_READ
-   ASANA_UPDATE
-   ASANA_DELETE

Playlist

-   PLAYLIST_CREATE
-   PLAYLIST_READ
-   PLAYLIST_UPDATE
-   PLAYLIST_DELETE

Language

-   LANGUAGE_CREATE
-   LANGUAGE_READ
-   LANGUAGE_UPDATE
-   LANGUAGE_DELETE

## Roles

-   ROOT

    -   user : USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE
    -   role : ROLE_CREATE, ROLE_READ, ROLE_UPDATE, ROLE_DELETE
    -   permission : PERMISSION_CREATE, PERMISSION_READ, PERMISSION_UPDATE,
        PERMISSION_DELETE
    -   institute : INSTITUTE_CREATE, INSTITUTE_READ, INSTITUTE_UPDATE,
        INSTITUTE_DELETE
    -   plan : PLAN_CREATE, PLAN_READ, PLAN_UPDATE, PLAN_DELETE
    -   referral_code : REFERRAL_CODE_CREATE, REFERRAL_CODE_READ,
        REFERRAL_CODE_UPDATE, REFERRAL_CODE_DELETE
    -   discount_coupon : DISCOUNT_COUPON_CREATE, DISCOUNT_COUPON_READ,
        DISCOUNT_COUPON_UPDATE, DISCOUNT_COUPON_DELETE
    -   currency : CURRENCY_CREATE, CURRENCY_READ, CURRENCY_UPDATE,
        CURRENCY_DELETE
    -   asana : ASANA_CREATE, ASANA_READ, ASANA_UPDATE, ASANA_DELETE
    -   playlist : PLAYLIST_CREATE, PLAYLIST_READ, PLAYLIST_UPDATE,
        PLAYLIST_DELETE
    -   language : LANGUAGE_CREATE, LANGUAGE_READ, LANGUAGE_UPDATE,
        LANGUAGE_DELETE

-   INSTITUTE_OWNER

    -   user : USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE
    -   role : ROLE_READ
    -   permission : PERMISSION_READ
    -   institute : INSTITUTE_CREATE, INSTITUTE_READ, INSTITUTE_UPDATE,
        INSTITUTE_DELETE
    -   plan : PLAN_READ
    -   referral_code : REFERRAL_CODE_CREATE, REFERRAL_CODE_READ
    -   discount_coupon : DISCOUNT_COUPON_READ
    -   currency : CURRENCY_READ
    -   asana : ASANA_READ
    -   playlist : PLAYLIST_READ
    -   language : LANGUAGE_READ

-   INSTITUTE_ADMIN

-   TEACHER

-   STUDENT
