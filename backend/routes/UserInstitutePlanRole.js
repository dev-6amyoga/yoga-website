const express = require("express");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");
