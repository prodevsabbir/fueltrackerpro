export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.substring(0, 3)}****@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return phone;
  const str = phone.toString();
  if (str.length <= 7) return str;
  return `${str.substring(0, 5)}*****${str.substring(str.length - 3)}`;
};
