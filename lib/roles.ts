export enum Role {
  Farmer = 'farmer',
  Operator = 'operator',
  Admin = 'admin',
}

/** Permission matrix – map an action name to the roles that are allowed to perform it. */
export const Permissions = {
  // Farmer actions
  viewOwnBookings: [Role.Farmer],
  createBooking: [Role.Farmer],
  submitTelemetry: [Role.Farmer, Role.Operator],
  viewOwnPass: [Role.Farmer],

  // Operator actions
  viewQueue: [Role.Operator, Role.Admin],
  syncBuffers: [Role.Operator, Role.Admin],
  controlGate: [Role.Operator, Role.Admin],

  // Admin actions
  manageMandis: [Role.Admin],
  resetDemo: [Role.Admin],
  viewAllOrders: [Role.Admin],
  viewStatistics: [Role.Admin],
  assignCollectorTask: [Role.Admin],
} as const;

/** Helper to test if a role can perform a given action. */
export const hasPermission = (role: Role, action: keyof typeof Permissions): boolean => {
  const allowed = Permissions[action] as readonly Role[];
  return allowed.includes(role);
};
