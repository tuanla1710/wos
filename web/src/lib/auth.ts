export function afterAuthPath(user: { phone_verified?: boolean }) {
  return user.phone_verified ? "/" : "/verify-phone";
}
