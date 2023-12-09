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

-   POST /register [I]
-   POST /register-google [NI]

#### Authenticated

-   POST /login [I]
-   POST /verify-google [I]

---

### Institute

Base URL : /institute

#### Open

-   GET /info [NI]

#### Authenticated

-   POST /register [NI]
-   POST /update [NI]

---

### User

Base URL : /user

#### Open

#### Authenticated

-   POST /get-by-id [NI]
-   POST /get-by-username [NI]
-   POST /get-by-email [NI]
-   POST /get-all-by-instituteid [NI]
-   POST /get-all-by-planid [NI]
-   POST /update-profile [NI]
-   POST /change-password [NI]
-   POST /reset-password [NI]
-   DELETE /delete-by-id [NI]

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
