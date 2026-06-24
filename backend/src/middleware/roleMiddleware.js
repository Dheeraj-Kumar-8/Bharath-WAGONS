const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(", ")}`,
    });
  }

  next();
};

export default allowRoles;

/*
  ── Usage Examples ──────────────────────────────────────────────

  import authMiddleware from "../middleware/authMiddleware.js";
  import allowRoles    from "../middleware/roleMiddleware.js";

  // Admin Routes — Manage / Create / Delete Users
  router.get   ("/users",        authMiddleware, allowRoles("admin"), getUsers);
  router.post  ("/users",        authMiddleware, allowRoles("admin"), createUser);
  router.delete("/users/:id",    authMiddleware, allowRoles("admin"), deleteUser);

  // Operator Routes — View Assigned Wagons / Update Wagon Status
  router.get   ("/wagons",       authMiddleware, allowRoles("operator"), getAssignedWagons);
  router.patch ("/wagons/:id",   authMiddleware, allowRoles("operator"), updateWagonStatus);

  // Analyst Routes — View Analytics / View Reports
  router.get   ("/analytics",    authMiddleware, allowRoles("analyst"), getAnalytics);
  router.get   ("/reports",      authMiddleware, allowRoles("analyst"), getReports);

  // Multi-role example
  router.get   ("/wagons/all",   authMiddleware, allowRoles("admin", "analyst"), getAllWagons);
*/
