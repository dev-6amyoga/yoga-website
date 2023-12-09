# API Documentation

Base URL : /api/v1

Naming convention - /module/dash-separated-endpoint

Legend :

-   HTTP Methods
    -   GET
    -   POST
    -   PUT
    -   DELETE
-   Implementation Status
    -   I : implemented
    -   NI : not implemented

## Modules

## Auth

Base URL : /auth

#### Open

-   POST /register

#### Authenticated

-   POST /login
-   POST /verify-google

---

### Institute

Base URL : /institute

#### Open

-   GET /info

#### Authenticated

-   POST /register
-   POST /update

---

### User

Base URL : /user

#### Open

#### Authenticated

-   POST /get-by-id
-   POST /get-by-username
-   POST /get-by-email
-   POST /get-all-by-instituteid
-   POST /get-all-by-planid
-   POST /update-profile
-   POST /change-password
-   POST /reset-password
-   DELETE /delete-by-id

---

### Role

#### Open

#### Open

None

#### Authenticated

TBD

---

### Permission

#### Open

None

#### Authenticated

TBD

---

### Plan

Base URL : /plan

#### Open

-   GET /get-all

#### Authenticated

-   POST /create-plan
-   POST /update-plan

---

### UserPlan

Base URL : /user-plan

#### Open

None

#### Authenticated

-   POST /update

---

### Transaction

#### Open

None

#### Authenticated

TBD

---
