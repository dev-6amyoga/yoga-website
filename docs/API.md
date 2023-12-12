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
-   POST /register-google [I]

#### Authenticated

-   POST /login [NI]
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

-   POST /get-by-id [I]
-   POST /get-by-username [I]
-   POST /get-by-email [I]
-   POST /get-by-phone [I]
-   POST /get-all-by-instituteid [I]
-   POST /get-all-by-planid [I]
-   POST /update-profile [I]
-   POST /update-password [I]
-   DELETE /delete-by-id [I]

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

-   GET /get-all [NI]

#### Authenticated

-   POST /create-plan [NI]
-   POST /update-plan [NI]

---

### UserPlan

Base URL : /user-plan

#### Open

None

#### Authenticated

-   POST /update [NI]

---

### Transaction

#### Open

None

#### Authenticated

TBD

---
