const controller = require("../controllers/api/locations/state.controller");
const cityController = require("../controllers/api/locations/city.controller");
const signatureController = require("../controllers/api/user/user_signature.controller");
const user = require("../controllers/api/user/start_day.controller");
const userAuth = require("../controllers/auth.controller");
const userProfile = require("../controllers/api/user/user_profile.controller");
const authJwt = require("../middleware/authJwt");
const express = require("express");
const router = express.Router();
const validation = require("../middleware/validation");
const distanceController = require("../controllers/api/user/distance.controller");
const userController = require("../controllers/api/user/user.controller");
const categoryController = require("../controllers/api/user/userCategory.controller");
const {
  checkDuplicateEmail,
  checkDuplicateEmpCode,
  checkDuplicatePhone,
} = require("../middleware/verifiySignUp");
const {
  getCustomerforAdminfromUser,
} = require("../controllers/api/sales/customer.controller");
const {
  getInvoiceFromBpcode,
} = require("../controllers/api/sales/eup_invoice.controller");



router.post(
  "/start_day",
  authJwt.verifyToken,
  [validation.validate("userDay")],
  user.startDay
);
router.get(
  "/travel/detail/:currentDate?/:lastDate?",
  authJwt.verifyToken,
  user.currentDayDetails
);
router.post("/running", authJwt.verifyToken, user.startDay);
router.post(
  "/end_day",
  authJwt.verifyToken,
  [validation.validate("userDay")],
  user.endDay
);
router.get("/getdistance", authJwt.verifyToken, distanceController.distance);
router.get("/profile", authJwt.verifyToken, userAuth.userDetails);
router.post(
  "/create-accesskey",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  userAuth.createAccessKey
);
router.get("/get_total_users", authJwt.verifyToken, userController.TotalUsers);
router.get("/getAllusers", authJwt.verifyToken, userController.getAllUsers);
router.get(
  "/getRelatedUser",
  authJwt.verifyToken,
  userController.getRelatedUser
);
router.get("/getuserids", authJwt.verifyToken, userController.getUserIds);
router.post(
  "/getuserdetail",
  authJwt.verifyToken,
  userController.getSingleUserDetails
);
router.get("/signature", signatureController.getSignature);
router.get("/travel_status", authJwt.verifyToken, user.getTravelStatus);

router.get(
  "/totalActiveUser",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  userController.getTotalActiveUsers
);
router.get(
  "/totalInactiveUser",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  userController.getTotalInactiveUsers
);
router.get(
  "/userBasicInfo",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  userController.getUsersBasicDetail
);
router.get(
  "/getnewusers/today",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  userController.NewUserToday
);

router.get(
  "/get/categoires",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  categoryController.getAllCategory
);
router.post(
  "/create/categoires",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  categoryController.createCategory
);
router.put(
  "/update/categoires/:id",
  [authJwt.verifyToken, authJwt.isAdminLogin, authJwt.checkEupheus],
  categoryController.updateCategory
);

router.get(
  "/admin/get/customers/:userid",
  [authJwt.verifyToken],
  getCustomerforAdminfromUser
);
router.post(
  "/admin/get/customers/invoices/list",
  [authJwt.verifyToken],
  getInvoiceFromBpcode
);

module.exports = router;
